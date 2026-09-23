"""Import van je Hevy-historie (CSV-export: Profiel > Instellingen > Export & Import Data).

Twee stappen:
1. `preview(csv_text, exercises)`: leest het bestand en stelt per Hevy-oefeningsnaam een
   koppeling voor met een oefening in de app (of "nieuwe oefening").
2. `build_records(csv_text, choices, exercises, existing_ids)`: maakt de records aan
   (nieuwe oefeningen + workouts) op basis van jouw keuzes.

Workouts krijgen een vast id op basis van starttijd + titel. Een tweede import van een
nieuwere export slaat workouts die er al zijn dus gewoon over.
"""

import csv
import hashlib
import io
import re
from collections import Counter, defaultdict
from datetime import datetime
from difflib import SequenceMatcher
from zoneinfo import ZoneInfo

from .exercises import GROUPS, slug

LBS = 0.45359237
MILE = 1.609344
SET_TYPES = {"normal", "warmup", "dropset", "failure"}

# Veelvoorkomende typefouten en varianten in zelf getypte Hevy-namen.
TYPOS = [(r"\bsquad\b", "squat"), (r"\bsmit\b", "smith"), (r"\brdl\b", "romanian deadlift"), (r"\bdb\b", "dumbbell")]

# Spiergroep raden uit de naam (eerste treffer wint).
GROUP_WORDS = [
    ("Cardio", ["running", "hardlopen", "treadmill", "loopband", "bike", "cycling", "fietsen", "rowing machine", "elliptical", "crosstrainer", "stair"]),
    ("Billen", ["glute", "hip thrust", "abduction", "adduction", "kickback", "frog pump", "bridge"]),
    ("Schouders", ["shoulder", "lateral raise", "front raise", "rear delt", "face pull", "overhead press", "arnold", "reverse fly"]),
    ("Rug", ["row", "pulldown", "pull up", "chin up", "pullover", "back extension", "hyperextension", "shrug"]),
    ("Borst", ["bench", "chest", "pec", "fly", "push up", "dip"]),
    ("Benen", ["squat", "leg press", "leg extension", "leg curl", "lunge", "deadlift", "rdl", "calf", "split", "wall sit", "step up"]),
    ("Armen", ["curl", "tricep", "skullcrusher", "pushdown", "extension"]),
    ("Core", ["crunch", "plank", "sit up", "knee raise", "leg raise", "russian twist", "torso", "ab ", "abs", "dead bug", "pallof"]),
]


class HevyError(ValueError):
    pass


# ---------- inlezen ----------

def _num(v):
    if v is None or str(v).strip() == "":
        return None
    try:
        return float(str(v).replace(",", "."))
    except ValueError:
        return None


def _clean(n):
    if n is None:
        return None
    return int(n) if float(n).is_integer() else round(n, 2)


def parse_time(text: str, tz: str) -> int:
    """'2 Sep 2026, 17:52' -> epoch-milliseconden (lokale tijd)."""
    text = text.strip()
    for fmt in ("%d %b %Y, %H:%M", "%d %b %Y, %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S"):
        try:
            dt = datetime.strptime(text, fmt)
            return int(dt.replace(tzinfo=ZoneInfo(tz)).timestamp() * 1000)
        except ValueError:
            continue
    raise HevyError(f"Onbekend datumformaat: {text!r}")


def read_rows(csv_text: str, tz: str = "Europe/Amsterdam") -> list[dict]:
    """Lees de CSV en zet elke rij om naar één set met nette eenheden (kg, km, seconden)."""
    reader = csv.DictReader(io.StringIO(csv_text.lstrip("\ufeff")))
    cols = set(reader.fieldnames or [])
    needed = {"title", "start_time", "exercise_title"}
    if not needed <= cols:
        raise HevyError("Dit lijkt geen Hevy-export: kolommen " + ", ".join(sorted(needed - cols)) + " ontbreken.")
    w_col, w_factor = ("weight_kg", 1.0) if "weight_kg" in cols else ("weight_lbs", LBS) if "weight_lbs" in cols else (None, 1)
    d_col, d_factor = ("distance_km", 1.0) if "distance_km" in cols else ("distance_miles", MILE) if "distance_miles" in cols else (None, 1)

    rows = []
    for r in reader:
        if not (r.get("exercise_title") or "").strip():
            continue
        w = _num(r.get(w_col)) if w_col else None
        dist = _num(r.get(d_col)) if d_col else None
        rows.append({
            "title": (r.get("title") or "").strip() or "Workout",
            "start_raw": r["start_time"].strip(),
            "start": parse_time(r["start_time"], tz),
            "end": parse_time(r["end_time"], tz) if (r.get("end_time") or "").strip() else None,
            "description": (r.get("description") or "").strip(),
            "exercise": r["exercise_title"].strip(),
            "notes": (r.get("exercise_notes") or "").strip(),
            "set_index": int(_num(r.get("set_index")) or 0),
            "type": (r.get("set_type") or "normal").strip().lower() if (r.get("set_type") or "normal").strip().lower() in SET_TYPES else "normal",
            "w": _clean(w * w_factor) if w is not None else None,
            "r": _clean(_num(r.get("reps"))),
            "dist": _clean(dist * d_factor) if dist is not None else None,
            "dur": _clean(_num(r.get("duration_seconds"))),
            "rpe": _clean(_num(r.get("rpe"))),
        })
    if not rows:
        raise HevyError("Het bestand bevat geen sets.")
    return rows


def workout_id(start_raw: str, title: str) -> str:
    return "hevy-" + hashlib.sha1(f"{start_raw}|{title}".encode()).hexdigest()[:16]


# ---------- oefeningen herkennen ----------

def normalize(name: str) -> str:
    n = name.lower()
    for pat, rep in TYPOS:
        n = re.sub(pat, rep, n)
    n = re.sub(r"[^a-z0-9]+", " ", n)
    return re.sub(r"\s+", " ", n).strip()


def guess_type(name: str, sets: list[dict]) -> str:
    n = name.lower()
    if "assisted" in n:
        return "assist"
    if any(s["dist"] for s in sets) and any(s["dur"] for s in sets) and not any(s["w"] for s in sets):
        return "afstand"
    if any(s["dur"] for s in sets) and not any(s["r"] for s in sets):
        return "duur"
    if not any(s["w"] for s in sets):
        return "reps"
    return "kg"


def guess_group(name: str) -> str | None:
    n = " " + normalize(name) + " "
    for group, words in GROUP_WORDS:
        if any((" " + w) in n for w in words):
            return group
    return None


def guess_equip(name: str) -> str:
    n = name.lower()
    for word, label in (("smith", "Smith"), ("smit ", "Smith"), ("cable", "Kabel"), ("machine", "Machine"), ("barbell", "Barbell"),
                        ("dumbbell", "Dumbbell"), ("pec deck", "Machine"), ("assisted", "Machine")):
        if word in n:
            return label
    return ""


EQUIPMENT = {"barbell", "dumbbell", "cable", "machine", "smith", "kettlebell", "band", "plates"}


def _equipment(normalized: str) -> set[str]:
    return set(normalized.split()) & EQUIPMENT


def suggest(name: str, exercises: list[dict]) -> tuple[str | None, float]:
    """Beste bestaande oefening voor een Hevy-naam, met zekerheid 0..1."""
    target = normalize(name)
    best, score = None, 0.0
    for ex in exercises:
        cand = normalize(ex["name"])
        if cand == target:
            return ex["id"], 1.0
        eq_a, eq_b = _equipment(target), _equipment(cand)
        if eq_a and eq_b and not (eq_a & eq_b):
            continue  # bijv. Barbell vs Dumbbell: echt een andere oefening
        s = SequenceMatcher(None, target, cand).ratio()
        if s > score:
            best, score = ex["id"], s
    return (best, score) if score >= 0.88 else (None, score)


def preview(csv_text: str, exercises: list[dict], tz: str = "Europe/Amsterdam", existing_ids: set[str] = frozenset()) -> dict:
    rows = read_rows(csv_text, tz)
    workouts = {}
    for r in rows:
        workouts.setdefault(workout_id(r["start_raw"], r["title"]), r)
    by_ex = defaultdict(list)
    for r in rows:
        by_ex[r["exercise"]].append(r)
    titles = Counter()
    for wid, r in workouts.items():
        titles[r["title"]] += 1

    names = []
    for name, sets in sorted(by_ex.items(), key=lambda kv: -len(kv[1])):
        own_id = "hevy-" + slug(name)[3:]
        match, score = (own_id, 1.0) if any(e["id"] == own_id for e in exercises) else suggest(name, exercises)
        names.append({
            "name": name,
            "sets": len(sets),
            "sessions": len({s["start_raw"] for s in sets}),
            "match": match,
            "score": round(score, 2),
            "type": guess_type(name, sets),
            "group": guess_group(name),
        })

    starts = sorted(r["start"] for r in workouts.values())
    return {
        "workouts": len(workouts),
        "new_workouts": sum(1 for wid in workouts if wid not in existing_ids),
        "sets": len(rows),
        "first": starts[0],
        "last": starts[-1],
        "no_weight": sum(1 for r in rows if r["w"] is None),
        "no_reps": sum(1 for r in rows if r["r"] is None),
        "has_rpe": any(r["rpe"] is not None for r in rows),
        "names": names,
        "titles": [{"title": t, "count": c} for t, c in titles.most_common()],
    }


# ---------- records maken ----------

def build_records(csv_text: str, choices: dict, exercises: list[dict], existing_ids: set[str], now_ms: int,
                  tz: str = "Europe/Amsterdam", titles: dict | None = None) -> tuple[list[dict], dict]:
    """
    choices: {hevynaam: bestaand exercise-id | "new"}
    titles:  {hevytitel: {"rename": str | None, "template": id | None}}
    Geeft (records, rapport) terug. Records hebben de vorm {id, kind, data, updated_at, deleted}.
    """
    rows = read_rows(csv_text, tz)
    titles = titles or {}
    ex_by_id = {e["id"]: e for e in exercises}
    by_ex = defaultdict(list)
    for r in rows:
        by_ex[r["exercise"]].append(r)

    records, name_to_id = [], {}
    created = 0
    for name, sets in by_ex.items():
        choice = choices.get(name, "new")
        if choice != "new" and choice in ex_by_id:
            name_to_id[name] = choice
            continue
        eid = "hevy-" + slug(name)[3:]
        name_to_id[name] = eid
        if eid in ex_by_id:
            continue
        # Meest recente notitie wordt de vaste notitie van de oefening.
        latest_note = next((s["notes"] for s in sorted(sets, key=lambda s: -s["start"]) if s["notes"]), "")
        records.append({"id": eid, "kind": "exercise", "updated_at": now_ms, "deleted": False, "data": {
            "name": name, "group": guess_group(name), "equip": guess_equip(name), "type": guess_type(name, sets),
            "note": latest_note, "custom": True, "source": "hevy"}})
        ex_by_id[eid] = records[-1]["data"] | {"id": eid}
        created += 1

    # Bestaande oefeningen zonder vaste notitie krijgen de nieuwste Hevy-notitie.
    for name, eid in name_to_id.items():
        ex = ex_by_id.get(eid)
        if ex and not ex.get("note") and not any(r["id"] == eid for r in records):
            latest_note = next((s["notes"] for s in sorted(by_ex[name], key=lambda s: -s["start"]) if s["notes"]), "")
            if latest_note:
                data = {k: v for k, v in ex.items() if k != "id"} | {"note": latest_note}
                records.append({"id": eid, "kind": "exercise", "updated_at": now_ms, "deleted": False, "data": data})

    groups = defaultdict(list)
    for r in rows:
        groups[workout_id(r["start_raw"], r["title"])].append(r)

    added, skipped, skipped_noise = 0, 0, 0
    for wid, wrows in groups.items():
        if wid in existing_ids:
            skipped += 1
            continue
        first = wrows[0]
        items, order = [], []
        by_item = defaultdict(list)
        for r in wrows:
            eid = name_to_id[r["exercise"]]
            if eid not in by_item:
                order.append((eid, r["exercise"]))
            by_item[eid].append(r)
        for eid, hevy_name in order:
            sets = []
            for r in sorted(by_item[eid], key=lambda r: r["set_index"]):
                s = {"type": r["type"]}
                for k in ("w", "r", "dist", "dur", "rpe"):
                    if r[k] is not None:
                        s[k] = r[k]
                if s.get("dur") == 0:
                    s.pop("dur")  # ruis: duur 0 bij een gewone oefening
                if len(s) == 1:
                    skipped_noise += 1
                    continue
                sets.append(s)
            if not sets:
                continue
            item = {"exercise": eid, "sets": sets}
            note = next((r["notes"] for r in by_item[eid] if r["notes"]), "")
            ex_note = ex_by_id.get(eid, {}).get("note", "")
            if note and note != ex_note:
                item["note"] = note  # oudere notities blijven bewaard als sessienotitie
            items.append(item)
        if not items:
            continue
        t = titles.get(first["title"], {})
        records.append({"id": wid, "kind": "workout", "updated_at": now_ms, "deleted": False, "data": {
            "title": (t.get("rename") or first["title"]).strip(),
            "template": t.get("template"),
            "start": first["start"],
            "end": first["end"] or first["start"],
            "rpe": None,
            "note": first["description"],
            "items": items,
            "source": "hevy",
            "hevy_title": first["title"],
        }})
        added += 1

    report = {"workouts_added": added, "workouts_skipped": skipped, "exercises_created": created,
              "sets": sum(len(i["sets"]) for rec in records if rec["kind"] == "workout" for i in rec["data"]["items"]),
              "noise_skipped": skipped_noise}
    return records, report


def progress_checks(records: list[dict], exercises: dict, top: int = 3) -> list[dict]:
    """Eerste en laatste zwaarste set van de meest gedane oefeningen, als controle na de import."""
    per_ex = defaultdict(list)
    for rec in records:
        if rec["kind"] != "workout":
            continue
        for it in rec["data"]["items"]:
            ws = [s["w"] for s in it["sets"] if s.get("w") is not None and s.get("type") != "warmup"]
            if ws:
                per_ex[it["exercise"]].append((rec["data"]["start"], ws))
    out = []
    for eid, sessions in sorted(per_ex.items(), key=lambda kv: -len(kv[1]))[:top]:
        sessions.sort()
        ex = exercises.get(eid, {})
        pick = min if ex.get("type") == "assist" else max
        out.append({"exercise": eid, "name": ex.get("name", eid), "type": ex.get("type", "kg"),
                    "first_at": sessions[0][0], "last_at": sessions[-1][0],
                    "first": pick(sessions[0][1]), "last": pick(sessions[-1][1])})
    return out


__all__ = ["GROUPS", "HevyError", "build_records", "preview", "progress_checks", "read_rows", "workout_id"]
