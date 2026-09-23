"""Import van de Feelfit-weegschaal (Feelfit-app: account > gegevens exporteren, Excel).

Leest één of meer exports en geeft per dag één weging terug (de vroegste van die dag,
meestal de ochtendweging): gewicht plus lichaamssamenstelling. De app bewaart die als
metingen; bestaande waarden op dezelfde dag blijven staan.
"""

import csv
import io
import re
from datetime import datetime

LB = 0.45359237

# Kolomnaam (zonder spaties/leestekens, kleine letters) -> sleutel in de app.
COLUMNS = {
    "lichaamsvet": "fat_pct", "bodyfat": "fat_pct",
    "lichaamsvetmassa": "fat_kg", "fatmass": "fat_kg",
    "spiermassa": "muscle_kg", "musclemass": "muscle_kg",
    "skeletspieren": "skeletal_pct", "skeletalmuscle": "skeletal_pct",
    "vetvrijlichaamsgewicht": "fatfree_kg", "fatfreebodyweight": "fatfree_kg", "leanbodymass": "fatfree_kg",
    "visceraalvet": "visceral", "visceralfat": "visceral",
    "lichaamswater": "water_pct", "bodywater": "water_pct",
    "botmassa": "bone_kg", "bonemass": "bone_kg",
    "bmr": "bmr",
    "eiwitgehalte": "protein_pct", "protein": "protein_pct",
    "onderhuidsvet": "subcut_pct", "subcutaneousfat": "subcut_pct",
    "metabolischeleeftijd": "meta_age", "metabolicage": "meta_age",
    "bmi": "bmi",
}
TIME_COLS = {"tijdvanmeting", "measurementtime", "time", "datum", "date"}
KG_KEYS = {"fat_kg", "muscle_kg", "fatfree_kg", "bone_kg"}


class FeelfitError(ValueError):
    pass


def _key(header: str) -> tuple[str, str]:
    """'Gewicht(kg)' -> ('gewicht', 'kg')."""
    h = str(header or "").strip().lower()
    unit = ""
    m = re.search(r"\(([^)]*)\)", h)
    if m:
        unit = m.group(1).strip()
        h = h[: m.start()]
    return re.sub(r"[^a-z]", "", h), unit


def _num(v):
    if v is None or str(v).strip() == "":
        return None
    try:
        return float(str(v).replace(",", "."))
    except ValueError:
        return None


def _time(v) -> datetime | None:
    if isinstance(v, datetime):
        return v
    s = str(v or "").strip()
    for fmt in ("%d/%m/%Y %H:%M:%S", "%d/%m/%Y %H:%M", "%d-%m-%Y %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H:%M:%S", "%d/%m/%Y"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


def _rows(data: bytes, filename: str) -> list[tuple]:
    if filename.lower().endswith((".xlsx", ".xlsm")):
        import openpyxl

        try:
            wb = openpyxl.load_workbook(io.BytesIO(data), read_only=True, data_only=True)
        except Exception as e:  # noqa: BLE001 - kapot of geen Excel-bestand
            raise FeelfitError(f"{filename}: dit Excel-bestand kan ik niet openen ({e.__class__.__name__}).")
        return [r for ws in wb.worksheets for r in ws.iter_rows(values_only=True)]
    text = data.decode("utf-8-sig", errors="replace")
    delim = ";" if text.split("\n", 1)[0].count(";") > text.split("\n", 1)[0].count(",") else ","
    return [tuple(r) for r in csv.reader(io.StringIO(text), delimiter=delim)]


def parse(files: list[tuple[str, bytes]]) -> dict:
    """
    files: [(bestandsnaam, inhoud)]. Geeft {rows: [{date, time, weight, body: {...}}], weighings, first, last}.
    Eén rij per dag, oudste eerst.
    """
    per_day: dict[str, dict] = {}
    weighings = 0
    for filename, data in files:
        rows = _rows(data, filename)
        hi = next((i for i, r in enumerate(rows) if any(_key(c)[0] in TIME_COLS for c in r if c)), None)
        if hi is None:
            raise FeelfitError(f'{filename}: geen kolom "Tijd van meting" gevonden. Is dit een Feelfit-export?')
        cols = []
        for h in rows[hi]:
            k, unit = _key(h)
            if k in TIME_COLS:
                cols.append(("time", None))
            elif k in ("gewicht", "weight"):
                cols.append(("weight", LB if unit in ("lb", "lbs") else 1.0))
            elif k in COLUMNS:
                cols.append((COLUMNS[k], LB if unit in ("lb", "lbs") and COLUMNS[k] in KG_KEYS else 1.0))
            else:
                cols.append((None, None))
        for r in rows[hi + 1:]:
            rec = {"time": None, "weight": None, "body": {}}
            for (key, factor), v in zip(cols, r):
                if key == "time":
                    rec["time"] = _time(v)
                elif key == "weight":
                    n = _num(v)
                    rec["weight"] = round(n * factor, 2) if n is not None else None
                elif key:
                    n = _num(v)
                    if n is not None:
                        rec["body"][key] = round(n * factor, 2)
            if not rec["time"] or rec["weight"] is None:
                continue
            weighings += 1
            day = rec["time"].strftime("%Y-%m-%d")
            if day not in per_day or rec["time"] < per_day[day]["time"]:
                per_day[day] = rec
    if not per_day:
        raise FeelfitError("Geen wegingen gevonden in de gekozen bestanden.")
    out = [{"date": d, "time": r["time"].strftime("%H:%M"), "weight": r["weight"], "body": r["body"]}
           for d, r in sorted(per_day.items())]
    return {"rows": out, "weighings": weighings, "first": out[0]["date"], "last": out[-1]["date"]}
