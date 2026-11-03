from datetime import date, datetime, time
from decimal import Decimal, InvalidOperation
from flask_jwt_extended import current_user
from sqlalchemy import func, or_
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import (
    Cartera,
    Categoria,
    MiembroCartera,
    Notificacion,
    PreferenciaUsuario,
    Transaccion,
)

TIPOS = {"INGRESO", "GASTO"}
METODOS_PAGO = {"EFECTIVO", "TARJETA", "TRANSFERENCIA"}


def crear(id_cartera, datos):
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

    _, cartera = fila

    if cartera.estado != "ACTIVA":
        return {
            "ok": False,
            "mensaje": "No se pueden registrar movimientos en una cartera inactiva o finalizada.",
        }, 409

    tipo = datos.get("tipo", "GASTO")
    if not isinstance(tipo, str):
        return {"ok": False, "mensaje": "El tipo es obligatorio."}, 400
    tipo = tipo.strip().upper()
    if tipo not in TIPOS:
        return {"ok": False, "mensaje": "El tipo debe ser INGRESO o GASTO."}, 400

    monto, error = _validar_monto(datos.get("monto"))
    if error:
        return {"ok": False, "mensaje": error}, 400

    fecha, error = _validar_fecha(datos.get("fecha"))
    if error:
        return {"ok": False, "mensaje": error}, 400

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

    metodo_pago = datos.get("metodoPago")
    if metodo_pago is not None and not isinstance(metodo_pago, str):
        return {"ok": False, "mensaje": "El método de pago no es válido."}, 400
    if isinstance(metodo_pago, str):
        metodo_pago = metodo_pago.strip().upper() or None
    if metodo_pago and metodo_pago not in METODOS_PAGO:
        return {"ok": False, "mensaje": "El método de pago no es válido."}, 400

    comprobante = datos.get("comprobanteUrl")
    if comprobante is not None and not isinstance(comprobante, str):
        return {"ok": False, "mensaje": "El comprobante debe ser una URL."}, 400
    if isinstance(comprobante, str):
        comprobante = comprobante.strip() or None
    if comprobante and len(comprobante) > 500:
        return {
            "ok": False,
            "mensaje": "El comprobante admite hasta 500 caracteres.",
        }, 400

    try:
        categoria, error = _buscar_categoria(
            id_cartera,
            cartera.tipo,
            tipo,
            datos.get("categoriaId"),
        )
    except SQLAlchemyError:
        return {"ok": False, "mensaje": "No se pudo validar la categoría."}, 503
    if error:
        return {"ok": False, "mensaje": error}, 400

    transaccion = Transaccion(
        carteraId=id_cartera,
        usuarioId=current_user.idUsuario,
        categoriaId=categoria.idCategoria,
        tipo=tipo,
        monto=monto,
        descripcion=descripcion,
        metodoPago=metodo_pago,
        comprobanteUrl=comprobante,
        estado="ACTIVO",
        fechaTransaccion=datetime.combine(fecha, time.min),
    )
    db.session.add(transaccion)

    try:
        db.session.flush()
        _notificar_movimiento(cartera, transaccion)
        resumen = _recalcular_saldo(cartera)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo registrar la transacción."}, 503

    return {
        "ok": True,
        "data": {
            "transaccion": _serializar(transaccion),
            "resumen": resumen,
        },
        "mensaje": "Transacción registrada correctamente.",
    }, 201


def _validar_monto(valor):
    if valor is None:
        return None, "El monto es obligatorio."
    if isinstance(valor, bool) or not isinstance(valor, (int, float)):
        return None, "El monto debe ser un número."
    try:
        monto = Decimal(str(valor))
    except (InvalidOperation, ValueError):
        return None, "El monto debe ser un número."
    if not monto.is_finite() or monto <= 0:
        return None, "El monto debe ser mayor a 0."
    if monto > Decimal("9999999999.99"):
        return None, "El monto excede el máximo permitido."
    return monto.quantize(Decimal("0.01")), None


def _validar_fecha(valor):
    if valor is None:
        return date.today(), None
    if not isinstance(valor, str):
        return None, "La fecha debe tener formato YYYY-MM-DD."
    try:
        return date.fromisoformat(valor), None
    except ValueError:
        return None, "La fecha debe tener formato YYYY-MM-DD."


def _buscar_categoria(id_cartera, tipo_cartera, tipo, categoria_id):
    if tipo == "INGRESO":
        categoria = db.session.execute(
            db.select(Categoria).where(
                Categoria.carteraId.is_(None),
                Categoria.nombre == "Aportación",
                Categoria.estado == "ACTIVA",
            )
        ).scalar_one_or_none()
        if not categoria:
            return None, "No está configurada la categoría Aportación."
        return categoria, None

    if isinstance(categoria_id, bool) or not isinstance(categoria_id, int):
        return None, "La categoría es obligatoria para un gasto."

    categoria = db.session.execute(
        db.select(Categoria).where(
            Categoria.idCategoria == categoria_id,
            Categoria.estado == "ACTIVA",
            or_(
                Categoria.carteraId == id_cartera,
                Categoria.carteraId.is_(None),
            ),
            or_(
                Categoria.tipoCartera.is_(None),
                Categoria.tipoCartera == tipo_cartera,
            ),
            Categoria.tipo.in_(("GASTO", "AMBOS")),
        )
    ).scalar_one_or_none()
    if not categoria:
        return None, "La categoría no es válida para esta cartera."
    return categoria, None


def _notificar_movimiento(cartera, transaccion):
    miembros = db.session.execute(
        db.select(MiembroCartera.usuarioId).where(
            MiembroCartera.carteraId == cartera.idCartera,
            MiembroCartera.estado == "ACTIVO",
            MiembroCartera.usuarioId != transaccion.usuarioId,
        )
    ).scalars().all()

    for usuario_id in miembros:
        preferencia = db.session.get(PreferenciaUsuario, usuario_id)
        if preferencia is not None and not preferencia.notificacionesApp:
            continue
        db.session.add(
            Notificacion(
                usuarioId=usuario_id,
                titulo=f"Nuevo movimiento en {cartera.nombre}",
                mensaje=(
                    f"{current_user.nombreUsuario} registró un "
                    f"{transaccion.tipo.lower()} de ${transaccion.monto:.2f}."
                ),
                tipo="MOVIMIENTO",
            )
        )


def _recalcular_saldo(cartera):
    totales = db.session.execute(
        db.select(
            Transaccion.tipo,
            func.coalesce(func.sum(Transaccion.monto), 0),
        )
        .where(
            Transaccion.carteraId == cartera.idCartera,
            Transaccion.estado == "ACTIVO",
        )
        .group_by(Transaccion.tipo)
    ).all()
    por_tipo = {tipo: Decimal(total) for tipo, total in totales}
    ingresos = por_tipo.get("INGRESO", Decimal("0"))
    gastos = por_tipo.get("GASTO", Decimal("0"))
    saldo = Decimal(cartera.presupuestoInicial or 0) + ingresos - gastos
    return {
        "totalIngresos": float(ingresos),
        "totalGastos": float(gastos),
        "saldo": float(saldo),
    }


def _serializar(transaccion):
    return {
        "idTransaccion": transaccion.idTransaccion,
        "carteraId": transaccion.carteraId,
        "usuarioId": transaccion.usuarioId,
        "categoriaId": transaccion.categoriaId,
        "tipo": transaccion.tipo,
        "monto": float(transaccion.monto),
        "descripcion": transaccion.descripcion,
        "metodoPago": transaccion.metodoPago,
        "comprobanteUrl": transaccion.comprobanteUrl,
        "estado": transaccion.estado,
        "fecha": transaccion.fechaTransaccion.date().isoformat(),
    }
