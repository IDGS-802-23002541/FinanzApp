from datetime import datetime, timezone

from flask_jwt_extended import current_user
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import Cartera, MiembroCartera


def eliminar(id_cartera, id_usuario):
    fila = _membresia_actual(id_cartera)
    if fila is None:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404

    membresia, cartera = fila
    if membresia.rol != "ADMIN":
        return {
            "ok": False,
            "mensaje": (
                "Solo el propietario o administrador puede eliminar "
                "colaboradores."
            ),
        }, 403

    if cartera.estado != "ACTIVA":
        return {
            "ok": False,
            "mensaje": (
                "Solo se pueden eliminar colaboradores de una cartera activa."
            ),
        }, 409

    if id_usuario == current_user.idUsuario:
        return {
            "ok": False,
            "mensaje": "El propietario no puede eliminarse a sí mismo.",
        }, 409

    objetivo = db.session.get(MiembroCartera, (id_cartera, id_usuario))
    if objetivo is None or objetivo.estado != "ACTIVO":
        return {"ok": False, "mensaje": "Colaborador no encontrado."}, 404

    if objetivo.rol == "ADMIN":
        return {
            "ok": False,
            "mensaje": "No se puede eliminar al administrador de la cartera.",
        }, 409

    _dar_baja(objetivo)
    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo eliminar al colaborador.",
        }, 503

    return {
        "ok": True,
        "data": {
            "idUsuario": objetivo.usuarioId,
            "estado": objetivo.estado,
            "fechaBaja": objetivo.fechaBaja.isoformat(),
        },
        "mensaje": "Colaborador eliminado correctamente.",
    }, 200


def salir(id_cartera):
    fila = _membresia_actual(id_cartera)
    if fila is None:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404

    membresia, cartera = fila
    if membresia.rol == "ADMIN":
        return {
            "ok": False,
            "mensaje": (
                "El propietario no puede salir de la cartera; debe delegar "
                "o cerrarla."
            ),
        }, 409

    if cartera.estado != "ACTIVA":
        return {
            "ok": False,
            "mensaje": "Solo se puede salir de una cartera activa.",
        }, 409

    _dar_baja(membresia)
    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo salir de la cartera."}, 503

    return {
        "ok": True,
        "data": {
            "carteraId": id_cartera,
            "usuarioId": membresia.usuarioId,
            "estado": membresia.estado,
            "fechaBaja": membresia.fechaBaja.isoformat(),
        },
        "mensaje": "Saliste de la cartera correctamente.",
    }, 200


def _membresia_actual(id_cartera):
    try:
        return db.session.execute(
            db.select(MiembroCartera, Cartera)
            .join(Cartera, Cartera.idCartera == MiembroCartera.carteraId)
            .where(
                MiembroCartera.carteraId == id_cartera,
                MiembroCartera.usuarioId == current_user.idUsuario,
                MiembroCartera.estado == "ACTIVO",
            )
        ).first()
    except SQLAlchemyError:
        db.session.rollback()
        return None


def _dar_baja(membresia):
    membresia.estado = "BAJA"
    membresia.fechaBaja = datetime.now(timezone.utc).replace(tzinfo=None)
