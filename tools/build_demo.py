"""Bouw een demo van Veergym: de echte app, zonder server en inlog, met voorbeelddata.

    python tools/build_demo.py              # schrijft naar build/demo/

De demo wordt als privé-Artifact op claude.ai gezet, zodat Vera er comments op kan
plaatsen. De voorbeelddata is verzonnen (vaste seed), nooit haar echte trainingen.
"""

import hashlib
import json
import random
import shutil
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from veergym.exercises import seed_records, slug  # noqa: E402

WEB = ROOT / "web"
OUT = ROOT / "build" / "demo"
SKIP = {"index.html", "sw.js", "manifest.webmanifest"}

DAY = 86400000

# Schema's met startgewicht, stap per 2 weken en reps.
TEMPLATES = [
    ("Full Body A", ["Ma"], "var(--accent-peach)", [
        ("Leg Press (Machine)", 100, 5, 10), ("Chest Press (Machine)", 25, 1.25, 10), ("Lat Pulldown (Cable)", 35, 2.5, 10),
        ("Pull Up (Assisted)", 32, -1.5, 7), ("Shoulder Press (Machine)", 17.5, 1.25, 10)]),
    ("Full Body B", ["Do"], "var(--accent-mint)", [
        ("Squat (Smith Machine)", 35, 2.5, 8), ("Seated Cable Row - V Grip", 35, 2.5, 12), ("Hip Thrust (Machine)", 60, 5, 12),
        ("Seated Leg Curl (Machine)", 25, 2.5, 12), ("Chest Press (Machine)", 25, 1.25, 10)]),
    ("Full Body C", ["Za"], "var(--accent-blue-light)", [
        ("Romanian Deadlift (Cable)", 30, 2.5, 12), ("Lat Pulldown (Cable)", 35, 2.5, 10), ("Hip Abduction (Machine)", 45, 2.5, 15),
        ("Lateral Raise (Dumbbell)", 4, 0.5, 12), ("Plank", 40, 5, 0)]),
]
NOTES = {"Leg Press (Machine)": "Stoel 5 · 10–12 reps", "Chest Press (Machine)": "Stoel 4", "Pull Up (Assisted)": "Knieën op het kussen",
         "Hip Thrust (Machine)": "Pauze bovenin", "Seated Leg Curl (Machine)": "Rugleuning 4"}
WEEKDAY = {"Ma": 0, "Do": 3, "Za": 5}


def rec(id_, kind, data, ts):
    return {"id": id_, "kind": kind, "data": data, "updated_at": ts, "deleted": False}


def demo_records(now_ms: int) -> list[dict]:
    rnd = random.Random(42)
    records = seed_records()
    for r in records:
        if r["data"]["name"] in NOTES:
            r["data"]["note"] = NOTES[r["data"]["name"]]
    records.append(rec("demo-folder", "folder", {"name": "Full body", "order": 1, "current": True}, 1))
    records.append(rec("demo-folder-2", "folder", {"name": "Split", "order": 2}, 1))
    records.append(rec("demo-tpl-split", "template", {
        "name": "Upper body", "folder": "demo-folder-2", "days": [], "color": "var(--accent-lavender)", "order": 9,
        "items": [{"exercise": slug(n), "rest": None, "sets": [{}, {}, {}]} for n in
                  ("Chest Press (Machine)", "Seated Cable Row - V Grip", "Shoulder Press (Machine)", "Bicep Curl (Cable)")]}, 1))

    for i, (name, days, color, items) in enumerate(TEMPLATES):
        records.append(rec(f"demo-tpl-{i}", "template", {
            "name": name, "folder": "demo-folder", "days": days, "color": color, "order": i,
            "items": [{"exercise": slug(n), "rest": None, "sets": [{}, {}, {}]} for n, *_ in items]}, 1))

    # 16 weken terug, drie keer per week, soms een keer overgeslagen.
    today = time.localtime(now_ms / 1000)
    monday = now_ms - (today.tm_wday * DAY) - (today.tm_hour * 3600 + today.tm_min * 60) * 1000
    weeks = 16
    for week in range(weeks, -1, -1):
        for t_idx, (name, days, _, items) in enumerate(TEMPLATES):
            start = monday - week * 7 * DAY + WEEKDAY[days[0]] * DAY + (18 * 60 + rnd.randint(0, 50)) * 60000
            if start > now_ms - DAY or rnd.random() < 0.12:
                continue
            progress = (weeks - week) // 2
            w_items = []
            for ex_name, base, step, reps in items:
                ex_id = slug(ex_name)
                if ex_name == "Plank":
                    sets = [{"type": "normal", "dur": base + progress * step - k * 5} for k in range(3)]
                else:
                    w = max(2.5, base + progress * step + rnd.choice([0, 0, 0, -step]))
                    top = reps + rnd.choice([0, 1, 2])
                    sets = [{"type": "normal", "w": w, "r": max(4, top - k - rnd.choice([0, 0, 1]))} for k in range(3)]
                w_items.append({"exercise": ex_id, "sets": sets})
            wid = f"demo-w-{week}-{t_idx}"
            records.append(rec(wid, "workout", {
                "title": name, "template": f"demo-tpl-{t_idx}", "start": start, "end": start + rnd.randint(48, 62) * 60000,
                "rpe": rnd.choice([None, 7, 8]), "note": "", "items": w_items}, start))
    # Verzonnen metingen, elke 2 weken, met een paar tussentijdse weegmomenten.
    base = {"borst": 99, "onderborst": 83, "taille": 81, "buik": 91, "heupen": 100, "billen": 104,
            "bovenbeen_l": 62, "bovenbeen_r": 62, "bovenarm_l": 29, "bovenarm_r": 28.5}
    change = {"borst": -0.3, "onderborst": -0.4, "taille": -0.5, "buik": -0.6, "heupen": -0.4, "billen": 0.5,
              "bovenbeen_l": 0.2, "bovenbeen_r": 0.2, "bovenarm_l": 0.1, "bovenarm_r": 0.1}
    for k in range(8):
        day = now_ms - (7 * 16 - k * 14) * DAY
        date = time.strftime("%Y-%m-%d", time.localtime(day / 1000))
        records.append(rec("m-" + date, "measurement", {
            "date": date, "weight": round(75.5 - k * 0.25 + rnd.choice([-0.2, 0, 0.2]), 1), "note": "",
            "fields": {f: round(v + change[f] * k + rnd.choice([-0.5, 0, 0, 0.5]), 1) for f, v in base.items()},
            "body": {"fat_pct": round(24 - k * 0.3, 1), "muscle_kg": round(52.5 + k * 0.15, 1), "fat_kg": round((75.5 - k * 0.25) * (24 - k * 0.3) / 100, 1),
                     "fatfree_kg": round((75.5 - k * 0.25) * (1 - (24 - k * 0.3) / 100), 1), "visceral": 7, "water_pct": round(52 + k * 0.2, 1), "bmr": 1580 + k * 4}}, day))
    # Verzonnen eetnotities voor vandaag en gisteren.
    meals = [("ontbijt", "Havermout met skyr, blauwe bessen en een schep pindakaas", 430, 32, 14, 48),
             ("lunch", "Twee boterhammen met hüttenkäse, handje noten, appel", 480, 28, 19, 52),
             ("snack", "Eiwitshake", 160, 25, 2, 8),
             ("diner", "Linzencurry met rijst en spinazie", 620, 28, 18, 84)]
    for back, count in ((0, 3), (1, 4)):
        day = time.strftime("%Y-%m-%d", time.localtime((now_ms - back * DAY) / 1000))
        for meal, note, kcal, p, f, c in meals[:count]:
            records.append(rec(f"f-{day}-{meal}", "food", {"date": day, "meal": meal, "note": note, "recipe": "",
                                                          "kcal": kcal, "protein": p, "fat": f, "carbs": c}, now_ms))
    return records


def build(out: Path = OUT) -> Path:
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    for p in WEB.rglob("*"):
        rel = p.relative_to(WEB)
        if p.is_file() and rel.as_posix() not in SKIP and p.name != ".DS_Store":
            (out / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(p, out / rel)

    data = demo_records(int(time.time() * 1000))
    payload = json.dumps(data, ensure_ascii=True)
    # Versie = inhoud zonder tijdstempels: verandert alleen als de voorbeelddata echt anders is.
    version = hashlib.sha1(json.dumps(demo_records(0), sort_keys=True).encode()).hexdigest()[:10]
    (out / "demo-data.js").write_text("window.VEERGYM_DEMO = true;\n"
                                      f"window.VEERGYM_DEMO_VERSION = \"{version}\";\n"
                                      "window.VEERGYM_DEMO_DATA = " + payload + ";\n")

    # Het Artifact-platform zet zelf <html>, <head> en <body> om de pagina heen.
    (out / "index.html").write_text("""<meta charset="utf-8">
<title>Veergym</title>
<link rel="stylesheet" href="ds/styles.css">
<link rel="stylesheet" href="app/app.css">
<div id="root"></div>
<script src="demo-data.js"></script>
<script src="vendor/react.production.min.js"></script>
<script src="vendor/react-dom.production.min.js"></script>
<script src="vendor/htm.umd.js"></script>
<script src="ds/ds_bundle.js"></script>
<script type="module" src="app/main.js"></script>
""")
    return out


if __name__ == "__main__":
    path = build(Path(sys.argv[1]) if len(sys.argv) > 1 else OUT)
    files = sorted(p.relative_to(path).as_posix() for p in path.rglob("*") if p.is_file())
    print(f"Demo gebouwd in {path} ({len(files)} bestanden)")
