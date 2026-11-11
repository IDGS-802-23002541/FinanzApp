from datetime import datetime, timezone
from decimal import Decimal

from flask_jwt_extended import current_user
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import (
    Cartera,
    Invitacion,
    MiembroCartera,
    Notificacion,
    PreferenciaUsuario,
    Usuario,
)
from app.utils import validacion
from app.utils.serializers import (
    MAPA_TIPO_BD,
    rol_api,
    serializar_cartera,
    tipo_api,
    tipo_bd,
)

TIPOS_ENTRADA = {"HOGAR", "VIAJE", "EVENTO", "OTRO", "OTRA"}
ESTADOS_CARTERA = {"ACTIVA", "ARCHIVADA", "FINALIZADA"}
MAPA_ROL_BD = {"PROPIETARIO": "ADMIN", "COLABORADOR": "CONTRIBUYENTE"}


def crear(datos):
    nombre = datos.get("nombre")
    if not isinstance(nombre, str):
        return {"ok": False, "mensaje": "El nombre es obligatorio."}, 400
    nombre = nombre.strip()
    if not nombre or len(nombre) > 100:
        return {
            "ok": False,
            "mensaje": "El nombre debe tener entre 1 y 100 caracteres.",
        }, 400

    tipo = datos.get("tipo")
    if not isinstance(tipo, str):
        return {"ok": False, "mensaje": "El tipo es obligatorio."}, 400
    tipo = tipo.strip().upper()
    if tipo not in TIPOS_ENTRADA:
        return {"ok": False, "mensaje": "El tipo no es valido."}, 400

    descripcion = datos.get("descripcion")
    if descripcion is not None and not isinstance(descripcion, str):
        return {"ok": False, "mensaje": "La descripción debe ser texto."}, 400
    if isinstance(descripcion, str):
        descripcion = descripcion.strip() or None
    if descripcion and len(descripcion) > 500:
        return {
            "ok": False,
            "mensaje": "La descripción admite hasta 500 caracteres.",
        }, 400

    bruto = datos.get("presupuestoInicial", 0)
    if isinstance(bruto, bool) or not isinstance(bruto, (int, float)) or bruto < 0:
        return {
            "ok": False,
            "mensaje": "El presupuesto debe ser un número mayor o igual a 0.",
        }, 400
    presupuesto_inicial = Decimal(str(bruto))

    try:
        inicio = validacion.fecha_iso(datos.get("fechaInicio"))
        fin = validacion.fecha_iso(datos.get("fechaFin"))
    except ValueError:
        return {
            "ok": False,
            "mensaje": "Las fechas deben tener formato YYYY-MM-DD.",
        }, 400
    if inicio and fin and fin < inicio:
        return {
            "ok": False,
            "mensaje": "La fecha fin no puede ser anterior a la fecha inicio.",
        }, 400

    cartera = Cartera(
        nombre=nombre,
        descripcion=descripcion,
        presupuestoInicial=presupuesto_inicial,
        tipo=tipo_bd(tipo),
        fechaInicio=inicio,
        fechaFin=fin,
        estado="ACTIVA",
    )
    db.session.add(cartera)
    try:
        db.session.flush()
        db.session.add(
            MiembroCartera(
                carteraId=cartera.idCartera,
                usuarioId=current_user.idUsuario,
                rol="ADMIN",
                estado="ACTIVO",
            )
        )
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo crear la cartera."}, 503
    return {
        "ok": True,
        "data": serializar_cartera(cartera, "ADMIN", current_user),
        "mensaje": "Cartera creada correctamente.",
    }, 201


def editar(id_cartera, datos):
    fila = _membresia(id_cartera)
    if fila is None:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404

    membresia, cartera = fila
    if membresia.rol != "ADMIN":
        return {
            "ok": False,
            "mensaje": "Solo el propietario o administrador puede editar la cartera.",
        }, 403

    if cartera.estado == "FINALIZADA":
        return {
            "ok": False,
            "mensaje": "Una cartera finalizada es de solo lectura.",
        }, 409

    cambios, error = _validar_edicion(datos, cartera)
    if error:
        return error

    for campo, valor in cambios.items():
        setattr(cartera, campo, valor)

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo actualizar la cartera."}, 503

    return {
        "ok": True,
        "data": serializar_cartera(cartera, membresia.rol, _admin(id_cartera)),
        "mensaje": "Cartera actualizada correctamente.",
    }, 200


def inactivar(id_cartera):
    fila = _membresia(id_cartera)
    if fila is None:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404

    membresia, cartera = fila
    if membresia.rol != "ADMIN":
        return {
            "ok": False,
            "mensaje": "Solo el propietario o administrador puede inactivar la cartera.",
        }, 403

    if cartera.estado == "FINALIZADA":
        return {
            "ok": False,
            "mensaje": "Una cartera finalizada no se puede inactivar.",
        }, 409

    if cartera.estado == "ARCHIVADA":
        return {"ok": False, "mensaje": "La cartera ya está inactiva."}, 409

    cartera.estado = "ARCHIVADA"
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
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo inactivar la cartera."}, 503

    return {
        "ok": True,
        "data": serializar_cartera(cartera, membresia.rol, _admin(id_cartera)),
        "mensaje": "Cartera inactivada correctamente.",
    }, 200


def reactivar(id_cartera):
    fila = _membresia(id_cartera)
    if fila is None:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404

    membresia, cartera = fila
    if membresia.rol != "ADMIN":
        return {
            "ok": False,
            "mensaje": "Solo el propietario o administrador puede reactivar la cartera.",
        }, 403

    if cartera.estado == "FINALIZADA":
        return {
            "ok": False,
            "mensaje": "Una cartera finalizada no se puede reactivar.",
        }, 409

    if cartera.estado == "ACTIVA":
        return {"ok": False, "mensaje": "La cartera ya está activa."}, 409

    cartera.estado = "ACTIVA"
    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo reactivar la cartera."}, 503

    return {
        "ok": True,
        "data": serializar_cartera(cartera, membresia.rol, _admin(id_cartera)),
        "mensaje": "Cartera reactivada correctamente.",
    }, 200


def finalizar(id_cartera):
    fila = _membresia(id_cartera)
    if fila is None:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404

    membresia, cartera = fila
    if membresia.rol != "ADMIN":
        return {
            "ok": False,
            "mensaje": "Solo el propietario o administrador puede cerrar la cartera.",
        }, 403

    if cartera.tipo not in ("VIAJE", "EVENTO"):
        return {
            "ok": False,
            "mensaje": "Solo las carteras de tipo viaje o evento pueden finalizarse.",
        }, 400

    if cartera.estado == "FINALIZADA":
        return {"ok": False, "mensaje": "La cartera ya está finalizada."}, 409

    if cartera.estado != "ACTIVA":
        return {
            "ok": False,
            "mensaje": "Solo una cartera activa puede finalizarse.",
        }, 409

    from app.services import cartera_detalle_service

    try:
        balance = cartera_detalle_service.balance(id_cartera)
        cartera.estado = "FINALIZADA"
        cartera.fechaCierre = _ahora()
        _notificar_cierre(cartera)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo finalizar la cartera."}, 503

    balance["presupuestoInicial"] = float(cartera.presupuestoInicial or 0)
    return {
        "ok": True,
        "data": {
            "cartera": serializar_cartera(cartera, membresia.rol, _admin(id_cartera)),
            "balance": balance,
        },
        "mensaje": "Cartera finalizada correctamente.",
    }, 200


def _notificar_cierre(cartera):
    miembros = db.session.execute(
        db.select(MiembroCartera.usuarioId).where(
            MiembroCartera.carteraId == cartera.idCartera,
            MiembroCartera.estado == "ACTIVO",
            MiembroCartera.usuarioId != current_user.idUsuario,
        )
    ).scalars().all()

    for usuario_id in miembros:
        preferencia = db.session.get(PreferenciaUsuario, usuario_id)
        if preferencia is not None and not preferencia.notificacionesApp:
            continue
        db.session.add(
            Notificacion(
                usuarioId=usuario_id,
                titulo=f"Cartera finalizada: {cartera.nombre}",
                mensaje="La cartera se cerró y su balance ya está disponible.",
                tipo="CIERRE",
            )
        )


def _validar_edicion(datos, cartera):
    cambios = {}

    if "nombre" in datos:
        nombre = datos.get("nombre")
        if not isinstance(nombre, str):
            return None, ({"ok": False, "mensaje": "El nombre es obligatorio."}, 400)
        nombre = nombre.strip()
        if not nombre or len(nombre) > 100:
            return None, (
                {
                    "ok": False,
                    "mensaje": "El nombre debe tener entre 1 y 100 caracteres.",
                },
                400,
            )
        cambios["nombre"] = nombre

    if "descripcion" in datos:
        descripcion = datos.get("descripcion")
        if descripcion is not None and not isinstance(descripcion, str):
            return None, (
                {"ok": False, "mensaje": "La descripción debe ser texto."},
                400,
            )
        if isinstance(descripcion, str):
            descripcion = descripcion.strip() or None
        if descripcion and len(descripcion) > 500:
            return None, (
                {
                    "ok": False,
                    "mensaje": "La descripción admite hasta 500 caracteres.",
                },
                400,
            )
        cambios["descripcion"] = descripcion

    if "tipo" in datos:
        tipo = datos.get("tipo")
        if not isinstance(tipo, str):
            return None, ({"ok": False, "mensaje": "El tipo es obligatorio."}, 400)
        tipo = tipo.strip().upper()
        if tipo not in TIPOS_ENTRADA:
            return None, ({"ok": False, "mensaje": "El tipo no es valido."}, 400)
        cambios["tipo"] = tipo_bd(tipo)

    if "presupuestoInicial" in datos:
        bruto = datos.get("presupuestoInicial")
        if isinstance(bruto, bool) or not isinstance(bruto, (int, float)) or bruto < 0:
            return None, (
                {
                    "ok": False,
                    "mensaje": "El presupuesto debe ser un número mayor o igual a 0.",
                },
                400,
            )
        cambios["presupuestoInicial"] = Decimal(str(bruto))

    for campo in ("fechaInicio", "fechaFin"):
        if campo in datos:
            try:
                cambios[campo] = validacion.fecha_iso(datos.get(campo))
            except ValueError:
                return None, (
                    {
                        "ok": False,
                        "mensaje": "Las fechas deben tener formato YYYY-MM-DD.",
                    },
                    400,
                )

    if not cambios:
        return None, (
            {"ok": False, "mensaje": "No se enviaron campos para actualizar."},
            400,
        )

    inicio = cambios.get("fechaInicio", cartera.fechaInicio)
    fin = cambios.get("fechaFin", cartera.fechaFin)
    if inicio and fin and fin < inicio:
        return None, (
            {
                "ok": False,
                "mensaje": "La fecha fin no puede ser anterior a la fecha inicio.",
            },
            400,
        )

    return cambios, None


def _ahora():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def listar(estado="ACTIVA", tipo="", rol="", busqueda=""):
    estado = (estado or "ACTIVA").strip().upper()
    if estado not in ESTADOS_CARTERA:
        return {"ok": False, "mensaje": "El filtro estado no es válido."}, 400
    tipo = (tipo or "").strip().upper()
    if tipo and tipo not in TIPOS_ENTRADA:
        return {"ok": False, "mensaje": "El filtro tipo no es válido."}, 400
    rol = (rol or "").strip().upper()
    if rol and rol not in MAPA_ROL_BD:
        return {"ok": False, "mensaje": "El filtro rol no es válido."}, 400
    busqueda = (busqueda or "").strip()

    try:
        consulta = (
            db.select(MiembroCartera, Cartera)
            .join(Cartera, Cartera.idCartera == MiembroCartera.carteraId)
            .where(
                MiembroCartera.usuarioId == current_user.idUsuario,
                MiembroCartera.estado == "ACTIVO",
                Cartera.estado == estado,
            )
        )
        if tipo:
            consulta = consulta.where(Cartera.tipo == tipo_bd(tipo))
        if rol:
            consulta = consulta.where(MiembroCartera.rol == MAPA_ROL_BD[rol])
        if busqueda:
            consulta = consulta.where(Cartera.nombre.contains(busqueda))
        filas = db.session.execute(
            consulta.order_by(Cartera.fechaCreacion.desc(), Cartera.idCartera.desc())
        ).all()
    except SQLAlchemyError:
        return {"ok": False, "mensaje": "No se pudieron obtener las carteras."}, 503

    ids = [cartera.idCartera for _, cartera in filas]
    admins = {}
    if ids:
        admin_filas = db.session.execute(
            db.select(MiembroCartera.carteraId, Usuario)
            .join(Usuario, Usuario.idUsuario == MiembroCartera.usuarioId)
            .where(
                MiembroCartera.carteraId.in_(ids),
                MiembroCartera.rol == "ADMIN",
                MiembroCartera.estado == "ACTIVO",
            )
        ).all()
        admins = {cartera_id: usuario for cartera_id, usuario in admin_filas}

    data = [
        serializar_cartera(cartera, membresia.rol, admins.get(cartera.idCartera))
        for membresia, cartera in filas
    ]
    return {
        "ok": True,
        "data": data,
        "mensaje": "Carteras obtenidas correctamente.",
    }, 200


def _con_balance(data, cartera, id_cartera):
    # Al recargar una cartera finalizada se necesita el balance completo.
    if cartera.estado != "FINALIZADA":
        return data

    from app.services import cartera_detalle_service

    balance = cartera_detalle_service.balance(id_cartera)
    balance["presupuestoInicial"] = float(cartera.presupuestoInicial or 0)
    data["balance"] = balance
    return data


def obtener(id_cartera):
    fila = _membresia(id_cartera)
    if fila is None:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404
    membresia, cartera = fila
    try:
        from app.services import cartera_detalle_service

        detalle = cartera_detalle_service.resumen_y_series(cartera, None)
        data = serializar_cartera(cartera, membresia.rol, _admin(id_cartera))
        data["colaboradores"] = cartera_detalle_service.colaboradores(id_cartera)
        data.update(detalle)
        data = _con_balance(data, cartera, id_cartera)
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo obtener la cartera."}, 503
    return {
        "ok": True,
        "data": data,
        "mensaje": "Cartera obtenida correctamente.",
    }, 200


def detalle(id_cartera, periodo_id=None):
    fila = _membresia(id_cartera)
    if fila is None:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404
    membresia, cartera = fila
    try:
        from app.services import cartera_detalle_service

        try:
            detalle = cartera_detalle_service.resumen_y_series(cartera, periodo_id)
        except ValueError as exc:
            return {"ok": False, "mensaje": str(exc)}, 400
        data = serializar_cartera(cartera, membresia.rol, _admin(id_cartera))
        data["colaboradores"] = cartera_detalle_service.colaboradores(id_cartera)
        data.update(detalle)
        data = _con_balance(data, cartera, id_cartera)
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo obtener la cartera."}, 503
    return {
        "ok": True,
        "data": data,
        "mensaje": "Cartera obtenida correctamente.",
    }, 200


def periodos(id_cartera):
    if _membresia(id_cartera) is None:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404
    try:
        from app.services import cartera_detalle_service

        data = cartera_detalle_service.listar_periodos(id_cartera)
    except SQLAlchemyError:
        return {"ok": False, "mensaje": "No se pudieron obtener los periodos."}, 503
    return {
        "ok": True,
        "data": data,
        "mensaje": "Periodos obtenidos correctamente.",
    }, 200


def _membresia(id_cartera):
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


def _admin(id_cartera):
    fila = db.session.execute(
        db.select(Usuario)
        .join(MiembroCartera, MiembroCartera.usuarioId == Usuario.idUsuario)
        .where(
            MiembroCartera.carteraId == id_cartera,
            MiembroCartera.rol == "ADMIN",
            MiembroCartera.estado == "ACTIVO",
        )
    ).first()
    return fila[0] if fila else None


__all__ = [
    "TIPOS_ENTRADA",
    "ESTADOS_CARTERA",
    "MAPA_ROL_BD",
    "rol_api",
    "tipo_api",
    "MAPA_TIPO_BD",
]
