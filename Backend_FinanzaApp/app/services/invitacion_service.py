import secrets
from datetime import datetime, timedelta, timezone

from flask_jwt_extended import current_user
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import Cartera, Invitacion, MiembroCartera, Usuario

ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
DIAS_VIGENCIA = 7


def generar(id_cartera):
    try:
        fila = db.session.execute(
            db.select(MiembroCartera, Cartera)
            .join(Cartera, Cartera.idCartera == MiembroCartera.carteraId)
            .where(
                MiembroCartera.carteraId == id_cartera,
                MiembroCartera.usuarioId == current_user.idUsuario,
                MiembroCartera.estado == "ACTIVO",
            )
        ).first()
    except SQLAlchemyError:
        return {"ok": False, "mensaje": "No se pudo validar la cartera."}, 503

    if not fila:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404

    membresia, cartera = fila

    if membresia.rol != "ADMIN":
        return {
            "ok": False,
            "mensaje": "Solo el propietario o administrador puede invitar.",
        }, 403

    if cartera.estado != "ACTIVA":
        return {
            "ok": False,
            "mensaje": "No se pueden generar invitaciones en una cartera inactiva o finalizada.",
        }, 409

    ahora = _ahora()
    try:
        activas = db.session.execute(
            db.select(Invitacion).where(
                Invitacion.carteraId == id_cartera,
                Invitacion.estado == "ACTIVA",
            )
        ).scalars().all()
        for invitacion in activas:
            invitacion.estado = "REVOCADA"
            invitacion.fechaRevocacion = ahora

        codigo = _generar_codigo()
        if codigo is None:
            db.session.rollback()
            return {"ok": False, "mensaje": "No se pudo generar la invitación."}, 503

        invitacion = Invitacion(
            carteraId=id_cartera,
            usuarioId=current_user.idUsuario,
            codigoHash=codigo,
            fechaExpiracion=ahora + timedelta(days=DIAS_VIGENCIA),
            estado="ACTIVA",
        )
        db.session.add(invitacion)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo generar la invitación."}, 503

    return {
        "ok": True,
        "data": _serializar_invitacion(invitacion),
        "mensaje": "Invitación generada correctamente.",
    }, 201


def consultar(id_cartera):
    try:
        membresia = db.session.execute(
            db.select(MiembroCartera).where(
                MiembroCartera.carteraId == id_cartera,
                MiembroCartera.usuarioId == current_user.idUsuario,
                MiembroCartera.estado == "ACTIVO",
            )
        ).scalar_one_or_none()
    except SQLAlchemyError:
        return {"ok": False, "mensaje": "No se pudo validar la cartera."}, 503

    if not membresia:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404

    if membresia.rol != "ADMIN":
        return {
            "ok": False,
            "mensaje": "Solo el propietario o administrador puede ver la invitación.",
        }, 403

    try:
        invitacion = db.session.execute(
            db.select(Invitacion)
            .where(
                Invitacion.carteraId == id_cartera,
                Invitacion.estado == "ACTIVA",
            )
            .order_by(Invitacion.fechaCreacion.desc())
        ).scalars().first()

        filas = db.session.execute(
            db.select(MiembroCartera, Usuario)
            .join(Usuario, Usuario.idUsuario == MiembroCartera.usuarioId)
            .where(
                MiembroCartera.carteraId == id_cartera,
                MiembroCartera.estado == "ACTIVO",
                MiembroCartera.rol == "CONTRIBUYENTE",
            )
            .order_by(MiembroCartera.fechaUnion.desc())
        ).all()
    except SQLAlchemyError:
        return {"ok": False, "mensaje": "No se pudo obtener la invitación."}, 503

    return {
        "ok": True,
        "data": {
            "invitacion": _serializar_invitacion(invitacion) if invitacion else None,
            "ingresos": [
                {
                    "idUsuario": usuario.idUsuario,
                    "nombre": f"{usuario.nombreUsuario} {usuario.apaterno or ''}".strip(),
                    "iniciales": _iniciales(usuario),
                    "fechaUnion": membresia_miembro.fechaUnion.isoformat(),
                }
                for membresia_miembro, usuario in filas
            ],
        },
        "mensaje": "Invitación obtenida correctamente.",
    }, 200


def unirse(codigo):
    codigo = _normalizar_codigo(codigo)
    if codigo is None:
        return {
            "ok": False,
            "mensaje": "La clave debe tener 8 caracteres válidos.",
        }, 400

    try:
        invitacion = db.session.execute(
            db.select(Invitacion).where(Invitacion.codigoHash == codigo)
        ).scalar_one_or_none()
    except SQLAlchemyError:
        return {"ok": False, "mensaje": "No se pudo validar la invitación."}, 503

    if not invitacion:
        return {"ok": False, "mensaje": "Invitación no encontrada."}, 404

    if invitacion.estado != "ACTIVA":
        return {"ok": False, "mensaje": "La invitación ya no está vigente."}, 409

    ahora = _ahora()
    if invitacion.fechaExpiracion <= ahora:
        return {"ok": False, "mensaje": "La invitación expiró."}, 409

    cartera = db.session.get(Cartera, invitacion.carteraId)
    if cartera is None or cartera.estado != "ACTIVA":
        return {
            "ok": False,
            "mensaje": "La cartera ya no está activa.",
        }, 409

    membresia = db.session.get(
        MiembroCartera,
        (invitacion.carteraId, current_user.idUsuario),
    )

    if membresia is not None and membresia.estado == "ACTIVO":
        return {
            "ok": False,
            "mensaje": "Ya formas parte de esta cartera.",
        }, 409

    if membresia is not None:
        membresia.estado = "ACTIVO"
        membresia.rol = "CONTRIBUYENTE"
        membresia.fechaBaja = None
        membresia.fechaUnion = ahora
    else:
        membresia = MiembroCartera(
            carteraId=invitacion.carteraId,
            usuarioId=current_user.idUsuario,
            rol="CONTRIBUYENTE",
            estado="ACTIVO",
            fechaUnion=ahora,
        )
        db.session.add(membresia)

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo unir a la cartera."}, 503

    return {
        "ok": True,
        "data": {
            "invitacionId": invitacion.idInvitacion,
            "cartera": {
                "id": cartera.idCartera,
                "nombre": cartera.nombre,
                "estado": cartera.estado,
            },
            "miembro": {
                "usuarioId": membresia.usuarioId,
                "rol": "COLABORADOR",
                "estado": membresia.estado,
                "fechaUnion": membresia.fechaUnion.isoformat(),
            },
        },
        "mensaje": "Te uniste a la cartera correctamente.",
    }, 201


def _generar_codigo():
    for _ in range(5):
        codigo = "".join(secrets.choice(ALFABETO) for _ in range(8))
        existe = db.session.execute(
            db.select(Invitacion.idInvitacion).where(
                Invitacion.codigoHash == codigo
            )
        ).first()
        if not existe:
            return codigo
    return None


def _normalizar_codigo(valor):
    if not isinstance(valor, str):
        return None
    codigo = valor.strip().upper()
    if len(codigo) != 8:
        return None
    if any(caracter not in ALFABETO for caracter in codigo):
        return None
    return codigo


def _serializar_invitacion(invitacion):
    return {
        "idInvitacion": invitacion.idInvitacion,
        "carteraId": invitacion.carteraId,
        "codigo": invitacion.codigoHash,
        "qrContenido": f"finanzapp://invitacion/{invitacion.codigoHash}",
        "fechaCreacion": invitacion.fechaCreacion.isoformat(),
        "fechaExpiracion": invitacion.fechaExpiracion.isoformat(),
        "estado": invitacion.estado,
        "expirada": invitacion.fechaExpiracion <= _ahora(),
    }


def _iniciales(usuario):
    return f"{(usuario.nombreUsuario or ' ')[0]}{(usuario.apaterno or ' ')[0]}".upper()


def _ahora():
    return datetime.now(timezone.utc).replace(tzinfo=None)
