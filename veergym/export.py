"""Export van al je data: JSON (alles) en CSV (één rij per set, zoals Hevy)."""

import csv
import io
from datetime import datetime, timezone

from sqlmodel import Session, select

from .db import Record

CSV_COLUMNS = [
    "title", "start_time", "end_time", "description", "exercise_title", "exercise_notes",
    "set_index", "set_type", "weight_kg", "reps", "distance_km", "duration_seconds", "rpe", "session_rpe",
]


def all_records(session: Session) -> list[Record]:
    return list(session.exec(select(Record).where(Record.deleted == False).order_by(Record.kind, Record.id)))  # noqa: E712


def export_json(session: Session) -> dict:
    by_kind: dict[str, list] = {}
    for r in all_records(session):
        by_kind.setdefault(r.kind, []).append({"id": r.id, "updated_at": r.updated_at, **r.data})
    return {"app": "veergym", "exported_at": datetime.now(timezone.utc).isoformat(), "data": by_kind}


def _iso(ms) -> str:
    if not ms:
        return ""
    return datetime.fromtimestamp(ms / 1000).strftime("%Y-%m-%d %H:%M")


def export_csv(session: Session) -> str:
    records = all_records(session)
    names = {r.id: r.data.get("name", r.id) for r in records if r.kind == "exercise"}
    workouts = sorted((r for r in records if r.kind == "workout"), key=lambda r: r.data.get("start", 0), reverse=True)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(CSV_COLUMNS)
    for w in workouts:
        d = w.data
        for item in d.get("items", []):
            for i, s in enumerate(item.get("sets", [])):
                writer.writerow([
                    d.get("title", ""), _iso(d.get("start")), _iso(d.get("end")), d.get("note", ""),
                    names.get(item.get("exercise"), item.get("exercise", "")), item.get("note", ""),
                    i, s.get("type", "normal"), s.get("w", ""), s.get("r", ""), s.get("dist", ""),
                    s.get("dur", ""), s.get("rpe", ""), d.get("rpe", ""),
                ])
    return buf.getvalue()
