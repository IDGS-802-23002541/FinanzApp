"""Muestra el código de recuperación vigente de un correo (solo desarrollo).

El código de 6 dígitos se guarda como HMAC-SHA256, así que se reconstruye
probando las 1,000,000 combinaciones contra el hash del token vigente.

Uso:
    python scripts/recuperar_codigo.py correo@ejemplo.com
"""

import hashlib
import hmac
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from flask import current_app

from app import create_app
from app.extensions import db
from app.models import TokenRecuperacion, Usuario
from app.utils import seguridad


def reconstruir_codigo(correo):
    usuario = db.session.execute(
        db.select(Usuario).where(Usuario.correo == correo)
    ).scalar_one_or_none()
    if usuario is None:
        return None

    token = (
        db.session.execute(
            db.select(TokenRecuperacion)
            .where(
                TokenRecuperacion.usuarioId == usuario.idUsuario,
                TokenRecuperacion.fechaUso.is_(None),
                TokenRecuperacion.fechaExpiracion > seguridad.ahora_utc(),
            )
            .order_by(TokenRecuperacion.idToken.desc())
        )
        .scalars()
        .first()
    )
    if token is None:
        return None

    clave = current_app.config["SECRET_KEY"].encode("utf-8")
    objetivo = bytes(token.hashToken)
    for numero in range(1_000_000):
        candidato = f"{numero:06d}"
        if (
            hmac.new(clave, candidato.encode("utf-8"), hashlib.sha256).digest()
            == objetivo
        ):
            return candidato
    return None


def main():
    if len(sys.argv) != 2:
        print("Uso: python scripts/recuperar_codigo.py <correo>")
        return 2

    correo = sys.argv[1].strip().lower()
    app = create_app()
    with app.app_context():
        codigo = reconstruir_codigo(correo)

    if codigo is None:
        print(f"No hay un código vigente para {correo}.")
        return 1

    print(f"Código vigente para {correo}: {codigo}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
