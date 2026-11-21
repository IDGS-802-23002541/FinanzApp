from datetime import timedelta

from flask_jwt_extended import current_user
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import ComentarioLanding
from app.utils import seguridad, validacion
from app.utils.serializers import serializar_comentario

# Anti-spam: máximo de comentarios por IP dentro de la ventana.
LIMITE_POR_IP = 3
VENTANA_MINUTOS = 10
ROLES_BUZON = {"ADMIN", "TRABAJADOR"}


def listar_comentarios():
    if current_user.rolGlobal not in ROLES_BUZON:
        return {
            "ok": False,
            "mensaje": "No tienes permisos para ver los comentarios.",
        }, 403

    try:
        comentarios = db.session.execute(
            db.select(ComentarioLanding).order_by(
                ComentarioLanding.fechaCreacion.desc()
            )
        ).scalars().all()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudieron obtener los comentarios.",
        }, 503

    return {
        "ok": True,
        "data": [serializar_comentario(comentario) for comentario in comentarios],
        "mensaje": "Comentarios obtenidos correctamente.",
    }, 200


def crear_comentario(nombre, correo, comentario, ip=None):
    nombre = _texto(nombre)
    correo = _texto(correo)
    comentario = _texto(comentario)

    if not nombre or not correo or not comentario:
        return {"ok": False, "mensaje": "Todos los campos son obligatorios."}, 400

    if len(nombre) > 120:
        return {
            "ok": False,
            "mensaje": "El nombre no puede exceder los 120 caracteres.",
        }, 400

    if len(correo) > 254:
        return {
            "ok": False,
            "mensaje": "El correo no puede exceder los 254 caracteres.",
        }, 400

    if len(comentario) > 2000:
        return {
            "ok": False,
            "mensaje": "El comentario no puede exceder los 2000 caracteres.",
        }, 400

    if not validacion.correo_valido(correo):
        return {
            "ok": False,
            "mensaje": "El correo proporcionado no es válido.",
        }, 400

    nuevo_comentario = ComentarioLanding(
        nombre=nombre,
        correo=correo,
        comentario=comentario,
        ip=ip,
        estado="PENDIENTE",
    )

    try:
        # El conteo va antes de agregar la fila: si no, la inserción pendiente
        # se contaría a sí misma en el flush que dispara el SELECT.
        if _supera_limite(ip):
            return {
                "ok": False,
                "mensaje": (
                    "Recibimos varios mensajes tuyos. Intenta de nuevo más tarde."
                ),
            }, 429
        db.session.add(nuevo_comentario)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo guardar el comentario. Inténtalo de nuevo.",
        }, 503

    return {
        "ok": True,
        "data": serializar_comentario(nuevo_comentario),
        "mensaje": "Comentario creado correctamente.",
    }, 201


def _texto(valor):
    if not isinstance(valor, str):
        return ""
    return valor.strip()


def _supera_limite(ip):
    if not ip:
        return False

    corte = seguridad.ahora_utc() - timedelta(minutes=VENTANA_MINUTOS)
    total = db.session.execute(
        db.select(func.count())
        .select_from(ComentarioLanding)
        .where(
            ComentarioLanding.ip == ip,
            ComentarioLanding.fechaCreacion >= corte,
        )
    ).scalar_one()

    return total >= LIMITE_POR_IP
