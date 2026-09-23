"""Synchronisatie tussen apparaten (telefoon, desktop) en de server.

Protocol: het apparaat stuurt zijn gewijzigde records plus de laatste `cursor`
(seq) die het kent. De server bewaart wat nieuwer is ("laatste wijziging wint")
en stuurt alles terug wat sinds die cursor veranderd is.
"""

from pydantic import BaseModel, Field
from sqlmodel import Session, select

from .db import KINDS, Record, next_seq
from .exercises import seed_records


class Change(BaseModel):
    id: str = Field(max_length=64)
    kind: str
    data: dict = {}
    updated_at: int
    deleted: bool = False


class SyncRequest(BaseModel):
    cursor: int = 0
    changes: list[Change] = []


class SyncResponse(BaseModel):
    cursor: int
    changes: list[Change]
    rejected: list[str] = []


def seed_if_empty(session: Session) -> None:
    if session.exec(select(Record).limit(1)).first() is not None:
        return
    for rec in seed_records():
        session.add(Record(**rec, seq=next_seq(session)))
    session.commit()


def apply_sync(session: Session, req: SyncRequest) -> SyncResponse:
    seed_if_empty(session)
    rejected: list[str] = []
    for ch in req.changes:
        if ch.kind not in KINDS:
            rejected.append(ch.id)
            continue
        existing = session.get(Record, ch.id)
        if existing is not None and existing.updated_at > ch.updated_at:
            continue  # server heeft een nieuwere versie; die gaat terug naar het apparaat
        if existing is None:
            existing = Record(id=ch.id, kind=ch.kind)
        existing.kind = ch.kind
        existing.data = ch.data
        existing.updated_at = ch.updated_at
        existing.deleted = ch.deleted
        existing.seq = next_seq(session)
        session.add(existing)
    session.commit()

    rows = session.exec(select(Record).where(Record.seq > req.cursor).order_by(Record.seq)).all()
    cursor = max([req.cursor] + [r.seq for r in rows])
    return SyncResponse(
        cursor=cursor,
        changes=[Change(id=r.id, kind=r.kind, data=r.data, updated_at=r.updated_at, deleted=r.deleted) for r in rows],
        rejected=rejected,
    )
