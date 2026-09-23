"""De webserver: API onder /api, de app zelf (PWA) onder /."""

import time

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlmodel import Session

from . import __version__
import base64

from . import feelfit, hevy
from .auth import check_password, make_token, require_auth
from .config import WEB_DIR, get_settings
from .db import Record, get_session, next_seq, select
from .export import export_csv, export_json
from .sync import SyncRequest, SyncResponse, apply_sync, seed_if_empty

app = FastAPI(title="Veergym", version=__version__)


@app.middleware("http")
async def no_stale_files(request, call_next):
    # Laat de browser altijd even checken of er een nieuwere versie is (goedkoop via ETag),
    # zodat een update van de app direct zichtbaar is.
    response = await call_next(request)
    response.headers.setdefault("Cache-Control", "no-cache")
    return response


class LoginRequest(BaseModel):
    password: str


@app.get("/api/health")
def health():
    return {"ok": True, "version": __version__, "password_set": bool(get_settings().app_password)}


@app.post("/api/login")
def login(req: LoginRequest):
    if not get_settings().app_password:
        raise HTTPException(503, "Er is nog geen APP_PASSWORD ingesteld in .env")
    if not check_password(req.password):
        time.sleep(1)  # afremmen van raden
        raise HTTPException(401, "Onjuist wachtwoord")
    return {"token": make_token()}


@app.post("/api/sync", response_model=SyncResponse, dependencies=[Depends(require_auth)])
def sync(req: SyncRequest, session: Session = Depends(get_session)):
    return apply_sync(session, req)


@app.get("/api/export.json", dependencies=[Depends(require_auth)])
def export_as_json(session: Session = Depends(get_session)):
    return JSONResponse(export_json(session), headers={"Content-Disposition": 'attachment; filename="veergym.json"'})


@app.get("/api/export.csv", dependencies=[Depends(require_auth)])
def export_as_csv(session: Session = Depends(get_session)):
    return PlainTextResponse(
        export_csv(session),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="veergym-workouts.csv"'},
    )


class HevyPreviewRequest(BaseModel):
    csv: str


class HevyImportRequest(BaseModel):
    csv: str
    choices: dict[str, str] = {}
    titles: dict[str, dict] = {}


def _exercises(session: Session) -> list[dict]:
    rows = session.exec(select(Record).where(Record.kind == "exercise", Record.deleted == False)).all()  # noqa: E712
    return [{"id": r.id, **r.data} for r in rows]


def _workout_ids(session: Session) -> set[str]:
    # Ook verwijderde workouts tellen mee: wat je weggooide, komt niet terug bij een nieuwe import.
    return set(session.exec(select(Record.id).where(Record.kind == "workout")).all())


@app.post("/api/import/hevy/preview", dependencies=[Depends(require_auth)])
def hevy_preview(req: HevyPreviewRequest, session: Session = Depends(get_session)):
    seed_if_empty(session)
    try:
        return hevy.preview(req.csv, _exercises(session), get_settings().timezone, _workout_ids(session))
    except hevy.HevyError as e:
        raise HTTPException(400, str(e))


@app.post("/api/import/hevy", dependencies=[Depends(require_auth)])
def hevy_import(req: HevyImportRequest, session: Session = Depends(get_session)):
    seed_if_empty(session)
    exercises = _exercises(session)
    try:
        records, report = hevy.build_records(req.csv, req.choices, exercises, _workout_ids(session),
                                             int(time.time() * 1000), get_settings().timezone, req.titles)
    except hevy.HevyError as e:
        raise HTTPException(400, str(e))
    for rec in records:
        row = session.get(Record, rec["id"]) or Record(id=rec["id"], kind=rec["kind"])
        row.kind, row.data, row.updated_at, row.deleted = rec["kind"], rec["data"], rec["updated_at"], False
        row.seq = next_seq(session)
        session.add(row)
    session.commit()
    ex_map = {e["id"]: e for e in exercises} | {r["id"]: r["data"] for r in records if r["kind"] == "exercise"}
    return {**report, "checks": hevy.progress_checks(records, ex_map, top=5)}


class UploadedFile(BaseModel):
    name: str
    data: str  # base64


class FeelfitRequest(BaseModel):
    files: list[UploadedFile]


@app.post("/api/import/feelfit", dependencies=[Depends(require_auth)])
def feelfit_import(req: FeelfitRequest):
    """Leest Feelfit-exports en geeft de wegingen terug; de app slaat ze op als metingen."""
    try:
        files = [(f.name, base64.b64decode(f.data)) for f in req.files]
        return feelfit.parse(files)
    except (feelfit.FeelfitError, ValueError) as e:
        raise HTTPException(400, str(e))


@app.get("/sw.js", include_in_schema=False)
def service_worker():
    # Zonder cache, zodat een nieuwe versie van de app direct wordt opgepikt.
    return FileResponse(WEB_DIR / "sw.js", media_type="text/javascript", headers={"Cache-Control": "no-cache"})


app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="web")
