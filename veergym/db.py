"""Database: één tabel met records, zodat synchronisatie eenvoudig blijft.

Elk record heeft een soort (`kind`, bijv. "workout" of "exercise"), een uniek
id, de inhoud als JSON, een tijdstip van laatste wijziging (`updated_at`, in
milliseconden, gezet door het apparaat dat de wijziging deed) en een
`deleted`-vlag. `seq` is een oplopend volgnummer van de server; apparaten
vragen "alles na seq X" op.

Een nieuw soort gegevens toevoegen vraagt dus geen databasemigratie.
"""

from sqlalchemy import JSON, Column
from sqlmodel import Field, Session, SQLModel, create_engine, select

from .config import get_settings

KINDS = {
    "folder",
    "exercise",
    "template",
    "workout",
    "settings",
    # voorbereid voor latere stappen
    "measurement",
    "food",
    "goals",
    "healthday",
    "workouthealth",
}


class Record(SQLModel, table=True):
    id: str = Field(primary_key=True, max_length=64)
    kind: str = Field(index=True, max_length=32)
    data: dict = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    updated_at: int = Field(default=0, index=True)
    deleted: bool = Field(default=False)
    seq: int = Field(default=0, index=True)


class Counter(SQLModel, table=True):
    name: str = Field(primary_key=True)
    value: int = 0


_engine = None


def engine():
    global _engine
    if _engine is None:
        url = get_settings().database_url
        args = {"check_same_thread": False} if url.startswith("sqlite") else {}
        _engine = create_engine(url, connect_args=args)
        SQLModel.metadata.create_all(_engine)
    return _engine


def reset_engine() -> None:
    """Alleen voor tests."""
    global _engine
    _engine = None


def next_seq(session: Session) -> int:
    counter = session.get(Counter, "seq")
    if counter is None:
        counter = Counter(name="seq", value=0)
    counter.value += 1
    session.add(counter)
    return counter.value


def get_session():
    with Session(engine()) as session:
        yield session


__all__ = ["KINDS", "Record", "Session", "engine", "get_session", "next_seq", "select"]
