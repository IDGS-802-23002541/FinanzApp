import secrets

from flask_jwt_extended import current_user
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models import Ticket, Usuario
from app.utils import validacion
from app.utils.serializers import serializar_usuario

MAPA_ESTADO_TICKETS = {
    "ABIERTO": "abiertos",
    "EN_PROCESO": "enProceso",
    "ESPERA": "enEspera",
    "RESUELTO": "resueltos",
    "CERRADO": "cerrados",
}


def metricas():
    if current_user.rolGlobal != "ADMIN":
        return {
            "ok": False,
            "mensaje": "Solo un administrador puede consultar las métricas.",
        }, 403

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
    return {
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
    }, 200


def listar_trabajadores():
    if current_user.rolGlobal not in {"ADMIN", "TRABAJADOR"}:
        return {
            "ok": False,
            "mensaje": "Solo el personal de soporte puede consultar trabajadores.",
        }, 403

    try:
        trabajadores = (
            db.session.execute(
                db.select(Usuario)
                .where(
                    Usuario.rolGlobal.in_(("ADMIN", "TRABAJADOR")),
                    Usuario.estado == "ACTIVO",
                )
                .order_by(Usuario.nombreUsuario, Usuario.apaterno)
            )
            .scalars()
            .all()
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
                _serializar_trabajador(trabajador) for trabajador in trabajadores
            ]
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


def _serializar_trabajador(trabajador):
    partes = [
        trabajador.nombreUsuario,
        trabajador.apaterno,
        getattr(trabajador, "amaterno", None),
    ]
    nombre = " ".join(parte for parte in partes if parte).strip()
    return {
        "idUsuario": trabajador.idUsuario,
        "nombre": nombre,
        "correo": trabajador.correo,
        "rolGlobal": trabajador.rolGlobal,
    }


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
