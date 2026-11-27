import math
from datetime import timedelta

from flask_jwt_extended import current_user
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import AsignacionTicket, RespuestaTicket, Ticket, Usuario
from app.services import notificacion_service
from app.services import email_service
from app.services.comentario_service import ROLES_BUZON
from app.utils import seguridad, validacion
from app.utils.serializers import iniciales

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

    email_service.enviar_confirmacion_ticket(
        current_user.correo, ticket.asunto, ticket.idTicket
    )

    return {
        "ok": True,
        "data": {
            "ticket": _serializar_ticket(
                ticket, [], None, {current_user.idUsuario: current_user}
            )
        },
        "mensaje": "Ticket creado correctamente.",
    }, 201


def listar_tickets(
    estado=None,
    categoria=None,
    prioridad=None,
    responsable=None,
    desde=None,
    hasta=None,
    pagina="1",
    por_pagina="20",
):
    estado = (estado or "").strip().upper()
    if estado and estado not in ESTADOS:
        return {"ok": False, "mensaje": "El filtro estado no es válido."}, 400

    categoria = (categoria or "").strip().upper()
    if categoria and categoria not in CATEGORIAS:
        return {"ok": False, "mensaje": "El filtro categoria no es válido."}, 400

    prioridad = (prioridad or "").strip().upper()
    if prioridad and prioridad not in PRIORIDADES:
        return {"ok": False, "mensaje": "El filtro prioridad no es válido."}, 400

    if responsable in (None, ""):
        responsable = None
    else:
        responsable, error = _entero("responsable", responsable, 1)
        if error:
            return {"ok": False, "mensaje": error}, 400

    try:
        desde = validacion.fecha_iso(desde)
        hasta = validacion.fecha_iso(hasta)
    except ValueError:
        return {
            "ok": False,
            "mensaje": "Las fechas deben tener formato aaaa-mm-dd.",
        }, 400
    if desde and hasta and desde > hasta:
        return {
            "ok": False,
            "mensaje": "El filtro desde no puede ser posterior a hasta.",
        }, 400

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
    filtros.extend(_filtros_tickets(categoria, prioridad, responsable, desde, hasta))

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
        respuestas, asignaciones, usuarios = _relaciones(tickets)
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
                    usuarios,
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
        respuestas, asignaciones, usuarios = _relaciones([ticket])
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
                usuarios,
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


def catalogar_ticket(id_ticket, datos):
    if not _es_staff():
        return {
            "ok": False,
            "mensaje": "Solo el personal de soporte puede catalogar tickets.",
        }, 403

    ticket, error = _buscar_ticket(id_ticket)
    if error:
        return error

    if ticket.estado == "ELIMINADO":
        return {"ok": False, "mensaje": "El ticket fue eliminado."}, 409

    cambios, error = _validar_catalogo(datos)
    if error:
        return {"ok": False, "mensaje": error}, 400

    try:
        for campo, valor in cambios.items():
            setattr(ticket, campo, valor)
        ticket.fechaActualizacion = seguridad.ahora_utc()
        db.session.commit()
        respuestas, asignaciones, usuarios = _relaciones([ticket])
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo catalogar el ticket."}, 503

    return {
        "ok": True,
        "data": {
            "ticket": _serializar_ticket(
                ticket,
                respuestas.get(ticket.idTicket, []),
                asignaciones.get(ticket.idTicket),
                usuarios,
            )
        },
        "mensaje": "Ticket catalogado correctamente.",
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
        # El cliente recibe la notificacion del sistema al responder el staff.
        if ticket.usuarioId != current_user.idUsuario:
            notificacion_service.notificar(
                ticket.usuarioId,
                "SISTEMA",
                "Respuesta a tu reporte",
                f'Tu reporte "{ticket.asunto}" recibio una respuesta.',
            )
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo registrar la respuesta."}, 503

    return {
        "ok": True,
        "data": {"respuesta": _serializar_respuesta(respuesta, current_user)},
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

    # El cliente manda la asignación que tenía para detectar si otro la cambió.
    validar_actual = "idAsignacionActual" in datos
    id_asignacion_actual = datos.get("idAsignacionActual")
    if validar_actual and id_asignacion_actual is not None:
        if (
            isinstance(id_asignacion_actual, bool)
            or not isinstance(id_asignacion_actual, int)
            or id_asignacion_actual < 1
        ):
            return {
                "ok": False,
                "mensaje": "La asignación actual debe ser un identificador válido.",
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

    # CA2: solo el admin elige a otro trabajador; un trabajador solo se toma
    # el ticket para sí mismo.
    es_admin = current_user.rolGlobal == "ADMIN"
    if not es_admin:
        trabajador_id = current_user.idUsuario

    ahora = seguridad.ahora_utc()
    try:
        trabajador = db.session.get(Usuario, trabajador_id)
        if (
            trabajador is None
            or trabajador.rolGlobal not in {"ADMIN", "TRABAJADOR"}
            or trabajador.estado != "ACTIVO"
        ):
            return {
                "ok": False,
                "mensaje": "El trabajador no existe o no está activo.",
            }, 400

        actual = db.session.execute(
            db.select(AsignacionTicket).where(
                AsignacionTicket.ticketId == ticket.idTicket,
                AsignacionTicket.esActual == db.true(),
            )
        ).scalar_one_or_none()

        # CA3: si ya tiene responsable, otro trabajador no puede tomarlo.
        if (
            not es_admin
            and actual is not None
            and actual.trabajadorId != current_user.idUsuario
        ):
            return {
                "ok": False,
                "mensaje": "El ticket ya tiene un responsable asignado.",
            }, 409

        if validar_actual:
            actual_id = actual.idAsignacion if actual is not None else None
            if actual_id != id_asignacion_actual:
                return {
                    "ok": False,
                    "mensaje": (
                        "El ticket ya fue tomado o su asignación cambió. "
                        "Actualiza la lista e intenta de nuevo."
                    ),
                }, 409

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
        respuestas, asignaciones, usuarios = _relaciones([ticket])
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
                usuarios,
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


def _validar_catalogo(datos):
    cambios = {}

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
    if usuario.rolGlobal == "ADMIN":
        return []
    if usuario.rolGlobal == "TRABAJADOR":
        # El trabajador ve los tickets asignados a él y los que aún no tienen
        # responsable (para poder tomarlos).
        con_responsable = db.select(AsignacionTicket.ticketId).where(
            AsignacionTicket.esActual == db.true()
        )
        mios = db.select(AsignacionTicket.ticketId).where(
            AsignacionTicket.esActual == db.true(),
            AsignacionTicket.trabajadorId == usuario.idUsuario,
        )
        return [
            db.or_(
                Ticket.idTicket.in_(mios),
                Ticket.idTicket.notin_(con_responsable),
            )
        ]
    return [Ticket.usuarioId == usuario.idUsuario]


def _filtros_tickets(categoria, prioridad, responsable, desde, hasta):
    filtros = []
    if categoria:
        filtros.append(Ticket.categoria == categoria)
    if prioridad:
        filtros.append(Ticket.prioridad == prioridad)
    if responsable:
        filtros.append(
            Ticket.idTicket.in_(
                db.select(AsignacionTicket.ticketId).where(
                    AsignacionTicket.esActual == db.true(),
                    AsignacionTicket.trabajadorId == responsable,
                )
            )
        )
    if desde:
        filtros.append(Ticket.fechaCreacion >= desde)
    if hasta:
        filtros.append(Ticket.fechaCreacion < hasta + timedelta(days=1))
    return filtros


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
        return {}, {}, {}

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

    # Incluye al cliente del ticket, al asignado actual y a los autores del hilo.
    usuario_ids = {ticket.usuarioId for ticket in tickets}
    usuario_ids.update(respuesta.usuarioId for respuesta in respuestas)
    usuario_ids.update(asignacion.trabajadorId for asignacion in asignaciones)
    usuarios = {
        usuario.idUsuario: usuario
        for usuario in db.session.execute(
            db.select(Usuario).where(Usuario.idUsuario.in_(usuario_ids))
        )
        .scalars()
        .all()
    }

    por_ticket = {}
    for respuesta in respuestas:
        por_ticket.setdefault(respuesta.ticketId, []).append(respuesta)
    return por_ticket, {a.ticketId: a for a in asignaciones}, usuarios


def _aplicar_asignacion(ticket, asignacion_anterior, momento):
    if asignacion_anterior is not None:
        asignacion_anterior.esActual = False
        asignacion_anterior.fechaFin = momento
    ticket.estado = "EN_PROCESO"


def _cerrar_ticket(ticket, momento):
    ticket.estado = "CERRADO"
    ticket.fechaCierre = momento


def _serializar_ticket(ticket, respuestas, asignacion, usuarios=None):
    usuarios = usuarios or {}
    cliente = usuarios.get(ticket.usuarioId)
    asignado = (
        usuarios.get(asignacion.trabajadorId) if asignacion is not None else None
    )
    return {
        "idTicket": ticket.idTicket,
        "asunto": ticket.asunto,
        "descripcion": ticket.descripcion,
        "categoria": ticket.categoria,
        "prioridad": ticket.prioridad,
        "estado": ticket.estado,
        "cliente": _nombre_usuario(cliente),
        "asignado": _nombre_usuario(asignado),
        "fechaCreacion": _fecha(ticket.fechaCreacion),
        "fechaCierre": _fecha(ticket.fechaCierre),
        "respuestas": [
            _serializar_respuesta(respuesta, usuarios.get(respuesta.usuarioId))
            for respuesta in respuestas
        ],
        "asignacionActual": _serializar_asignacion(asignacion),
    }


def _serializar_respuesta(respuesta, autor=None):
    nombre = None
    if autor is not None:
        nombre = f"{autor.nombreUsuario} {autor.apaterno or ''}".strip()

    return {
        "idRespuesta": respuesta.idRespuesta,
        "ticketId": respuesta.ticketId,
        "usuarioId": respuesta.usuarioId,
        "autor": nombre,
        "iniciales": iniciales(autor) if autor is not None else None,
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


def _nombre_usuario(usuario):
    if usuario is None:
        return None
    partes = [
        usuario.nombreUsuario,
        usuario.apaterno,
        getattr(usuario, "amaterno", None),
    ]
    return " ".join(parte for parte in partes if parte).strip()


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
