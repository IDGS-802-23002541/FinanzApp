import math
import secrets
import time

from flask_jwt_extended import current_user
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models import AsignacionTicket, SesionUsuario, Ticket, Usuario
from app.utils import seguridad, validacion
from app.utils.serializers import serializar_usuario

TTL_METRICAS = 60
_CACHE_METRICAS = {"monotonico": 0.0, "respuesta": None}


def limpiar_cache_metricas():
    _CACHE_METRICAS["monotonico"] = 0.0
    _CACHE_METRICAS["respuesta"] = None


MAPA_ESTADO_TICKETS = {
    "ABIERTO": "abiertos",
    "EN_PROCESO": "enProceso",
    "ESPERA": "enEspera",
    "RESUELTO": "resueltos",
    "CERRADO": "cerrados",
}


def metricas(forzar=False):
    if current_user.rolGlobal != "ADMIN":
        return {
            "ok": False,
            "mensaje": "Solo un administrador puede consultar las métricas.",
        }, 403

    if not forzar and _CACHE_METRICAS["respuesta"] is not None:
        if time.monotonic() - _CACHE_METRICAS["monotonico"] < TTL_METRICAS:
            return _CACHE_METRICAS["respuesta"]

    try:
        clientes = _conteo_usuarios("CLIENTE")
        trabajadores = _conteo_usuarios("TRABAJADOR")
        tickets = _conteo_tickets()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudieron obtener las métricas.",
        }, 503

    activos = clientes.get("ACTIVO", 0)
    inactivos = clientes.get("INACTIVO", 0)
    respuesta = (
        {
            "ok": True,
            "data": {
                "clientes": {
                    "total": activos + inactivos,
                    "activos": activos,
                    "inactivos": inactivos,
                },
                "trabajadores": {"activos": trabajadores.get("ACTIVO", 0)},
                "tickets": _resumen_tickets(tickets),
            },
            "mensaje": "Métricas obtenidas correctamente.",
        },
        200,
    )
    _CACHE_METRICAS["monotonico"] = time.monotonic()
    _CACHE_METRICAS["respuesta"] = respuesta
    return respuesta


def listar_trabajadores(pagina="1", por_pagina="20"):
    if current_user.rolGlobal not in {"ADMIN", "TRABAJADOR"}:
        return {
            "ok": False,
            "mensaje": "Solo el personal de soporte puede consultar trabajadores.",
        }, 403

    pagina, error = _entero("pagina", pagina, 1)
    if error:
        return {"ok": False, "mensaje": error}, 400
    por_pagina, error = _entero("porPagina", por_pagina, 1, 100)
    if error:
        return {"ok": False, "mensaje": error}, 400

    filtro = (
        Usuario.rolGlobal.in_(("ADMIN", "TRABAJADOR")),
        Usuario.estado == "ACTIVO",
    )

    try:
        total = db.session.execute(
            db.select(func.count()).select_from(Usuario).where(*filtro)
        ).scalar_one()
        trabajadores = (
            db.session.execute(
                db.select(Usuario)
                .where(*filtro)
                .order_by(Usuario.nombreUsuario, Usuario.apaterno)
                .offset((pagina - 1) * por_pagina)
                .limit(por_pagina)
            )
            .scalars()
            .all()
        )
        tickets = _tickets_actuales(
            [trabajador.idUsuario for trabajador in trabajadores]
        )
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudieron obtener los trabajadores.",
        }, 503

    return {
        "ok": True,
        "data": {
            "trabajadores": [
                _serializar_trabajador(
                    trabajador, tickets.get(trabajador.idUsuario, [])
                )
                for trabajador in trabajadores
            ]
        },
        "paginacion": {
            "pagina": pagina,
            "porPagina": por_pagina,
            "total": total,
            "totalPaginas": math.ceil(total / por_pagina) if total else 0,
        },
        "mensaje": "Trabajadores obtenidos correctamente.",
    }, 200


def crear_trabajador(datos):
    if current_user.rolGlobal != "ADMIN":
        return {
            "ok": False,
            "mensaje": "Solo un administrador puede crear trabajadores.",
        }, 403

    campos, error = validacion.datos_usuario(datos)
    if error:
        return {"ok": False, "mensaje": error}, 400

    existe = db.session.execute(
        db.select(Usuario).where(Usuario.correo == campos["correo"])
    ).scalar_one_or_none()
    if existe:
        return {"ok": False, "mensaje": "El correo ya está registrado."}, 409

    temporal = _contrasenia_temporal()
    trabajador = Usuario(
        **campos,
        contrasenia=generate_password_hash(temporal),
        rolGlobal="TRABAJADOR",
        estado="ACTIVO",
        debeCambiarContrasenia=True,
    )
    db.session.add(trabajador)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {"ok": False, "mensaje": "El correo ya está registrado."}, 409

    # shortcut: el backend solo marca debeCambiarContrasenia; bloquear rutas
    # hasta que la cambie lo hace el frontend. Se refuerza aquí si aparece un
    # cliente que lo ignore.
    return {
        "ok": True,
        "data": {
            "usuario": serializar_usuario(trabajador),
            "contraseniaTemporal": temporal,
        },
        "mensaje": "Trabajador creado. Comparte la contraseña temporal.",
    }, 201


def editar_trabajador(id_trabajador, datos):
    if current_user.rolGlobal != "ADMIN":
        return {
            "ok": False,
            "mensaje": "Solo un administrador puede editar trabajadores.",
        }, 403

    trabajador, error = _buscar_trabajador(id_trabajador)
    if error:
        return error

    campos, error = validacion.datos_usuario(datos)
    if error:
        return {"ok": False, "mensaje": error}, 400

    repetido = db.session.execute(
        db.select(Usuario.idUsuario).where(
            Usuario.correo == campos["correo"],
            Usuario.idUsuario != id_trabajador,
        )
    ).scalar_one_or_none()
    if repetido is not None:
        return {"ok": False, "mensaje": "El correo ya está registrado."}, 409

    for campo, valor in campos.items():
        setattr(trabajador, campo, valor)
    trabajador.fechaActualizacion = seguridad.ahora_utc()

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {"ok": False, "mensaje": "El correo ya está registrado."}, 409
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo actualizar el trabajador.",
        }, 503

    return {
        "ok": True,
        "data": {"trabajador": _serializar_trabajador(trabajador)},
        "mensaje": "Trabajador actualizado correctamente.",
    }, 200


def eliminar_trabajador(id_trabajador):
    if current_user.rolGlobal != "ADMIN":
        return {
            "ok": False,
            "mensaje": "Solo un administrador puede dar de baja trabajadores.",
        }, 403

    trabajador, error = _buscar_trabajador(id_trabajador)
    if error:
        return error

    ahora = seguridad.ahora_utc()
    trabajador.estado = "INACTIVO"
    trabajador.fechaActualizacion = ahora

    # Los tickets que atendía quedan libres y sus sesiones se revocan.
    db.session.execute(
        db.update(AsignacionTicket)
        .where(
            AsignacionTicket.trabajadorId == trabajador.idUsuario,
            AsignacionTicket.esActual == db.true(),
        )
        .values(esActual=False, fechaFin=ahora)
    )
    db.session.execute(
        db.update(SesionUsuario)
        .where(
            SesionUsuario.usuarioId == trabajador.idUsuario,
            SesionUsuario.fechaRevocacion.is_(None),
        )
        .values(fechaRevocacion=ahora)
    )
    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo dar de baja al trabajador.",
        }, 503

    return {
        "ok": True,
        "data": {
            "idUsuario": trabajador.idUsuario,
            "estatus": trabajador.estado,
        },
        "mensaje": "Trabajador dado de baja. Sus tickets quedaron sin asignar.",
    }, 200


def _buscar_trabajador(id_trabajador):
    trabajador = db.session.get(Usuario, id_trabajador)
    if trabajador is None or trabajador.rolGlobal not in {"ADMIN", "TRABAJADOR"}:
        return None, (
            {"ok": False, "mensaje": "El trabajador no existe."},
            404,
        )
    return trabajador, None


def _serializar_trabajador(trabajador, tickets=None):
    partes = [
        trabajador.nombreUsuario,
        trabajador.apaterno,
        getattr(trabajador, "amaterno", None),
    ]
    nombre = " ".join(parte for parte in partes if parte).strip()
    return {
        "idUsuario": trabajador.idUsuario,
        "nombreUsuario": trabajador.nombreUsuario,
        "apaterno": trabajador.apaterno,
        "amaterno": getattr(trabajador, "amaterno", None),
        "nombre": nombre,
        "correo": trabajador.correo,
        "rolGlobal": trabajador.rolGlobal,
        "estatus": trabajador.estado,
        "tickets": tickets or [],
    }


def _tickets_actuales(ids_trabajadores):
    if not ids_trabajadores:
        return {}

    filas = db.session.execute(
        db.select(
            AsignacionTicket.trabajadorId,
            Ticket.idTicket,
            Ticket.asunto,
            Ticket.estado,
        )
        .join(Ticket, Ticket.idTicket == AsignacionTicket.ticketId)
        .where(
            AsignacionTicket.trabajadorId.in_(ids_trabajadores),
            AsignacionTicket.esActual == db.true(),
            Ticket.estado != "ELIMINADO",
        )
        .order_by(Ticket.fechaCreacion.desc())
    ).all()

    por_trabajador = {}
    for trabajador_id, id_ticket, asunto, estado in filas:
        por_trabajador.setdefault(trabajador_id, []).append(
            {"idTicket": id_ticket, "asunto": asunto, "estado": estado}
        )
    return por_trabajador


def _entero(nombre, valor, minimo, maximo=None):
    try:
        numero = int(valor)
    except (TypeError, ValueError):
        return None, f"El parámetro {nombre} debe ser un número entero."
    if numero < minimo or (maximo is not None and numero > maximo):
        rango = (
            f"entre {minimo} y {maximo}" if maximo is not None else f"mínimo {minimo}"
        )
        return None, f"El parámetro {nombre} debe estar {rango}."
    return numero, None


def _conteo_usuarios(rol):
    filas = db.session.execute(
        db.select(Usuario.estado, func.count())
        .where(Usuario.rolGlobal == rol)
        .group_by(Usuario.estado)
    ).all()
    return {estado: total for estado, total in filas}


def _conteo_tickets():
    filas = db.session.execute(
        db.select(Ticket.estado, func.count())
        .where(Ticket.estado != "ELIMINADO")
        .group_by(Ticket.estado)
    ).all()
    return {estado: total for estado, total in filas}


def _resumen_tickets(conteos):
    resumen = {clave: 0 for clave in MAPA_ESTADO_TICKETS.values()}
    for estado, total in conteos.items():
        clave = MAPA_ESTADO_TICKETS.get(estado)
        if clave:
            resumen[clave] = total
    resumen["total"] = sum(resumen.values())
    return resumen


def _contrasenia_temporal():
    return f"Fin{secrets.randbelow(900000) + 100000}Tmp"
