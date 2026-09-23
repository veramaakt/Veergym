import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("VEERGYM_DATA_DIR", str(tmp_path))
    monkeypatch.setenv("APP_PASSWORD", "test-wachtwoord")
    monkeypatch.setenv("SECRET_KEY", "test-secret")
    monkeypatch.delenv("DATABASE_URL", raising=False)
    from veergym import config, db

    config.get_settings.cache_clear()
    db.reset_engine()
    from veergym.main import app

    yield TestClient(app)
    db.reset_engine()
    config.get_settings.cache_clear()


@pytest.fixture
def auth(client):
    token = client.post("/api/login", json={"password": "test-wachtwoord"}).json()["token"]
    return {"Authorization": f"Bearer {token}"}
