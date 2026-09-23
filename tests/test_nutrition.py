"""Macro-schatting: zonder echte API-aanroep (die kost geld en vraagt een sleutel)."""

from types import SimpleNamespace

import pytest

from veergym import nutrition


class FakeMessages:
    def __init__(self, result=None, stop="end_turn"):
        self.result, self.stop, self.calls = result, stop, []

    def parse(self, **kw):
        self.calls.append(kw)
        return SimpleNamespace(stop_reason=self.stop, parsed_output=self.result)


def fake_client(**kw):
    return SimpleNamespace(messages=FakeMessages(**kw))


def test_estimate_sends_note_and_context():
    est = nutrition.Estimate(kcal=540, protein=31, fat=18, carbs=58, assumptions="Gemiddelde portie.")
    client = fake_client(result=est)
    out = nutrition.estimate("Linzencurry met rijst", "Ik eet vegetarisch.", client=client)
    assert out.kcal == 540
    call = client.messages.calls[0]
    assert call["model"] == nutrition.DEFAULT_MODEL and call["output_format"] is nutrition.Estimate
    assert "Linzencurry" in call["messages"][0]["content"] and "vegetarisch" in call["system"]


def test_empty_note_rejected():
    with pytest.raises(nutrition.EstimateError) as e:
        nutrition.estimate("  ", client=fake_client())
    assert e.value.status == 400


def test_refusal_is_reported():
    with pytest.raises(nutrition.EstimateError) as e:
        nutrition.estimate("iets", client=fake_client(stop="refusal"))
    assert e.value.status == 422


def test_api_without_key(client, auth, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assert client.get("/api/health").json()["estimate_available"] is False
    r = client.post("/api/food/estimate", json={"note": "Havermout"}, headers=auth)
    assert r.status_code == 503 and "ANTHROPIC_API_KEY" in r.json()["detail"]
    assert client.post("/api/food/estimate", json={"note": "x"}).status_code == 401


def test_api_with_fake_claude(client, auth, monkeypatch):
    est = nutrition.Estimate(kcal=410, protein=30, fat=11, carbs=52, assumptions="60 g havermout.")
    monkeypatch.setattr(nutrition.anthropic, "Anthropic", lambda: fake_client(result=est))
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test")
    r = client.post("/api/food/estimate", json={"note": "Havermout met skyr"}, headers=auth).json()
    assert r == {"kcal": 410, "protein": 30, "fat": 11, "carbs": 52, "assumptions": "60 g havermout."}
