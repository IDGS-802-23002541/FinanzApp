import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.services import admin_service
from app.utils import validacion


class UsuarioFalso:
    def __init__(self, rol_global):
        self.rolGlobal = rol_global


def _app():
    return create_app()


def _como(monkeypatch, rol_global):
    monkeypatch.setattr(admin_service, "current_user", UsuarioFalso(rol_global))


def test_rutas_admin_registradas():
    rutas = {
        (regla.rule, metodo)
        for regla in _app().url_map.iter_rules()
        for metodo in regla.methods
    }
    assert ("/admin/metricas", "GET") in rutas
    assert ("/admin/trabajadores", "GET") in rutas
    assert ("/admin/trabajadores", "POST") in rutas


def test_admin_requiere_token():
    cliente = _app().test_client()
    assert cliente.get("/admin/metricas").status_code == 401
    assert cliente.get("/admin/trabajadores").status_code == 401
    assert cliente.post("/admin/trabajadores", json={}).status_code == 401


def test_solo_admin_consulta_metricas(monkeypatch):
    _como(monkeypatch, "TRABAJADOR")
    payload, status = admin_service.metricas()
    assert status == 403
    assert payload["ok"] is False


def test_solo_staff_lista_trabajadores(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = admin_service.listar_trabajadores()
    assert status == 403
    assert payload["ok"] is False


def test_serializar_trabajador_expone_datos_minimos():
    trabajador = UsuarioFalso("TRABAJADOR")
    trabajador.idUsuario = 7
    trabajador.nombreUsuario = "Diego"
    trabajador.apaterno = "Borja"
    trabajador.correo = "diego@finanzapp.com"
    trabajador.estado = "ACTIVO"

    datos = admin_service._serializar_trabajador(
        trabajador,
        [{"idTicket": 3, "asunto": "No puedo entrar", "estado": "ABIERTO"}],
    )

    assert datos == {
        "idUsuario": 7,
        "nombre": "Diego Borja",
        "correo": "diego@finanzapp.com",
        "rolGlobal": "TRABAJADOR",
        "estatus": "ACTIVO",
        "tickets": [{"idTicket": 3, "asunto": "No puedo entrar", "estado": "ABIERTO"}],
    }


def test_serializar_trabajador_sin_tickets():
    trabajador = UsuarioFalso("TRABAJADOR")
    trabajador.idUsuario = 8
    trabajador.nombreUsuario = "Ana"
    trabajador.apaterno = "Ruiz"
    trabajador.correo = "ana@finanzapp.com"
    trabajador.estado = "ACTIVO"

    datos = admin_service._serializar_trabajador(trabajador)

    assert datos["tickets"] == []


def test_listar_trabajadores_rechaza_pagina_invalida(monkeypatch):
    _como(monkeypatch, "TRABAJADOR")
    payload, status = admin_service.listar_trabajadores(pagina="x")
    assert status == 400
    assert payload["ok"] is False


def test_listar_trabajadores_rechaza_por_pagina_fuera_de_rango(monkeypatch):
    _como(monkeypatch, "ADMIN")
    payload, status = admin_service.listar_trabajadores(por_pagina="500")
    assert status == 400
    assert payload["ok"] is False


def test_tickets_actuales_sin_trabajadores():
    assert admin_service._tickets_actuales([]) == {}


def test_solo_admin_crea_trabajadores(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = admin_service.crear_trabajador(
        {"nombreUsuario": "Ana", "apaterno": "Ruiz", "correo": "a@b.mx"}
    )
    assert status == 403
    assert payload["ok"] is False


def test_cliente_no_consulta_metricas(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = admin_service.metricas()
    assert status == 403
    assert payload["ok"] is False


def test_trabajador_no_crea_trabajadores(monkeypatch):
    _como(monkeypatch, "TRABAJADOR")
    payload, status = admin_service.crear_trabajador(
        {"nombreUsuario": "Ana", "apaterno": "Ruiz", "correo": "a@b.mx"}
    )
    assert status == 403
    assert payload["ok"] is False


def test_resumen_tickets_mapea_estados():
    resumen = admin_service._resumen_tickets(
        {"ABIERTO": 2, "EN_PROCESO": 1, "CERRADO": 3, "ELIMINADO": 9}
    )
    assert resumen == {
        "abiertos": 2,
        "enProceso": 1,
        "enEspera": 0,
        "resueltos": 0,
        "cerrados": 3,
        "total": 6,
    }


def test_contrasenia_temporal_cumple_requisitos():
    assert (
        validacion.requisitos_contrasenia(admin_service._contrasenia_temporal()) == []
    )


def test_datos_usuario_rechaza_campos_faltantes():
    campos, error = validacion.datos_usuario({"nombreUsuario": "Ana"})
    assert campos is None
    assert "Faltan campos" in error


def test_datos_usuario_normaliza_correo_y_apellidos():
    campos, error = validacion.datos_usuario(
        {
            "nombreUsuario": " Ana ",
            "apaterno": " Ruiz ",
            "correo": " ANA@Ejemplo.MX ",
        }
    )
    assert error is None
    assert campos["correo"] == "ana@ejemplo.mx"
    assert campos["amaterno"] is None


def test_datos_usuario_rechaza_correo_invalido():
    campos, error = validacion.datos_usuario(
        {"nombreUsuario": "Ana", "apaterno": "Ruiz", "correo": "ana"}
    )
    assert campos is None
    assert "formato" in error
