import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app


def test_crear_app_expone_prueba():
    app = create_app()
    rutas = {regla.rule for regla in app.url_map.iter_rules()}
    assert "/prueba" in rutas


def test_prueba_sin_bd_responde_json():
    app = create_app()
    cliente = app.test_client()
    respuesta = cliente.get("/prueba")
    assert respuesta.status_code in (200, 503)
    assert respuesta.is_json
