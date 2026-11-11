import math
from datetime import date, datetime, time, timedelta
from decimal import Decimal, InvalidOperation

from flask_jwt_extended import current_user
from sqlalchemy import and_, func, or_
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import (
    Cartera,
    Categoria,
    MiembroCartera,
    Notificacion,
    Periodo,
    PreferenciaUsuario,
    Transaccion,
    Usuario,
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
            "mensaje": (
                "No se pueden registrar movimientos en una cartera "
                "inactiva o finalizada."
            ),
        }, 409

    campos, error = _validar_datos(datos, id_cartera, cartera.tipo)
    if error:
        return {"ok": False, "mensaje": error[0]}, error[1]

    transaccion = Transaccion(
        carteraId=id_cartera,
        usuarioId=current_user.idUsuario,
        **campos,
    )
    db.session.add(transaccion)

    try:
        db.session.flush()
        _notificar_movimiento(cartera, transaccion)
        resumen = _recalcular_saldo(cartera)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo registrar la transacción.",
        }, 503

    return {
        "ok": True,
        "data": {
            "transaccion": _serializar(transaccion),
            "resumen": resumen,
        },
        "mensaje": "Transacción registrada correctamente.",
    }, 201


def listar(id_cartera, pagina="1", por_pagina="20", periodo_id=None):
    pagina, error = _entero_parametro("pagina", pagina, 1)
    if error:
        return {"ok": False, "mensaje": error}, 400
    por_pagina, error = _entero_parametro("porPagina", por_pagina, 1, 100)
    if error:
        return {"ok": False, "mensaje": error}, 400

    try:
        miembro = db.session.execute(
            db.select(MiembroCartera).where(
                MiembroCartera.carteraId == id_cartera,
                MiembroCartera.usuarioId == current_user.idUsuario,
                MiembroCartera.estado == "ACTIVO",
            )
        ).scalar_one_or_none()
    except SQLAlchemyError:
        return {"ok": False, "mensaje": "No se pudo validar la cartera."}, 503

    if not miembro:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404

    filtros = [
        Transaccion.carteraId == id_cartera,
        Transaccion.estado == "ACTIVO",
    ]

    if periodo_id not in (None, ""):
        periodo_id, error = _entero_parametro("periodoId", periodo_id, 1)
        if error:
            return {"ok": False, "mensaje": error}, 400
        try:
            periodo = db.session.get(Periodo, periodo_id)
        except SQLAlchemyError:
            return {
                "ok": False,
                "mensaje": "No se pudo validar el periodo.",
            }, 503
        if periodo is None or periodo.carteraId != id_cartera:
            return {
                "ok": False,
                "mensaje": "El periodo no es válido para esta cartera.",
            }, 400
        filtros.append(
            Transaccion.fechaTransaccion
            >= datetime.combine(periodo.fechaInicio, time.min)
        )
        filtros.append(
            Transaccion.fechaTransaccion
            < datetime.combine(
                periodo.fechaFin + timedelta(days=1),
                time.min,
            )
        )

    try:
        total = db.session.execute(
            db.select(func.count()).select_from(Transaccion).where(*filtros)
        ).scalar_one()
        filas = db.session.execute(
            db.select(Transaccion, Usuario, Categoria)
            .join(Usuario, Usuario.idUsuario == Transaccion.usuarioId)
            .outerjoin(
                Categoria,
                Categoria.idCategoria == Transaccion.categoriaId,
            )
            .where(*filtros)
            .order_by(
                Transaccion.fechaTransaccion.desc(),
                Transaccion.idTransaccion.desc(),
            )
            .offset((pagina - 1) * por_pagina)
            .limit(por_pagina)
        ).all()
        totales = db.session.execute(
            db.select(
                Transaccion.tipo,
                func.coalesce(func.sum(Transaccion.monto), 0),
            )
            .where(*filtros)
            .group_by(Transaccion.tipo)
        ).all()
    except SQLAlchemyError:
        return {
            "ok": False,
            "mensaje": "No se pudieron obtener las transacciones.",
        }, 503

    por_tipo = {tipo: Decimal(monto) for tipo, monto in totales}
    ingresos = por_tipo.get("INGRESO", Decimal("0"))
    gastos = por_tipo.get("GASTO", Decimal("0"))
    total_paginas = math.ceil(total / por_pagina) if total else 0
    items = [
        _serializar_listado(transaccion, autor, categoria)
        for transaccion, autor, categoria in filas
    ]
    mensaje = (
        "Transacciones obtenidas correctamente."
        if items
        else "Sin transacciones en el periodo solicitado."
    )
    return {
        "ok": True,
        "data": {
            "items": items,
            "paginacion": {
                "pagina": pagina,
                "porPagina": por_pagina,
                "total": total,
                "totalPaginas": total_paginas,
            },
            "totales": {
                "totalIngresos": float(ingresos),
                "totalGastos": float(gastos),
                "balance": float(ingresos - gastos),
            },
        },
        "mensaje": mensaje,
    }, 200


def actualizar(id_transaccion, datos):
    transaccion, cartera, error = _buscar_editable(id_transaccion)
    if error:
        return error

    campos, error = _validar_datos(datos, cartera.idCartera, cartera.tipo)
    if error:
        return {"ok": False, "mensaje": error[0]}, error[1]

    for campo, valor in campos.items():
        setattr(transaccion, campo, valor)
    transaccion.fechaActualizacion = datetime.now()

    try:
        db.session.flush()
        resumen = _recalcular_saldo(cartera)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo actualizar la transacción.",
        }, 503

    return {
        "ok": True,
        "data": {
            "transaccion": _serializar(transaccion),
            "resumen": resumen,
        },
        "mensaje": "Transacción actualizada correctamente.",
    }, 200


def eliminar(id_transaccion):
    transaccion, cartera, error = _buscar_editable(id_transaccion)
    if error:
        return error

    transaccion.estado = "ELIMINADO"
    transaccion.fechaActualizacion = datetime.now()

    try:
        db.session.flush()
        resumen = _recalcular_saldo(cartera)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo eliminar la transacción.",
        }, 503

    return {
        "ok": True,
        "data": {
            "idTransaccion": transaccion.idTransaccion,
            "estado": transaccion.estado,
            "resumen": resumen,
        },
        "mensaje": "Transacción eliminada correctamente.",
    }, 200


def _buscar_editable(id_transaccion):
    try:
        fila = db.session.execute(
            db.select(Transaccion, MiembroCartera, Cartera)
            .join(
                MiembroCartera,
                and_(
                    MiembroCartera.carteraId == Transaccion.carteraId,
                    MiembroCartera.usuarioId == current_user.idUsuario,
                    MiembroCartera.estado == "ACTIVO",
                ),
            )
            .join(Cartera, Cartera.idCartera == Transaccion.carteraId)
            .where(Transaccion.idTransaccion == id_transaccion)
        ).first()
    except SQLAlchemyError:
        return (
            None,
            None,
            (
                {
                    "ok": False,
                    "mensaje": "No se pudo validar la transacción.",
                },
                503,
            ),
        )

    if not fila:
        return (
            None,
            None,
            ({"ok": False, "mensaje": "Transacción no encontrada."}, 404),
        )

    transaccion, membresia, cartera = fila

    if transaccion.estado != "ACTIVO":
        return (
            None,
            None,
            ({"ok": False, "mensaje": "Transacción no encontrada."}, 404),
        )

    if cartera.estado != "ACTIVA":
        return (
            None,
            None,
            (
                {
                    "ok": False,
                    "mensaje": (
                        "No se pueden modificar movimientos en una cartera "
                        "inactiva o finalizada."
                    ),
                },
                409,
            ),
        )

    if membresia.rol != "ADMIN":
        return (
            None,
            None,
            (
                {
                    "ok": False,
                    "mensaje": (
                        "Solo el propietario o administrador puede editar "
                        "o eliminar transacciones."
                    ),
                },
                403,
            ),
        )

    return transaccion, cartera, None


def _validar_datos(datos, id_cartera, tipo_cartera):
    tipo = datos.get("tipo", "GASTO")
    if not isinstance(tipo, str):
        return None, ("El tipo es obligatorio.", 400)
    tipo = tipo.strip().upper()
    if tipo not in TIPOS:
        return None, ("El tipo debe ser INGRESO o GASTO.", 400)

    monto, error = _validar_monto(datos.get("monto"))
    if error:
        return None, (error, 400)

    fecha, error = _validar_fecha(datos.get("fecha"))
    if error:
        return None, (error, 400)

    descripcion = datos.get("descripcion")
    if descripcion is not None and not isinstance(descripcion, str):
        return None, ("La descripción debe ser texto.", 400)
    if isinstance(descripcion, str):
        descripcion = descripcion.strip() or None
    if descripcion and len(descripcion) > 500:
        return None, ("La descripción admite hasta 500 caracteres.", 400)

    metodo_pago = datos.get("metodoPago")
    if metodo_pago is not None and not isinstance(metodo_pago, str):
        return None, ("El método de pago no es válido.", 400)
    if isinstance(metodo_pago, str):
        metodo_pago = metodo_pago.strip().upper() or None
    if metodo_pago and metodo_pago not in METODOS_PAGO:
        return None, ("El método de pago no es válido.", 400)

    comprobante = datos.get("comprobanteUrl")
    if comprobante is not None and not isinstance(comprobante, str):
        return None, ("El comprobante debe ser una URL.", 400)
    if isinstance(comprobante, str):
        comprobante = comprobante.strip() or None
    if comprobante and len(comprobante) > 500:
        return None, ("El comprobante admite hasta 500 caracteres.", 400)

    try:
        categoria, error = _buscar_categoria(
            id_cartera,
            tipo_cartera,
            tipo,
            datos.get("categoriaId"),
        )
    except SQLAlchemyError:
        return None, ("No se pudo validar la categoría.", 503)
    if error:
        return None, (error, 400)

    return {
        "categoriaId": categoria.idCategoria,
        "tipo": tipo,
        "monto": monto,
        "descripcion": descripcion,
        "metodoPago": metodo_pago,
        "comprobanteUrl": comprobante,
        "estado": "ACTIVO",
        "fechaTransaccion": datetime.combine(fecha, time.min),
    }, None


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


def _serializar_listado(transaccion, autor, categoria):
    datos = _serializar(transaccion)
    datos["categoria"] = (
        {"idCategoria": categoria.idCategoria, "nombre": categoria.nombre}
        if categoria
        else None
    )
    datos["autor"] = {
        "idUsuario": autor.idUsuario,
        "nombre": f"{autor.nombreUsuario} {autor.apaterno or ''}".strip(),
    }
    return datos


def _entero_parametro(nombre, valor, minimo, maximo=None):
    try:
        numero = int(valor)
    except (TypeError, ValueError):
        return None, f"El parámetro {nombre} debe ser un número entero."
    if numero < minimo or (maximo is not None and numero > maximo):
        return None, f"El parámetro {nombre} está fuera de rango."
    return numero, None
