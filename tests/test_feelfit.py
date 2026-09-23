"""Feelfit-import met een nep-export (de echte export is persoonlijk en staat niet in git)."""

import base64
import io

import openpyxl
import pytest

from veergym import feelfit

HEADER = ["Tijd van meting", "Gewicht(kg)", "Lichaamsvet(%)", "Lichaamsvetmassa(kg)", "BMI", "Spiermassa(kg)",
          "Visceraal vet", "Lichaamswater(%)", "BMR(kcal)", "MAC-adres van apparaat", "Toestelnaam"]


def xlsx(rows):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(HEADER)
    for r in rows:
        ws.append(r)
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


A = xlsx([
    ["07/09/2026 07:15:43", "73.85", "21", "15.51", "26.5", "54.8", "8", "54.2", "1629", "AA:BB", "Weegschaal"],
    ["07/09/2026 19:02:00", "74.60", "21.3", "15.9", "26.7", "54.9", "8", "54.0", "1633", "AA:BB", "Weegschaal"],
    ["31/01/2026 12:13:49", "72.85", "20.7", None, "26.1", "54.3", "8", "54.4", "1618", "AA:BB", "Weegschaal"],
])
B = xlsx([
    ["31/01/2026 12:13:49", "72.85", "20.7", None, "26.1", "54.3", "8", "54.4", "1618", "AA:BB", "Weegschaal"],
    ["08/08/2022 17:42:42", "77.05", "21.3", None, "27", "57", "8", "54", "1679", "AA:BB", "Weegschaal"],
])


def test_parse_merges_files_and_days():
    r = feelfit.parse([("a.xlsx", A), ("b.xlsx", B)])
    assert [x["date"] for x in r["rows"]] == ["2022-08-08", "2026-01-31", "2026-09-07"]
    last = r["rows"][-1]
    assert last["time"] == "07:15" and last["weight"] == 73.85  # vroegste weging van de dag
    assert last["body"]["fat_pct"] == 21 and last["body"]["muscle_kg"] == 54.8 and last["body"]["visceral"] == 8
    assert "fat_kg" not in r["rows"][1]["body"]  # lege cel wordt overgeslagen
    assert r["weighings"] == 5


def test_lbs_converted():
    data = xlsx([["01/02/2026 08:00:00", "160", "20", "32", "25", "120", "7", "55", "1600", "", ""]])
    wb = openpyxl.load_workbook(io.BytesIO(data))
    wb.active["B1"] = "Gewicht(lb)"
    wb.active["F1"] = "Spiermassa(lb)"
    buf = io.BytesIO()
    wb.save(buf)
    row = feelfit.parse([("x.xlsx", buf.getvalue())])["rows"][0]
    assert row["weight"] == round(160 * feelfit.LB, 2) and row["body"]["muscle_kg"] == round(120 * feelfit.LB, 2)


def test_not_a_feelfit_file():
    with pytest.raises(feelfit.FeelfitError):
        feelfit.parse([("x.csv", b"a,b\n1,2\n")])


def test_api(client, auth):
    body = {"files": [{"name": "a.xlsx", "data": base64.b64encode(A).decode()}]}
    r = client.post("/api/import/feelfit", json=body, headers=auth).json()
    assert r["first"] == "2026-01-31" and len(r["rows"]) == 2
    bad = client.post("/api/import/feelfit", json={"files": [{"name": "x.csv", "data": base64.b64encode(b"x").decode()}]}, headers=auth)
    assert bad.status_code == 400
    assert client.post("/api/import/feelfit", json=body).status_code == 401
