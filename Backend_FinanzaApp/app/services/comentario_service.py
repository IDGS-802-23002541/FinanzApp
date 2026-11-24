import math
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


def listar_comentarios(pagina="1", por_pagina="20"):
    if current_user.rolGlobal not in ROLES_BUZON:
        return {
            "ok": False,
            "mensaje": "No tienes permisos para ver los comentarios.",
        }, 403

    pagina, error = _entero("pagina", pagina, 1)
    if error:
        return {"ok": False, "mensaje": error}, 400
    por_pagina, error = _entero("porPagina", por_pagina, 1, 100)
    if error:
        return {"ok": False, "mensaje": error}, 400

    # El buzón muestra los comentarios activos; los archivados solo se conservan.
    filtro = ComentarioLanding.estado != "ARCHIVADO"

    try:
        total = db.session.execute(
            db.select(func.count()).select_from(ComentarioLanding).where(filtro)
        ).scalar_one()
        comentarios = (
            db.session.execute(
                db.select(ComentarioLanding)
                .where(filtro)
                .order_by(
                    ComentarioLanding.fechaCreacion.desc(),
                    ComentarioLanding.idComentario.desc(),
                )
                .offset((pagina - 1) * por_pagina)
                .limit(por_pagina)
            )
            .scalars()
            .all()
        )
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudieron obtener los comentarios.",
        }, 503

    return {
        "ok": True,
        "data": [serializar_comentario(comentario) for comentario in comentarios],
        "paginacion": {
            "pagina": pagina,
            "porPagina": por_pagina,
            "total": total,
            "totalPaginas": math.ceil(total / por_pagina) if total else 0,
        },
        "mensaje": "Comentarios obtenidos correctamente.",
    }, 200


def archivar_comentario(id_comentario):
    if current_user.rolGlobal not in ROLES_BUZON:
        return {
            "ok": False,
            "mensaje": "No tienes permisos para archivar comentarios.",
        }, 403

    comentario = db.session.get(ComentarioLanding, id_comentario)
    if comentario is None:
        return {"ok": False, "mensaje": "Comentario no encontrado."}, 404

    # Archivar es una baja lógica: el registro se conserva con otro estado.
    comentario.estado = "ARCHIVADO"
    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo archivar el comentario.",
        }, 503

    return {
        "ok": True,
        "data": serializar_comentario(comentario),
        "mensaje": "Comentario archivado correctamente.",
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


def _entero(nombre, valor, minimo, maximo=None):
    try:
        numero = int(valor)
    except (TypeError, ValueError):
        return None, f"El parámetro {nombre} debe ser un número entero."
    if numero < minimo or (maximo is not None and numero > maximo):
        rango = f"entre {minimo} y {maximo}" if maximo is not None else f"mínimo {minimo}"
        return None, f"El parámetro {nombre} debe estar {rango}."
    return numero, None


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
