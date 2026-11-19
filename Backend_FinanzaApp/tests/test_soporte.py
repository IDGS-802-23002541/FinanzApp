import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app
from app.routes.soporte import soporte_bp
from app.services import soporte_service


class UsuarioFalso:
    def __init__(self, rol_global, id_usuario):
        self.rolGlobal = rol_global
        self.idUsuario = id_usuario
        self.nombreUsuario = "Usuario"
        self.apaterno = "Prueba"


class TicketFalso:
    def __init__(self):
        self.idTicket = 1
        self.usuarioId = 7
        self.asunto = "Ayuda"
        self.descripcion = "Detalle"
        self.categoria = "GENERAL"
        self.prioridad = "MEDIA"
        self.estado = "ABIERTO"
        self.fechaCreacion = datetime(2026, 1, 1)
        self.fechaCierre = None


class AsignacionFalso:
    def __init__(self):
        self.esActual = True
        self.fechaFin = None


def _app():
    app = create_app()
    # El blueprint se registra en app/__init__.py; si aún no está, se registra aquí.
    if "soporte" not in app.blueprints:
        app.register_blueprint(soporte_bp)
    return app


def _cliente():
    return _app().test_client()


def _como(monkeypatch, rol_global, id_usuario=7):
    monkeypatch.setattr(
        soporte_service, "current_user", UsuarioFalso(rol_global, id_usuario)
    )


def test_rutas_soporte_registradas():
    rutas = {
        (regla.rule, metodo)
        for regla in _app().url_map.iter_rules()
        for metodo in regla.methods
    }
    assert ("/soporte/tickets", "POST") in rutas
    assert ("/soporte/tickets", "GET") in rutas
    assert ("/soporte/tickets/<int:idTicket>", "PUT") in rutas
    assert ("/soporte/tickets/<int:idTicket>", "DELETE") in rutas
    assert ("/soporte/tickets/<int:idTicket>/respuestas", "POST") in rutas
    assert ("/soporte/tickets/<int:idTicket>/asignar", "POST") in rutas
    assert ("/soporte/tickets/<int:idTicket>/cerrar", "POST") in rutas


def test_rutas_soporte_requieren_token():
    cliente = _cliente()
    respuestas = [
        cliente.post("/soporte/tickets", json={}),
        cliente.get("/soporte/tickets"),
        cliente.put("/soporte/tickets/1", json={}),
        cliente.delete("/soporte/tickets/1"),
        cliente.post("/soporte/tickets/1/respuestas", json={}),
        cliente.post("/soporte/tickets/1/asignar", json={}),
        cliente.post("/soporte/tickets/1/cerrar", json={}),
    ]
    for respuesta in respuestas:
        assert respuesta.status_code == 401
        assert respuesta.is_json


def test_crear_ticket_rechaza_asunto_vacio(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = soporte_service.crear_ticket(
        {"asunto": "   ", "descripcion": "Detalle"}
    )
    assert status == 400
    assert payload["ok"] is False


def test_crear_ticket_rechaza_asunto_largo(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = soporte_service.crear_ticket(
        {"asunto": "a" * 151, "descripcion": "Detalle"}
    )
    assert status == 400


def test_crear_ticket_rechaza_descripcion_vacia(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = soporte_service.crear_ticket(
        {"asunto": "Ayuda", "descripcion": "  "}
    )
    assert status == 400
    assert payload["ok"] is False


def test_crear_ticket_rechaza_descripcion_larga(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = soporte_service.crear_ticket(
        {"asunto": "Ayuda", "descripcion": "a" * 3001}
    )
    assert status == 400


def test_crear_ticket_rechaza_categoria_invalida(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = soporte_service.crear_ticket(
        {"asunto": "Ayuda", "descripcion": "Detalle", "categoria": "INVENCIBLE"}
    )
    assert status == 400
    assert payload["ok"] is False


def test_crear_ticket_rechaza_prioridad_invalida(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = soporte_service.crear_ticket(
        {"asunto": "Ayuda", "descripcion": "Detalle", "prioridad": "MAXIMA"}
    )
    assert status == 400
    assert payload["ok"] is False


def test_crear_ticket_rechaza_mensaje_vacio(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = soporte_service.crear_respuesta(1, {"mensaje": " "})
    assert status == 400
    assert payload["ok"] is False


def test_cliente_no_puede_asignar(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = soporte_service.asignar_ticket(1, {})
    assert status == 403
    assert payload["ok"] is False


def test_cliente_no_puede_cerrar(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    payload, status = soporte_service.cerrar_ticket(1, {})
    assert status == 403
    assert payload["ok"] is False


def test_cliente_solo_ve_sus_tickets():
    filtros = soporte_service._filtros_visibilidad(UsuarioFalso("CLIENTE", 7))
    assert len(filtros) == 1
    assert str(filtros[0].left) == "TICKET.usuarioId"
    assert filtros[0].right.value == 7


def test_staff_ve_todos_los_tickets():
    assert soporte_service._filtros_visibilidad(UsuarioFalso("ADMIN", 7)) == []
    assert soporte_service._filtros_visibilidad(UsuarioFalso("TRABAJADOR", 7)) == []


def test_asignar_cierra_asignacion_anterior_y_deja_ticket_en_proceso():
    ticket = TicketFalso()
    anterior = AsignacionFalso()
    momento = datetime(2026, 2, 1)

    soporte_service._aplicar_asignacion(ticket, anterior, momento)

    assert anterior.esActual is False
    assert anterior.fechaFin == momento
    assert ticket.estado == "EN_PROCESO"


def test_cerrar_ticket_deja_estado_cerrado_con_fecha_cierre():
    ticket = TicketFalso()
    momento = datetime(2026, 2, 2)

    soporte_service._cerrar_ticket(ticket, momento)

    assert ticket.estado == "CERRADO"
    assert ticket.fechaCierre == momento


def test_serializacion_de_ticket_cumple_contrato():
    datos = soporte_service._serializar_ticket(TicketFalso(), [], None)
    assert set(datos) == {
        "idTicket",
        "asunto",
        "descripcion",
        "categoria",
        "prioridad",
        "estado",
        "fechaCreacion",
        "fechaCierre",
        "respuestas",
        "asignacionActual",
    }
    assert datos["respuestas"] == []
    assert datos["asignacionActual"] is None
    assert datos["fechaCreacion"] == "2026-01-01T00:00:00"
    assert datos["fechaCierre"] is None


def _ticket_para_busqueda(monkeypatch, **cambios):
    ticket = TicketFalso()
    for campo, valor in cambios.items():
        setattr(ticket, campo, valor)
    monkeypatch.setattr(
        soporte_service, "_buscar_ticket", lambda _id: (ticket, None)
    )
    return ticket


def test_editar_ticket_rechaza_cuerpo_vacio(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    _ticket_para_busqueda(monkeypatch)

    payload, status = soporte_service.editar_ticket(1, {})

    assert status == 400
    assert payload["ok"] is False


def test_editar_ticket_rechaza_ajeno(monkeypatch):
    _como(monkeypatch, "CLIENTE", id_usuario=8)
    _ticket_para_busqueda(monkeypatch)

    payload, status = soporte_service.editar_ticket(1, {"asunto": "Nuevo"})

    assert status == 403
    assert payload["ok"] is False


def test_editar_ticket_rechaza_no_pendiente(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    _ticket_para_busqueda(monkeypatch, estado="EN_PROCESO")

    payload, status = soporte_service.editar_ticket(1, {"asunto": "Nuevo"})

    assert status == 409
    assert payload["ok"] is False


def test_eliminar_ticket_rechaza_ajeno(monkeypatch):
    _como(monkeypatch, "CLIENTE", id_usuario=8)
    _ticket_para_busqueda(monkeypatch)

    payload, status = soporte_service.eliminar_ticket(1)

    assert status == 403
    assert payload["ok"] is False


def test_eliminar_ticket_rechaza_no_pendiente(monkeypatch):
    _como(monkeypatch, "CLIENTE")
    _ticket_para_busqueda(monkeypatch, estado="CERRADO")

    payload, status = soporte_service.eliminar_ticket(1)

    assert status == 409
    assert payload["ok"] is False


def test_validar_edicion_acepta_campos_validos():
    cambios, error = soporte_service._validar_edicion(
        {
            "asunto": "  Otro asunto  ",
            "descripcion": "Mas detalle",
            "categoria": "cartera",
            "prioridad": "alta",
        }
    )

    assert error is None
    assert cambios == {
        "asunto": "Otro asunto",
        "descripcion": "Mas detalle",
        "categoria": "CARTERA",
        "prioridad": "ALTA",
    }


def test_validar_edicion_rechaza_vacio():
    cambios, error = soporte_service._validar_edicion({})

    assert cambios is None
    assert error == "No se enviaron campos para actualizar."


def test_validar_edicion_rechaza_categoria_invalida():
    cambios, error = soporte_service._validar_edicion(
        {"categoria": "INVENCIBLE"}
    )

    assert cambios is None
    assert error == "La categoría no es válida."


def test_cliente_no_puede_responder(monkeypatch):
    _como(monkeypatch, "CLIENTE")

    payload, status = soporte_service.crear_respuesta(
        1, {"mensaje": "Sigo con el problema"}
    )

    assert status == 403
    assert payload["ok"] is False


class AutorFalso:
    idUsuario = 9
    nombreUsuario = "Diego"
    apaterno = "Borja"


class RespuestaFalsa:
    idRespuesta = 3
    ticketId = 1
    usuarioId = 9
    mensaje = "Ya lo revisamos"
    fechaCreacion = datetime(2026, 2, 3, 10, 0)


class SesionFalsa:
    def add(self, _objeto):
        pass

    def commit(self):
        pass

    def rollback(self):
        pass


def test_serializar_respuesta_incluye_autor():
    datos = soporte_service._serializar_respuesta(
        RespuestaFalsa(), AutorFalso()
    )

    assert datos["usuarioId"] == 9
    assert datos["autor"] == "Diego Borja"
    assert datos["iniciales"] == "DB"
    assert datos["fechaCreacion"] == "2026-02-03T10:00:00"


def test_staff_responde_y_notifica_al_cliente(monkeypatch):
    _como(monkeypatch, "TRABAJADOR", id_usuario=9)
    _ticket_para_busqueda(monkeypatch)
    monkeypatch.setattr(soporte_service.db, "session", SesionFalsa())

    enviadas = []
    monkeypatch.setattr(
        soporte_service.notificacion_service,
        "notificar",
        lambda *args: enviadas.append(args) or True,
    )

    payload, status = soporte_service.crear_respuesta(
        1, {"mensaje": "Listo, ya lo revisamos"}
    )

    assert status == 201
    assert payload["ok"] is True
    assert enviadas[0][0] == 7
    assert enviadas[0][1] == "SISTEMA"
