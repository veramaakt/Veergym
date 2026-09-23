"""Hevy-import met een kleine nep-export (de echte export is persoonlijk en staat niet in git)."""

from veergym import hevy

CSV = """title,start_time,end_time,description,exercise_title,superset_id,exercise_notes,set_index,set_type,weight_kg,reps,distance_km,duration_seconds,rpe
Afternoon workout 💪,2 Sep 2026, 17:52,2 Sep 2026, 18:50,Goed gegaan,Leg Press (Machine),,Stoel 5,0,normal,140,10,,,
Afternoon workout 💪,2 Sep 2026, 17:52,2 Sep 2026, 18:50,Goed gegaan,Leg Press (Machine),,Stoel 5,1,normal,140,9,,,
Afternoon workout 💪,2 Sep 2026, 17:52,2 Sep 2026, 18:50,Goed gegaan,Pull Up (Assisted),,,0,normal,18,7,,,
Afternoon workout 💪,2 Sep 2026, 17:52,2 Sep 2026, 18:50,Goed gegaan,Plank,,,0,normal,,,,45,
Afternoon workout 💪,2 Sep 2026, 17:52,2 Sep 2026, 18:50,Goed gegaan,Leg Extension (Machine),,,0,normal,30,12,,0,
Upperbody,17 Jun 2025, 18:26,17 Jun 2025, 19:20,,Leg Press (Machine),,Stoel 4,0,normal,60,12,,,
Upperbody,17 Jun 2025, 18:26,17 Jun 2025, 19:20,,Pull Up (Assisted),,,0,warmup,40,5,,,
Upperbody,17 Jun 2025, 18:26,17 Jun 2025, 19:20,,Pull Up (Assisted),,,1,normal,36,6,,,
Upperbody,17 Jun 2025, 18:26,17 Jun 2025, 19:20,,Squad (Smit Machine),,,0,dropset,40,8,,,
Upperbody,17 Jun 2025, 18:26,17 Jun 2025, 19:20,,Running,,,0,normal,,,2.09,900,
"""
# Hevy zet een komma in de datum; echte exports quoten die velden (zie quoted()).


def quoted(csv_text):
    import csv as _csv
    import io

    rows = []
    for i, line in enumerate(csv_text.strip().splitlines()):
        parts = line.split(",")
        if i:
            parts = [parts[0], parts[1] + "," + parts[2], parts[3] + "," + parts[4], *parts[5:]]
        rows.append(parts)
    out = io.StringIO()
    _csv.writer(out).writerows(rows)
    return out.getvalue()


DATA = quoted(CSV)
EXERCISES = [
    {"id": "ex-leg-press-machine", "name": "Leg Press (Machine)", "type": "kg", "note": ""},
    {"id": "ex-pull-up-assisted", "name": "Pull Up (Assisted)", "type": "assist", "note": ""},
    {"id": "ex-plank", "name": "Plank", "type": "duur", "note": ""},
    {"id": "ex-leg-extension-machine", "name": "Leg Extension (Machine)", "type": "kg", "note": ""},
    {"id": "ex-squat-smith-machine", "name": "Squat (Smith Machine)", "type": "kg", "note": ""},
]


def test_preview_counts_and_matches():
    p = hevy.preview(DATA, EXERCISES)
    assert p["workouts"] == 2 and p["sets"] == 10
    match = {n["name"]: n["match"] for n in p["names"]}
    assert match["Leg Press (Machine)"] == "ex-leg-press-machine"
    assert match["Squad (Smit Machine)"] == "ex-squat-smith-machine"  # typefouten herkend
    assert match["Running"] is None
    types = {n["name"]: n["type"] for n in p["names"]}
    assert types["Running"] == "afstand"


def test_build_records():
    p = hevy.preview(DATA, EXERCISES)
    choices = {n["name"]: n["match"] or "new" for n in p["names"]}
    recs, rep = hevy.build_records(DATA, choices, EXERCISES, set(), 1)
    assert rep["workouts_added"] == 2 and rep["exercises_created"] == 1
    workouts = {r["data"]["hevy_title"]: r["data"] for r in recs if r["kind"] == "workout"}
    upper = workouts["Upperbody"]
    assert upper["end"] - upper["start"] == 54 * 60000
    pull = next(i for i in upper["items"] if i["exercise"] == "ex-pull-up-assisted")
    assert [s["type"] for s in pull["sets"]] == ["warmup", "normal"]
    run = next(i for i in upper["items"] if i["exercise"].startswith("hevy-"))
    assert run["sets"][0] == {"type": "normal", "dist": 2.09, "dur": 900}
    latest = workouts["Afternoon workout 💪"]
    assert latest["note"] == "Goed gegaan"
    ext = next(i for i in latest["items"] if i["exercise"] == "ex-leg-extension-machine")
    assert "dur" not in ext["sets"][0]  # duur 0 is ruis
    # Nieuwste notitie wordt de vaste notitie; de oudere blijft bij die sessie.
    lp = next(r for r in recs if r["id"] == "ex-leg-press-machine")
    assert lp["data"]["note"] == "Stoel 5"
    old_lp = next(i for i in upper["items"] if i["exercise"] == "ex-leg-press-machine")
    assert old_lp["note"] == "Stoel 4"


def test_reimport_skips_existing():
    recs, _ = hevy.build_records(DATA, {}, EXERCISES, set(), 1)
    existing = {r["id"] for r in recs if r["kind"] == "workout"}
    _, rep = hevy.build_records(DATA, {}, EXERCISES, existing, 2)
    assert rep["workouts_added"] == 0 and rep["workouts_skipped"] == 2


def test_lbs_converted():
    data = DATA.replace("weight_kg", "weight_lbs")
    recs, _ = hevy.build_records(data, {}, EXERCISES, set(), 1)
    w = next(r["data"] for r in recs if r["kind"] == "workout" and r["data"]["hevy_title"] == "Upperbody")
    assert w["items"][0]["sets"][0]["w"] == round(60 * 0.45359237, 2)


def test_checks_assist_lower_is_better():
    choices = {n["name"]: n["match"] or "new" for n in hevy.preview(DATA, EXERCISES)["names"]}
    recs, _ = hevy.build_records(DATA, choices, EXERCISES, set(), 1)
    checks = {c["name"]: c for c in hevy.progress_checks(recs, {e["id"]: e for e in EXERCISES}, top=5)}
    assert checks["Pull Up (Assisted)"]["first"] == 36 and checks["Pull Up (Assisted)"]["last"] == 18
    assert checks["Leg Press (Machine)"]["first"] == 60 and checks["Leg Press (Machine)"]["last"] == 140


def test_not_a_hevy_file():
    import pytest

    with pytest.raises(hevy.HevyError):
        hevy.read_rows("a,b\n1,2\n")


def test_api_import(client, auth):
    p = client.post("/api/import/hevy/preview", json={"csv": DATA}, headers=auth).json()
    assert p["new_workouts"] == 2
    r = client.post("/api/import/hevy", json={"csv": DATA, "titles": {"Upperbody": {"rename": "Upper A"}}}, headers=auth).json()
    assert r["workouts_added"] == 2
    again = client.post("/api/import/hevy", json={"csv": DATA}, headers=auth).json()
    assert again["workouts_added"] == 0
    pulled = client.post("/api/sync", json={"cursor": 0}, headers=auth).json()["changes"]
    titles = {c["data"].get("title") for c in pulled if c["kind"] == "workout"}
    assert "Upper A" in titles
