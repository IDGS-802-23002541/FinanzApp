import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import cartera_detalle_service


def test_detalle_cartera_requiere_token():
    app = create_app()
    cliente = app.test_client()
    respuesta = cliente.get("/carteras/1")
    assert respuesta.status_code == 401
    assert respuesta.is_json


def test_iniciales_colaborador():
    class UsuarioFalso:
        nombreUsuario = "Vanesa"
        apaterno = "Rea"

    assert cartera_detalle_service._iniciales(UsuarioFalso()) == "VR"
