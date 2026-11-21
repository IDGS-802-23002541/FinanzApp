import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import miembro_service


class MiembroFalso:
    estado = "ACTIVO"
    fechaBaja = None


def test_rutas_miembros_registradas():
    app = create_app()
    rutas = {(regla.rule, metodo) for regla in app.url_map.iter_rules() for metodo in regla.methods}
    assert ("/carteras/<int:idCartera>/miembros/<int:idUsuario>", "DELETE") in rutas
    assert ("/carteras/<int:idCartera>/salir", "POST") in rutas


def test_eliminar_y_salir_requieren_token():
    app = create_app()
    cliente = app.test_client()
    eliminar = cliente.delete("/carteras/1/miembros/2")
    salir = cliente.post("/carteras/1/salir")
    assert eliminar.status_code == 401
    assert salir.status_code == 401
    assert eliminar.is_json
    assert salir.is_json


def test_dar_baja_cambia_estado_y_fecha():
    miembro = MiembroFalso()
    miembro_service._dar_baja(miembro)
    assert miembro.estado == "BAJA"
    assert miembro.fechaBaja is not None
