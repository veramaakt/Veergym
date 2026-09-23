"""Eén gebruiker, één wachtwoord (APP_PASSWORD in .env).

Na inloggen krijgt het apparaat een ondertekend token dat een half jaar
geldig blijft, zodat je in de sportschool niet opnieuw hoeft in te loggen.
"""

import base64
import hashlib
import hmac
import json
import time

from fastapi import Header, HTTPException

from .config import get_settings


def _sign(payload: bytes) -> str:
    key = get_settings().secret_key.encode()
    return base64.urlsafe_b64encode(hmac.new(key, payload, hashlib.sha256).digest()).decode().rstrip("=")


def make_token() -> str:
    exp = int(time.time()) + get_settings().token_days * 86400
    payload = base64.urlsafe_b64encode(json.dumps({"exp": exp}).encode()).decode().rstrip("=")
    return f"{payload}.{_sign(payload.encode())}"


def check_token(token: str) -> bool:
    try:
        payload, sig = token.split(".", 1)
    except ValueError:
        return False
    if not hmac.compare_digest(sig, _sign(payload.encode())):
        return False
    padded = payload + "=" * (-len(payload) % 4)
    try:
        exp = json.loads(base64.urlsafe_b64decode(padded))["exp"]
    except (ValueError, KeyError):
        return False
    return exp > time.time()


def check_password(password: str) -> bool:
    expected = get_settings().app_password
    if not expected:
        return False
    return hmac.compare_digest(password.encode(), expected.encode())


def require_auth(authorization: str = Header(default="")) -> None:
    token = authorization.removeprefix("Bearer ").strip()
    if not token or not check_token(token):
        raise HTTPException(status_code=401, detail="Niet ingelogd")
