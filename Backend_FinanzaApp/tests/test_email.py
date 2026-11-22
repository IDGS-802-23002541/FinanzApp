import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import email_service


def _app():
    app = create_app()
    app.config.update(EMAIL_CONNECTION_STRING=None, EMAIL_REMITENTE=None)
    return app


def test_sin_configuracion_no_envia():
    with _app().app_context():
        assert email_service.enviar("alguien@correo.com", "Asunto", "Texto") is False
