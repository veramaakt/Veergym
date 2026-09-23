"""Instellingen en geheimen.

Geheimen (wachtwoord, API-sleutels) staan in het bestand `.env` naast deze
code. Dat bestand bestaat alleen in je eigen app-map en gaat nooit naar GitHub.
Zie `.env.example` voor alle mogelijke sleutels.
"""

import os
import secrets
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
WEB_DIR = ROOT / "web"

# .env laden; echte omgevingsvariabelen gaan voor.
load_dotenv(ROOT / ".env", override=False)


class Settings:
    def __init__(self) -> None:
        self.app_password: str = os.getenv("APP_PASSWORD", "")
        self.data_dir: Path = Path(os.getenv("VEERGYM_DATA_DIR", ROOT / "data")).resolve()
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.database_url: str = os.getenv(
            "DATABASE_URL", f"sqlite:///{self.data_dir / 'veergym.db'}"
        )
        self.secret_key: str = os.getenv("SECRET_KEY") or self._stored_secret()
        self.token_days: int = int(os.getenv("TOKEN_DAYS", "180"))
        # Tijdzone voor het inlezen van tijden zonder zone (zoals in de Hevy-export).
        self.timezone: str = os.getenv("TIMEZONE", "Europe/Amsterdam")

    def _stored_secret(self) -> str:
        """Geen SECRET_KEY in .env? Maak er eenmalig een aan in de datamap."""
        path = self.data_dir / "secret_key"
        if not path.exists():
            path.write_text(secrets.token_urlsafe(48))
            path.chmod(0o600)
        return path.read_text().strip()


@lru_cache
def get_settings() -> Settings:
    return Settings()
