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


def test_suggest_sends_left_history_and_preferences():
    out = nutrition.Suggestions(note="", suggestions=[nutrition.Suggestion(
        name="Skyr", portion="200 g", kcal=130, protein=22, fat=0, carbs=8, why="Eet je vaak.")])
    client = fake_client(result=out)
    r = nutrition.suggest({"kcal": 600, "protein": 40.5}, ["Ontbijt: havermout"], ["Snack: skyr (4x)"],
                          pantry="tofu, linzen", likes=["Eiwitshake"], dislikes=["Tonijn"], context="Ik eet vegetarisch.", client=client)
    assert r.suggestions[0].name == "Skyr"
    call = client.messages.calls[0]
    user = call["messages"][0]["content"]
    assert "600 kcal" in user and "40.5 g eiwit" in user and "skyr (4x)" in user
    assert "tofu, linzen" in user and "Eiwitshake" in user and "Liever niet: Tonijn" in user
    assert call["output_format"] is nutrition.Suggestions and "vegetarisch" in call["system"]


def test_week_review_needs_content():
    with pytest.raises(nutrition.EstimateError) as e:
        nutrition.week_review("  ", [], client=fake_client())
    assert e.value.status == 400


def test_week_api_with_fake_claude(client, auth, monkeypatch):
    review = nutrition.WeekReview(summary="Rustige week.", tips=[nutrition.WeekTip(title="Vooruit koken", detail="Maak op zondag een grote pan.")],
                                  meal_ideas=["Lunch: linzensoep"])
    fake = fake_client(result=review)
    monkeypatch.setattr(nutrition.anthropic, "Anthropic", lambda: fake)
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test")
    r = client.post("/api/food/week", json={"week": "Eten maandag: havermout", "history": ["Ontbijt: havermout (5x)"]}, headers=auth)
    assert r.status_code == 200 and r.json()["meal_ideas"] == ["Lunch: linzensoep"]
    assert "havermout (5x)" in fake.messages.calls[0]["messages"][0]["content"]
    assert client.post("/api/food/suggest", json={"left": {"protein": 30}}).status_code == 401
