import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app


def test_ruta_finalizar_registrada():
    app = create_app()
    rutas = {(regla.rule, metodo) for regla in app.url_map.iter_rules() for metodo in regla.methods}
    assert ("/carteras/<int:idCartera>/finalizar", "POST") in rutas


def test_finalizar_requiere_token():
    app = create_app()
    cliente = app.test_client()
    respuesta = cliente.post("/carteras/1/finalizar")
    assert respuesta.status_code == 401
    assert respuesta.is_json
