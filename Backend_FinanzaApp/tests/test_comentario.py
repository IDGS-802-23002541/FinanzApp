import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import comentario_service

VALIDO = {
    "nombre": "Aideé Casillas",
    "correo": "aidee@ejemplo.com",
    "comentario": "Me gustó la app.",
}


def _cliente():
    return create_app().test_client()


def _enviar(**cambios):
    return _cliente().post("/comentarios", json={**VALIDO, **cambios})


def test_ruta_registrada():
    rutas = {regla.rule for regla in create_app().url_map.iter_rules()}
    assert "/comentarios" in rutas
    assert "/comentarios/comentarios" not in rutas


def test_crear_sin_cuerpo():
    assert _cliente().post("/comentarios").status_code == 400


def test_crear_cuerpo_no_objeto():
    assert _cliente().post("/comentarios", json=[1, 2]).status_code == 400


def test_crear_sin_nombre():
    assert _enviar(nombre=None).status_code == 400


def test_crear_sin_correo():
    assert _enviar(correo=None).status_code == 400


def test_crear_sin_comentario():
    assert _enviar(comentario=None).status_code == 400


def test_crear_nombre_solo_espacios():
    assert _enviar(nombre="   ").status_code == 400


def test_crear_campo_no_texto():
    assert _enviar(nombre=123).status_code == 400


def test_crear_nombre_largo():
    assert _enviar(nombre="a" * 121).status_code == 400


def test_crear_correo_largo():
    assert _enviar(correo="a" * 250 + "@x.com").status_code == 400


def test_crear_comentario_largo():
    assert _enviar(comentario="a" * 2001).status_code == 400


def test_crear_correo_invalido():
    assert _enviar(correo="no-es-correo").status_code == 400


def test_listar_sin_token():
    respuesta = _cliente().get("/comentarios")
    assert respuesta.status_code == 401
    assert respuesta.is_json


def test_listar_rechaza_cliente(monkeypatch):
    class Cliente:
        rolGlobal = "CLIENTE"

    monkeypatch.setattr(comentario_service, "current_user", Cliente())
    payload, status = comentario_service.listar_comentarios()
    assert status == 403
    assert payload["ok"] is False
