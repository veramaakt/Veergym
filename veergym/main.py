"""De webserver: API onder /api, de app zelf (PWA) onder /."""

import time

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlmodel import Session

from . import __version__
from .auth import check_password, make_token, require_auth
from .config import WEB_DIR, get_settings
from .db import get_session
from .export import export_csv, export_json
from .sync import SyncRequest, SyncResponse, apply_sync

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


@app.get("/sw.js", include_in_schema=False)
def service_worker():
    # Zonder cache, zodat een nieuwe versie van de app direct wordt opgepikt.
    return FileResponse(WEB_DIR / "sw.js", media_type="text/javascript", headers={"Cache-Control": "no-cache"})


app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="web")
