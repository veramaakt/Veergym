"""Standaard oefeningenbibliotheek.

Een eigen lijst (geen externe dataset), gericht op machines en kabels bij
Basic-Fit. Namen volgen de Hevy-schrijfwijze, zodat de Hevy-import later
makkelijk kan koppelen. Eigen oefeningen voeg je toe in de app.

Types: kg (gewicht × reps), assist (assist-gewicht, lager is beter),
reps (alleen reps), duur (tijd), afstand (km + tijd).
"""

# (naam, spiergroep, apparatuur, type)
LIBRARY = [
    # Benen
    ("Leg Press (Machine)", "Benen", "Machine", "kg"),
    ("Leg Extension (Machine)", "Benen", "Machine", "kg"),
    ("Seated Leg Curl (Machine)", "Benen", "Machine", "kg"),
    ("Lying Leg Curl (Machine)", "Benen", "Machine", "kg"),
    ("Squat (Smith Machine)", "Benen", "Smith", "kg"),
    ("Squat (Barbell)", "Benen", "Barbell", "kg"),
    ("Goblet Squat", "Benen", "Dumbbell", "kg"),
    ("Hack Squat (Machine)", "Benen", "Machine", "kg"),
    ("Romanian Deadlift (Barbell)", "Benen", "Barbell", "kg"),
    ("Romanian Deadlift (Dumbbell)", "Benen", "Dumbbell", "kg"),
    ("Romanian Deadlift (Cable)", "Benen", "Kabel", "kg"),
    ("Bulgarian Split Squat", "Benen", "Dumbbell", "kg"),
    ("Walking Lunge", "Benen", "Dumbbell", "kg"),
    ("Standing Calf Raise (Machine)", "Benen", "Machine", "kg"),
    ("Seated Calf Raise (Machine)", "Benen", "Machine", "kg"),
    ("Wall Sit", "Benen", "Lichaamsgewicht", "duur"),
    # Billen
    ("Hip Thrust (Machine)", "Billen", "Machine", "kg"),
    ("Hip Thrust (Barbell)", "Billen", "Barbell", "kg"),
    ("Glute Bridge", "Billen", "Lichaamsgewicht", "reps"),
    ("Hip Abduction (Machine)", "Billen", "Machine", "kg"),
    ("Hip Adduction (Machine)", "Billen", "Machine", "kg"),
    ("Glute Kickback (Cable)", "Billen", "Kabel", "kg"),
    ("Glute Kickback (Machine)", "Billen", "Machine", "kg"),
    # Borst
    ("Chest Press (Machine)", "Borst", "Machine", "kg"),
    ("Incline Chest Press (Machine)", "Borst", "Machine", "kg"),
    ("Bench Press (Barbell)", "Borst", "Barbell", "kg"),
    ("Bench Press (Dumbbell)", "Borst", "Dumbbell", "kg"),
    ("Incline Bench Press (Dumbbell)", "Borst", "Dumbbell", "kg"),
    ("Chest Fly (Machine)", "Borst", "Machine", "kg"),
    ("Cable Fly Crossovers", "Borst", "Kabel", "kg"),
    ("Push Up", "Borst", "Lichaamsgewicht", "reps"),
    ("Chest Dip (Assisted)", "Borst", "Machine", "assist"),
    # Rug
    ("Lat Pulldown (Cable)", "Rug", "Kabel", "kg"),
    ("Lat Pulldown (Machine)", "Rug", "Machine", "kg"),
    ("Pull Up (Assisted)", "Rug", "Machine", "assist"),
    ("Pull Up", "Rug", "Lichaamsgewicht", "reps"),
    ("Seated Cable Row - V Grip", "Rug", "Kabel", "kg"),
    ("Seated Cable Row - Bar Grip", "Rug", "Kabel", "kg"),
    ("Seated Row (Machine)", "Rug", "Machine", "kg"),
    ("Bent Over Row (Dumbbell)", "Rug", "Dumbbell", "kg"),
    ("Straight Arm Pulldown (Cable)", "Rug", "Kabel", "kg"),
    ("Back Extension (Machine)", "Rug", "Machine", "kg"),
    ("Deadlift (Barbell)", "Rug", "Barbell", "kg"),
    # Schouders
    ("Shoulder Press (Machine)", "Schouders", "Machine", "kg"),
    ("Shoulder Press (Dumbbell)", "Schouders", "Dumbbell", "kg"),
    ("Lateral Raise (Dumbbell)", "Schouders", "Dumbbell", "kg"),
    ("Lateral Raise (Cable)", "Schouders", "Kabel", "kg"),
    ("Lateral Raise (Machine)", "Schouders", "Machine", "kg"),
    ("Rear Delt Fly (Machine)", "Schouders", "Machine", "kg"),
    ("Face Pull (Cable)", "Schouders", "Kabel", "kg"),
    # Armen
    ("Bicep Curl (Dumbbell)", "Armen", "Dumbbell", "kg"),
    ("Bicep Curl (Cable)", "Armen", "Kabel", "kg"),
    ("Bicep Curl (Machine)", "Armen", "Machine", "kg"),
    ("Hammer Curl (Dumbbell)", "Armen", "Dumbbell", "kg"),
    ("Triceps Pushdown (Cable)", "Armen", "Kabel", "kg"),
    ("Overhead Triceps Extension (Cable)", "Armen", "Kabel", "kg"),
    ("Triceps Dip (Assisted)", "Armen", "Machine", "assist"),
    # Core
    ("Plank", "Core", "Lichaamsgewicht", "duur"),
    ("Side Plank", "Core", "Lichaamsgewicht", "duur"),
    ("Knee Raise (Captain's Chair)", "Core", "Captain's chair", "reps"),
    ("Crunch (Machine)", "Core", "Machine", "kg"),
    ("Cable Crunch", "Core", "Kabel", "kg"),
    ("Dead Bug", "Core", "Lichaamsgewicht", "reps"),
    ("Pallof Press (Cable)", "Core", "Kabel", "kg"),
    # Cardio
    ("Hardlopen (Loopband)", "Cardio", "Loopband", "afstand"),
    ("Wandelen (Loopband)", "Cardio", "Loopband", "afstand"),
    ("Fietsen (Hometrainer)", "Cardio", "Fiets", "afstand"),
    ("Crosstrainer", "Cardio", "Crosstrainer", "duur"),
    ("Roeien (Machine)", "Cardio", "Roeitrainer", "afstand"),
    ("Traplopen (Stairmaster)", "Cardio", "Stairmaster", "duur"),
]

GROUPS = ["Benen", "Billen", "Borst", "Rug", "Schouders", "Armen", "Core", "Cardio"]


def slug(name: str) -> str:
    out = "".join(c.lower() if c.isalnum() else "-" for c in name)
    while "--" in out:
        out = out.replace("--", "-")
    return "ex-" + out.strip("-")


def seed_records() -> list[dict]:
    """Records voor de standaardbibliotheek. updated_at=1: elke eigen wijziging wint."""
    return [
        {
            "id": slug(name),
            "kind": "exercise",
            "updated_at": 1,
            "deleted": False,
            "data": {"name": name, "group": group, "equip": equip, "type": type_, "note": "", "custom": False},
        }
        for name, group, equip, type_ in LIBRARY
    ]
