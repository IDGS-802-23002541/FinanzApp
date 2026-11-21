import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import auth_service


class UsuarioFalso:
    idUsuario = 1
    nombreUsuario = "Ana"
    apaterno = "Pérez"
    amaterno = "López"
    correo = "ana@ejemplo.com"


def _cliente():
    return create_app().test_client()


def _con_usuario(monkeypatch):
    monkeypatch.setattr(auth_service, "current_user", UsuarioFalso())


def test_ruta_registrada():
    rutas = {regla.rule for regla in create_app().url_map.iter_rules()}
    assert "/auth/editar_cuenta" in rutas


def test_editar_cuenta_sin_token():
    respuesta = _cliente().put(
        "/auth/editar_cuenta", json={"nombreUsuario": "Ana"}
    )
    assert respuesta.status_code == 401
    assert respuesta.is_json


def test_nombre_obligatorio():
    for valor in (None, "", "   "):
        payload, status = auth_service.editar_cuenta({"nombreUsuario": valor})
        assert status == 400
        assert payload["ok"] is False


def test_nombre_supera_longitud():
    payload, status = auth_service.editar_cuenta({"nombreUsuario": "a" * 81})
    assert status == 400


def test_apellidos_superan_longitud(monkeypatch):
    _con_usuario(monkeypatch)
    _, status = auth_service.editar_cuenta(
        {"nombreUsuario": "Ana", "apaterno": "a" * 81}
    )
    assert status == 400
    _, status = auth_service.editar_cuenta(
        {"nombreUsuario": "Ana", "amaterno": "a" * 81}
    )
    assert status == 400


def test_correo_invalido(monkeypatch):
    _con_usuario(monkeypatch)
    for valor in ("no-es-correo", "ana@", "@ejemplo.com", "ana ejemplo.com"):
        payload, status = auth_service.editar_cuenta(
            {"nombreUsuario": "Ana", "correo": valor}
        )
        assert status == 400
        assert "correo" in payload["mensaje"].lower()


def test_correo_supera_longitud(monkeypatch):
    _con_usuario(monkeypatch)
    _, status = auth_service.editar_cuenta(
        {"nombreUsuario": "Ana", "correo": "a" * 250 + "@x.com"}
    )
    assert status == 400
