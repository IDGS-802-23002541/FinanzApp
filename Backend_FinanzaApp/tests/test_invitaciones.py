import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import invitacion_service


def test_rutas_invitaciones_registradas():
    app = create_app()
    rutas = {regla.rule for regla in app.url_map.iter_rules()}
    assert "/carteras/<int:idCartera>/invitaciones" in rutas
    assert "/invitaciones/unirse" in rutas


def test_invitaciones_requieren_token():
    app = create_app()
    cliente = app.test_client()
    generar = cliente.post("/carteras/1/invitaciones")
    consultar = cliente.get("/carteras/1/invitaciones")
    unirse = cliente.post("/invitaciones/unirse", json={"codigo": "ABCD2345"})
    assert generar.status_code == 401
    assert consultar.status_code == 401
    assert unirse.status_code == 401
    assert generar.is_json


def test_normalizar_codigo():
    assert invitacion_service._normalizar_codigo(" abcd2345 ") == "ABCD2345"
    assert invitacion_service._normalizar_codigo("ABCD234") is None
    assert invitacion_service._normalizar_codigo("ABCD234O") is None
    assert invitacion_service._normalizar_codigo(None) is None
    assert invitacion_service._normalizar_codigo(12345678) is None
