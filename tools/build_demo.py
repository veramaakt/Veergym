"""Bouw een demo van Veergym: de echte app, zonder server en inlog, met voorbeelddata.

    python tools/build_demo.py              # schrijft naar build/demo/

De demo wordt als privé-Artifact op claude.ai gezet, zodat Vera er comments op kan
plaatsen. De voorbeelddata is verzonnen (vaste seed), nooit haar echte trainingen.
"""

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
    records.append(rec("demo-folder", "folder", {"name": "Full body", "order": 1}, 1))

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
    (out / "demo-data.js").write_text("window.VEERGYM_DEMO = true;\nwindow.VEERGYM_DEMO_DATA = " + json.dumps(data, ensure_ascii=False) + ";\n")

    # Het Artifact-platform zet zelf <html>, <head> en <body> om de pagina heen.
    (out / "index.html").write_text("""<title>Veergym</title>
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
