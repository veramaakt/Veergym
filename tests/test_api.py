def change(id, kind="workout", ts=1000, deleted=False, **data):
    return {"id": id, "kind": kind, "updated_at": ts, "deleted": deleted, "data": data}


def test_login(client):
    assert client.post("/api/login", json={"password": "fout"}).status_code == 401
    assert client.post("/api/login", json={"password": "test-wachtwoord"}).status_code == 200


def test_sync_requires_auth(client):
    assert client.post("/api/sync", json={}).status_code == 401
    bad = {"Authorization": "Bearer abc.def"}
    assert client.post("/api/sync", json={}, headers=bad).status_code == 401


def test_first_sync_returns_exercise_library(client, auth):
    res = client.post("/api/sync", json={"cursor": 0, "changes": []}, headers=auth).json()
    names = [c["data"]["name"] for c in res["changes"] if c["kind"] == "exercise"]
    assert "Leg Press (Machine)" in names
    assert res["cursor"] == len(res["changes"])


def test_push_and_pull_between_devices(client, auth):
    phone = client.post("/api/sync", json={"cursor": 0, "changes": []}, headers=auth).json()
    desktop_cursor = phone["cursor"]
    client.post("/api/sync", json={"cursor": phone["cursor"], "changes": [change("w1", title="Full Body A")]}, headers=auth)
    pulled = client.post("/api/sync", json={"cursor": desktop_cursor, "changes": []}, headers=auth).json()
    assert [c["id"] for c in pulled["changes"]] == ["w1"]
    assert pulled["changes"][0]["data"]["title"] == "Full Body A"


def test_newer_change_wins(client, auth):
    client.post("/api/sync", json={"changes": [change("w1", ts=2000, title="Nieuw")]}, headers=auth)
    res = client.post("/api/sync", json={"changes": [change("w1", ts=1000, title="Oud")]}, headers=auth).json()
    w1 = [c for c in res["changes"] if c["id"] == "w1"][0]
    assert w1["data"]["title"] == "Nieuw"


def test_soft_delete_propagates(client, auth):
    client.post("/api/sync", json={"changes": [change("w1", ts=1000)]}, headers=auth)
    cur = client.post("/api/sync", json={"cursor": 0}, headers=auth).json()["cursor"]
    client.post("/api/sync", json={"cursor": cur, "changes": [change("w1", ts=2000, deleted=True)]}, headers=auth)
    res = client.post("/api/sync", json={"cursor": cur}, headers=auth).json()
    assert res["changes"][0]["deleted"] is True


def test_unknown_kind_rejected(client, auth):
    res = client.post("/api/sync", json={"changes": [change("x", kind="hack")]}, headers=auth).json()
    assert res["rejected"] == ["x"]


def test_export(client, auth):
    w = change(
        "w1", start=1_780_000_000_000, end=1_780_003_000_000, title="Full Body A",
        items=[{"exercise": "ex-leg-press-machine", "sets": [{"w": 140, "r": 10, "type": "normal"}]}],
    )
    client.post("/api/sync", json={"changes": [w]}, headers=auth)
    js = client.get("/api/export.json", headers=auth).json()
    assert js["data"]["workout"][0]["title"] == "Full Body A"
    csv = client.get("/api/export.csv", headers=auth).text
    assert "Leg Press (Machine)" in csv and ",140,10," in csv
    assert client.get("/api/export.csv").status_code == 401


def test_app_served(client):
    assert client.get("/").status_code == 200
    assert client.get("/sw.js").status_code == 200
