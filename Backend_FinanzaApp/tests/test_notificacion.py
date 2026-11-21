import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import auth_service, notificacion_service


def _cliente():
    return create_app().test_client()


def test_tipo_de_notificacion_desconocido():
    assert notificacion_service.puede_notificar(1, "OTRO") is False


def test_put_preferencias_sin_token():
    respuesta = _cliente().put(
        "/auth/preferencias", json={"notificacionesPagos": False}
    )
    assert respuesta.status_code == 401
    assert respuesta.is_json


def test_preferencias_vacias():
    payload, status = auth_service.guardar_preferencia({})
    assert status == 400
    assert payload["ok"] is False


def test_preferencia_no_booleana():
    for valor in ("si", 1, 0, None):
        _, status = auth_service.guardar_preferencia(
            {"notificacionesMovimientos": valor}
        )
        assert status == 400


def test_tema_invalido():
    _, status = auth_service.guardar_preferencia({"tema": "AZUL"})
    assert status == 400


def test_defaults_activados_sin_preferencias():
    # CA6: una cuenta nueva recibe todos los avisos.
    datos = auth_service._datos_preferencia(None)
    assert datos["tema"] == "CLARO"
    assert datos["notificacionesMovimientos"] is True
    assert datos["notificacionesSistema"] is True
    assert datos["notificacionesPagos"] is True
