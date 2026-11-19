import math

from flask_jwt_extended import current_user
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import AsignacionTicket, RespuestaTicket, Ticket, Usuario
from app.services.comentario_service import ROLES_BUZON
from app.utils import seguridad

CATEGORIAS = {"GENERAL", "CUENTA", "CARTERA", "PAGOS", "ERROR", "OTRO"}
PRIORIDADES = {"BAJA", "MEDIA", "ALTA", "URGENTE"}
ESTADOS = {"ABIERTO", "EN_PROCESO", "ESPERA", "RESUELTO", "CERRADO"}


def crear_ticket(datos):
    campos, error = _validar_ticket(datos)
    if error:
        return {"ok": False, "mensaje": error}, 400

    ticket = Ticket(
        usuarioId=current_user.idUsuario,
        estado="ABIERTO",
        **campos,
    )
    try:
        db.session.add(ticket)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo crear el ticket."}, 503

    return {
        "ok": True,
        "data": {"ticket": _serializar_ticket(ticket, [], None)},
        "mensaje": "Ticket creado correctamente.",
    }, 201


def listar_tickets(estado=None, pagina="1", por_pagina="20"):
    estado = (estado or "").strip().upper()
    if estado and estado not in ESTADOS:
        return {"ok": False, "mensaje": "El filtro estado no es válido."}, 400

    pagina, error = _entero("pagina", pagina, 1)
    if error:
        return {"ok": False, "mensaje": error}, 400
    por_pagina, error = _entero("porPagina", por_pagina, 1, 100)
    if error:
        return {"ok": False, "mensaje": error}, 400

    filtros = _filtros_visibilidad(current_user)
    # La baja es logica: los reportes eliminados no se listan.
    filtros.append(Ticket.estado != "ELIMINADO")
    if estado:
        filtros.append(Ticket.estado == estado)

    try:
        total = db.session.execute(
            db.select(func.count()).select_from(Ticket).where(*filtros)
        ).scalar_one()
        tickets = (
            db.session.execute(
                db.select(Ticket)
                .where(*filtros)
                .order_by(Ticket.fechaCreacion.desc(), Ticket.idTicket.desc())
                .offset((pagina - 1) * por_pagina)
                .limit(por_pagina)
            )
            .scalars()
            .all()
        )
        respuestas, asignaciones = _relaciones(tickets)
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudieron obtener los tickets."}, 503

    return {
        "ok": True,
        "data": {
            "tickets": [
                _serializar_ticket(
                    ticket,
                    respuestas.get(ticket.idTicket, []),
                    asignaciones.get(ticket.idTicket),
                )
                for ticket in tickets
            ],
            "paginacion": {
                "pagina": pagina,
                "porPagina": por_pagina,
                "total": total,
                "totalPaginas": math.ceil(total / por_pagina) if total else 0,
            },
        },
        "mensaje": "Tickets obtenidos correctamente.",
    }, 200


def editar_ticket(id_ticket, datos):
    ticket, error = _buscar_ticket(id_ticket)
    if error:
        return error

    if ticket.usuarioId != current_user.idUsuario:
        return {
            "ok": False,
            "mensaje": "No puedes editar este ticket.",
        }, 403

    if ticket.estado != "ABIERTO":
        return {
            "ok": False,
            "mensaje": "Solo puedes editar un reporte pendiente.",
        }, 409

    cambios, error = _validar_edicion(datos)
    if error:
        return {"ok": False, "mensaje": error}, 400

    try:
        for campo, valor in cambios.items():
            setattr(ticket, campo, valor)
        ticket.fechaActualizacion = seguridad.ahora_utc()
        db.session.commit()
        respuestas, asignaciones = _relaciones([ticket])
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo actualizar el ticket."}, 503

    return {
        "ok": True,
        "data": {
            "ticket": _serializar_ticket(
                ticket,
                respuestas.get(ticket.idTicket, []),
                asignaciones.get(ticket.idTicket),
            )
        },
        "mensaje": "Ticket actualizado correctamente.",
    }, 200


def eliminar_ticket(id_ticket):
    ticket, error = _buscar_ticket(id_ticket)
    if error:
        return error

    if ticket.usuarioId != current_user.idUsuario:
        return {
            "ok": False,
            "mensaje": "No puedes eliminar este ticket.",
        }, 403

    if ticket.estado != "ABIERTO":
        return {
            "ok": False,
            "mensaje": "Solo puedes eliminar un reporte pendiente.",
        }, 409

    try:
        ticket.estado = "ELIMINADO"
        ticket.fechaActualizacion = seguridad.ahora_utc()
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo eliminar el ticket."}, 503

    return {
        "ok": True,
        "data": {"ticketId": ticket.idTicket},
        "mensaje": "Ticket eliminado correctamente.",
    }, 200


def crear_respuesta(id_ticket, datos):
    mensaje = _texto(datos.get("mensaje"))
    if not mensaje:
        return {"ok": False, "mensaje": "El mensaje es obligatorio."}, 400
    if len(mensaje) > 3000:
        return {
            "ok": False,
            "mensaje": "El mensaje no puede exceder los 3000 caracteres.",
        }, 400

    # El cliente consulta sus respuestas, pero solo el personal responde.
    if not _es_staff():
        return {
            "ok": False,
            "mensaje": "Solo el personal de soporte puede responder tickets.",
        }, 403

    ticket, error = _buscar_ticket(id_ticket)
    if error:
        return error

    respuesta = RespuestaTicket(
        ticketId=ticket.idTicket,
        usuarioId=current_user.idUsuario,
        mensaje=mensaje,
        esInterna=False,
    )
    try:
        db.session.add(respuesta)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo registrar la respuesta."}, 503

    return {
        "ok": True,
        "data": {"respuesta": _serializar_respuesta(respuesta)},
        "mensaje": "Respuesta registrada correctamente.",
    }, 201


def asignar_ticket(id_ticket, datos):
    if not _es_staff():
        return {
            "ok": False,
            "mensaje": "Solo el personal de soporte puede asignar tickets.",
        }, 403

    trabajador_id = datos.get("trabajadorId")
    if trabajador_id is None:
        trabajador_id = current_user.idUsuario
    elif isinstance(trabajador_id, bool) or not isinstance(trabajador_id, int):
        return {
            "ok": False,
            "mensaje": "El trabajador debe ser un identificador numérico.",
        }, 400

    observaciones = _texto(datos.get("observaciones"))
    if len(observaciones) > 500:
        return {
            "ok": False,
            "mensaje": "Las observaciones no pueden exceder los 500 caracteres.",
        }, 400

    ticket, error = _buscar_ticket(id_ticket)
    if error:
        return error

    ahora = seguridad.ahora_utc()
    try:
        if db.session.get(Usuario, trabajador_id) is None:
            return {"ok": False, "mensaje": "El trabajador no existe."}, 400

        actual = db.session.execute(
            db.select(AsignacionTicket).where(
                AsignacionTicket.ticketId == ticket.idTicket,
                AsignacionTicket.esActual == db.true(),
            )
        ).scalar_one_or_none()

        _aplicar_asignacion(ticket, actual, ahora)
        # El índice único deja una sola asignación actual por ticket:
        # la anterior se cierra antes de insertar la nueva.
        db.session.flush()

        asignacion = AsignacionTicket(
            ticketId=ticket.idTicket,
            trabajadorId=trabajador_id,
            fechaInicio=ahora,
            esActual=True,
            observaciones=observaciones or None,
        )
        db.session.add(asignacion)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo asignar el ticket."}, 503

    return {
        "ok": True,
        "data": {"asignacion": _serializar_asignacion(asignacion)},
        "mensaje": "Ticket asignado correctamente.",
    }, 200


def cerrar_ticket(id_ticket, datos):
    if not _es_staff():
        return {
            "ok": False,
            "mensaje": "Solo el personal de soporte puede cerrar tickets.",
        }, 403

    observaciones = _texto(datos.get("observaciones"))
    if len(observaciones) > 500:
        return {
            "ok": False,
            "mensaje": "Las observaciones no pueden exceder los 500 caracteres.",
        }, 400

    ticket, error = _buscar_ticket(id_ticket)
    if error:
        return error

    ahora = seguridad.ahora_utc()
    try:
        actual = db.session.execute(
            db.select(AsignacionTicket).where(
                AsignacionTicket.ticketId == ticket.idTicket,
                AsignacionTicket.esActual == db.true(),
            )
        ).scalar_one_or_none()
        if actual is not None and observaciones:
            actual.observaciones = observaciones

        _cerrar_ticket(ticket, ahora)
        db.session.commit()
        respuestas, asignaciones = _relaciones([ticket])
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo cerrar el ticket."}, 503

    return {
        "ok": True,
        "data": {
            "ticket": _serializar_ticket(
                ticket,
                respuestas.get(ticket.idTicket, []),
                asignaciones.get(ticket.idTicket),
            )
        },
        "mensaje": "Ticket cerrado correctamente.",
    }, 200


def _validar_ticket(datos):
    asunto = _texto(datos.get("asunto"))
    if not asunto:
        return None, "El asunto es obligatorio."
    if len(asunto) > 150:
        return None, "El asunto no puede exceder los 150 caracteres."

    descripcion = _texto(datos.get("descripcion"))
    if not descripcion:
        return None, "La descripción es obligatoria."
    if len(descripcion) > 3000:
        return None, "La descripción no puede exceder los 3000 caracteres."

    categoria = datos.get("categoria")
    if categoria is not None and not isinstance(categoria, str):
        return None, "La categoría debe ser texto."
    categoria = (categoria or "").strip().upper() or "GENERAL"
    if categoria not in CATEGORIAS:
        return None, "La categoría no es válida."

    prioridad = datos.get("prioridad")
    if prioridad is not None and not isinstance(prioridad, str):
        return None, "La prioridad debe ser texto."
    prioridad = (prioridad or "").strip().upper() or "MEDIA"
    if prioridad not in PRIORIDADES:
        return None, "La prioridad no es válida."

    return {
        "asunto": asunto,
        "descripcion": descripcion,
        "categoria": categoria,
        "prioridad": prioridad,
    }, None


def _validar_edicion(datos):
    cambios = {}

    if "asunto" in datos:
        asunto = _texto(datos.get("asunto"))
        if not asunto:
            return None, "El asunto es obligatorio."
        if len(asunto) > 150:
            return None, "El asunto no puede exceder los 150 caracteres."
        cambios["asunto"] = asunto

    if "descripcion" in datos:
        descripcion = _texto(datos.get("descripcion"))
        if not descripcion:
            return None, "La descripción es obligatoria."
        if len(descripcion) > 3000:
            return None, "La descripción no puede exceder los 3000 caracteres."
        cambios["descripcion"] = descripcion

    if "categoria" in datos:
        categoria = datos.get("categoria")
        if not isinstance(categoria, str):
            return None, "La categoría debe ser texto."
        categoria = categoria.strip().upper()
        if categoria not in CATEGORIAS:
            return None, "La categoría no es válida."
        cambios["categoria"] = categoria

    if "prioridad" in datos:
        prioridad = datos.get("prioridad")
        if not isinstance(prioridad, str):
            return None, "La prioridad debe ser texto."
        prioridad = prioridad.strip().upper()
        if prioridad not in PRIORIDADES:
            return None, "La prioridad no es válida."
        cambios["prioridad"] = prioridad

    if not cambios:
        return None, "No se enviaron campos para actualizar."

    return cambios, None


def _es_staff():
    return current_user.rolGlobal in ROLES_BUZON


def _filtros_visibilidad(usuario):
    if usuario.rolGlobal in ROLES_BUZON:
        return []
    return [Ticket.usuarioId == usuario.idUsuario]


def _buscar_ticket(id_ticket):
    try:
        ticket = db.session.get(Ticket, id_ticket)
    except SQLAlchemyError:
        db.session.rollback()
        return None, (
            {"ok": False, "mensaje": "No se pudo validar el ticket."},
            503,
        )
    if ticket is None:
        return None, ({"ok": False, "mensaje": "Ticket no encontrado."}, 404)
    return ticket, None


def _relaciones(tickets):
    ids = [ticket.idTicket for ticket in tickets]
    if not ids:
        return {}, {}

    respuestas = (
        db.session.execute(
            db.select(RespuestaTicket)
            .where(RespuestaTicket.ticketId.in_(ids))
            .order_by(RespuestaTicket.fechaCreacion, RespuestaTicket.idRespuesta)
        )
        .scalars()
        .all()
    )
    asignaciones = (
        db.session.execute(
            db.select(AsignacionTicket).where(
                AsignacionTicket.ticketId.in_(ids),
                AsignacionTicket.esActual == db.true(),
            )
        )
        .scalars()
        .all()
    )

    por_ticket = {}
    for respuesta in respuestas:
        por_ticket.setdefault(respuesta.ticketId, []).append(respuesta)
    return por_ticket, {a.ticketId: a for a in asignaciones}


def _aplicar_asignacion(ticket, asignacion_anterior, momento):
    if asignacion_anterior is not None:
        asignacion_anterior.esActual = False
        asignacion_anterior.fechaFin = momento
    ticket.estado = "EN_PROCESO"


def _cerrar_ticket(ticket, momento):
    ticket.estado = "CERRADO"
    ticket.fechaCierre = momento


def _serializar_ticket(ticket, respuestas, asignacion):
    return {
        "idTicket": ticket.idTicket,
        "asunto": ticket.asunto,
        "descripcion": ticket.descripcion,
        "categoria": ticket.categoria,
        "prioridad": ticket.prioridad,
        "estado": ticket.estado,
        "fechaCreacion": _fecha(ticket.fechaCreacion),
        "fechaCierre": _fecha(ticket.fechaCierre),
        "respuestas": [_serializar_respuesta(r) for r in respuestas],
        "asignacionActual": _serializar_asignacion(asignacion),
    }


def _serializar_respuesta(respuesta):
    return {
        "idRespuesta": respuesta.idRespuesta,
        "ticketId": respuesta.ticketId,
        "mensaje": respuesta.mensaje,
        "fechaCreacion": _fecha(respuesta.fechaCreacion),
    }


def _serializar_asignacion(asignacion):
    if asignacion is None:
        return None
    return {
        "idAsignacion": asignacion.idAsignacion,
        "ticketId": asignacion.ticketId,
        "trabajadorId": asignacion.trabajadorId,
        "fechaInicio": _fecha(asignacion.fechaInicio),
        "observaciones": asignacion.observaciones,
    }


def _texto(valor):
    if not isinstance(valor, str):
        return ""
    return valor.strip()


def _fecha(valor):
    return valor.isoformat() if valor else None


def _entero(nombre, valor, minimo, maximo=None):
    try:
        numero = int(valor)
    except (TypeError, ValueError):
        return None, f"El parámetro {nombre} debe ser un número entero."
    if numero < minimo or (maximo is not None and numero > maximo):
        return None, f"El parámetro {nombre} está fuera de rango."
    return numero, None
