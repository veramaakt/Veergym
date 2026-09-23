"""Claude voor eten: macro's schatten, eettips en het weekoverzicht op zondag.

De API-sleutel staat alleen op de server, in .env (ANTHROPIC_API_KEY) in je app-map.
Naar Anthropic gaan alleen: de maaltijdnotitie (schatten), of voor tips/weekoverzicht je dagdoelen,
je maaltijdnotities van de laatste weken, je lijst "Graag & in huis", je duimpjes en de vaste context.
"""

import os

import anthropic
from pydantic import BaseModel, Field

DEFAULT_MODEL = "claude-sonnet-5"

SYSTEM = """Je schat voedingswaarden voor één maaltijd, op basis van een korte Nederlandse notitie.
Geef je beste schatting voor de hele maaltijd zoals beschreven: energie in kcal en eiwit, vet en
koolhydraten in gram. Ga uit van gangbare Nederlandse porties en producten als hoeveelheden
ontbreken, en noem in de toelichting kort welke aannames je deed (porties, merken, bereiding),
zodat de gebruiker ze kan controleren. Toelichting in het Nederlands, hooguit twee zinnen.
Rond kcal af op 10 en grammen op hele getallen."""


class Estimate(BaseModel):
    kcal: int = Field(description="Energie in kcal, afgerond op 10")
    protein: int = Field(description="Eiwit in gram")
    fat: int = Field(description="Vet in gram")
    carbs: int = Field(description="Koolhydraten in gram")
    assumptions: str = Field(description="Korte toelichting met de aannames, in het Nederlands")


class EstimateError(Exception):
    """Fout met een melding die de app direct kan tonen."""

    def __init__(self, message: str, status: int = 502):
        super().__init__(message)
        self.status = status


def available() -> bool:
    return bool(os.getenv("ANTHROPIC_API_KEY"))


def _parse(system: str, user: str, output_format, client=None):
    if client is None:
        if not available():
            raise EstimateError("Er staat nog geen ANTHROPIC_API_KEY in het bestand .env van je app-map.", 503)
        client = anthropic.Anthropic()
    try:
        response = client.messages.parse(
            model=os.getenv("CLAUDE_MODEL", DEFAULT_MODEL),
            max_tokens=16000,
            system=system,
            messages=[{"role": "user", "content": user}],
            output_format=output_format,
        )
    except anthropic.AuthenticationError:
        raise EstimateError("De API-sleutel wordt niet geaccepteerd. Controleer ANTHROPIC_API_KEY in .env.", 502)
    except anthropic.PermissionDeniedError:
        raise EstimateError("Deze API-sleutel mag dit model niet gebruiken.", 502)
    except anthropic.RateLimitError:
        raise EstimateError("Even te veel aanvragen of je API-tegoed is op. Probeer het zo nog eens.", 429)
    except anthropic.APIConnectionError:
        raise EstimateError("Geen verbinding met Claude. Probeer het later opnieuw.", 503)
    except anthropic.APIStatusError as e:
        raise EstimateError(f"Claude gaf een fout ({e.status_code}). Probeer het later opnieuw.", 502)
    if response.stop_reason == "refusal":
        raise EstimateError("Claude kon hier niet op antwoorden. Pas je invoer aan en probeer opnieuw.", 422)
    if response.parsed_output is None:
        raise EstimateError("Het antwoord was onvolledig. Probeer het opnieuw.", 502)
    return response.parsed_output


def _with_context(system: str, context: str) -> str:
    context = (context or "").strip()
    return system + (f"\n\nVaste context over de gebruiker: {context}" if context else "")


def estimate(note: str, context: str = "", client: "anthropic.Anthropic | None" = None) -> Estimate:
    note = (note or "").strip()
    if not note:
        raise EstimateError("Schrijf eerst wat je at.", 400)
    return _parse(_with_context(SYSTEM, context), f"Maaltijd: {note}", Estimate, client)


# ---------- eettips en weekoverzicht ----------

TONE = """Toon: vriendelijk, rustig en concreet, in het Nederlands. Geen oordeel: gebruik geen woorden als
goed, slecht, fout, te veel, te weinig, streng of "moet". Beschrijf wat er is en wat kan, niet wat mis ging.
Baseer je voorstellen vooral op wat de gebruiker al eet en in huis heeft (zie haar maaltijdgeschiedenis en
haar lijst "Graag & in huis"). Stel nooit iets voor uit "Liever niet". Hooguit één nieuw idee dat ze nog
niet eet, en zeg dan dat het nieuw is. Gebruik gangbare Nederlandse producten en porties."""

SUGGEST_SYSTEM = """Je helpt iemand kiezen wat ze vandaag nog kan eten om haar dagdoelen dichterbij te brengen,
vooral de macro waar het meest van over is. Geef 2 of 3 concrete voorstellen met portie en geschatte
kcal/eiwit/vet/koolhydraten (kcal afgerond op 10, grammen heel). Blijf ongeveer binnen wat er nog over is aan kcal.
In "why" één korte zin waarom dit past (bijv. "je eet dit vaak als snack", "staat op je lijst").

""" + TONE


class Suggestion(BaseModel):
    name: str = Field(description="Wat, kort, bijv. 'Skyr met pindakaas'")
    portion: str = Field(description="Portie, bijv. '200 g skyr + 15 g pindakaas'")
    kcal: int
    protein: int
    fat: int
    carbs: int
    why: str = Field(description="Eén korte zin waarom dit past")


class Suggestions(BaseModel):
    suggestions: list[Suggestion]
    note: str = Field(description="Hooguit één korte zin als inleiding, mag leeg zijn")


WEEK_SYSTEM = """Je maakt op zondag een kort weekoverzicht van iemands eten, als hulp bij het maken van haar
maaltijdplan voor de week erna. De cijfers (gemiddelden, doelen) staan al in de app; herhaal ze niet uitgebreid.
- summary: 2 zinnen over wat opviel deze week (patronen, niet per dag).
- tips: 2 of 3 tips voor volgende week, elk met een korte titel en één of twee zinnen uitleg. Richt ze op plannen
  en voorbereiden (boodschappen, vooruit koken, vaste snack klaarzetten).
- meal_ideas: 4 tot 6 maaltijdideeën voor het plan van volgende week, elk als korte regel met de maaltijd erbij
  (bijv. "Lunch: wrap met hummus, falafel en rauwkost"), zoveel mogelijk gebaseerd op wat ze graag eet.

""" + TONE


class WeekTip(BaseModel):
    title: str
    detail: str


class WeekReview(BaseModel):
    summary: str
    tips: list[WeekTip]
    meal_ideas: list[str]


def _profile(history: list[str], pantry: str, likes: list[str], dislikes: list[str]) -> str:
    parts = []
    if history:
        parts.append("Maaltijdgeschiedenis (laatste weken, met hoe vaak):\n" + "\n".join(f"- {h}" for h in history))
    if pantry.strip():
        parts.append("Graag & in huis:\n" + pantry.strip())
    if likes:
        parts.append("Eerdere tips die ze lekker vond: " + "; ".join(likes))
    if dislikes:
        parts.append("Liever niet: " + "; ".join(dislikes))
    return "\n\n".join(parts) or "Nog geen geschiedenis bekend."


def suggest(left: dict, today: list[str], history: list[str], pantry: str = "", likes: list[str] = (),
            dislikes: list[str] = (), context: str = "", client=None) -> Suggestions:
    over = ", ".join(f"{v:g} {'kcal' if k == 'kcal' else 'g ' + LABELS[k]}" for k, v in left.items() if k in LABELS)
    user = (f"Nog over vandaag: {over}.\n\nVandaag gegeten:\n" + ("\n".join(f"- {t}" for t in today) or "- nog niets")
            + "\n\n" + _profile(history, pantry, list(likes), list(dislikes)))
    return _parse(_with_context(SUGGEST_SYSTEM, context), user, Suggestions, client)


def week_review(week: str, history: list[str], pantry: str = "", likes: list[str] = (),
                dislikes: list[str] = (), context: str = "", client=None) -> WeekReview:
    if not week.strip():
        raise EstimateError("Er is deze week nog niets ingevuld.", 400)
    user = "Deze week:\n" + week.strip() + "\n\n" + _profile(history, pantry, list(likes), list(dislikes))
    return _parse(_with_context(WEEK_SYSTEM, context), user, WeekReview, client)


LABELS = {"kcal": "kcal", "protein": "eiwit", "fat": "vet", "carbs": "koolhydraten"}
