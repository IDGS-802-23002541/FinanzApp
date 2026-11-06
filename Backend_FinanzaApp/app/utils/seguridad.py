import hashlib
import hmac
import secrets
from datetime import datetime, timezone

from flask import current_app


def ahora_utc():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def hash_token(token):
    return hashlib.sha256(token.encode("utf-8")).digest()


def generar_codigo():
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_codigo(codigo):
    clave = current_app.config["SECRET_KEY"].encode("utf-8")
    return hmac.new(clave, codigo.encode("utf-8"), hashlib.sha256).digest()


def nuevo_refresh():
    return secrets.token_urlsafe(48)
