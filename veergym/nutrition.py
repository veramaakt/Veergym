"""Macro's schatten met Claude ("Schat macro's" op het Eten-scherm).

De API-sleutel staat alleen op de server, in .env (ANTHROPIC_API_KEY) in je app-map.
Alleen de maaltijdnotitie en een korte vaste context gaan naar Anthropic.
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


def estimate(note: str, context: str = "", client: "anthropic.Anthropic | None" = None) -> Estimate:
    note = (note or "").strip()
    if not note:
        raise EstimateError("Schrijf eerst wat je at.", 400)
    if client is None:
        if not available():
            raise EstimateError("Er staat nog geen ANTHROPIC_API_KEY in het bestand .env van je app-map.", 503)
        client = anthropic.Anthropic()
    system = SYSTEM + (f"\n\nVaste context over de gebruiker: {context.strip()}" if context.strip() else "")
    try:
        response = client.messages.parse(
            model=os.getenv("CLAUDE_MODEL", DEFAULT_MODEL),
            max_tokens=16000,
            system=system,
            messages=[{"role": "user", "content": f"Maaltijd: {note}"}],
            output_format=Estimate,
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
        raise EstimateError("Claude kon deze maaltijd niet schatten. Pas de omschrijving aan en probeer opnieuw.", 422)
    if response.parsed_output is None:
        raise EstimateError("Het antwoord was onvolledig. Probeer het opnieuw.", 502)
    return response.parsed_output
