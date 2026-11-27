import calendar
import math
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal

from flask_jwt_extended import current_user
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import (
    MiembroCartera,
    PagoRecEjecucion,
    PagoRecurrente,
    Transaccion,
)
from app.services.transaccion_service import (
    entero_parametro,
    serializar_transaccion,
    validar_monto,
)
from app.utils import validacion

FRECUENCIAS = {"DIARIO", "SEMANAL", "QUINCENAL", "MENSUAL", "ANUAL"}
ESTADOS_PAGO = {"ACTIVO", "PAUSADO", "CANCELADO"}
# México centro usa UTC-6 todo el año desde 2022; evita depender de tzdata.
DESFASE_MEXICO = timedelta(hours=6)


def _hoy():
    """Fecha local de México para comparar vencimientos sin desfase UTC."""
    return (datetime.now(timezone.utc) - DESFASE_MEXICO).date()


def calcular_proxima_ejecucion(fecha_inicio, frecuencia):
    """Devuelve la fecha del siguiente periodo segun la frecuencia."""
    return _sumar_periodos(fecha_inicio, frecuencia, 1)


def _sumar_periodos(fecha, frecuencia, periodos):
    if frecuencia == "DIARIO":
        return fecha + timedelta(days=periodos)
    if frecuencia == "SEMANAL":
        return fecha + timedelta(days=7 * periodos)
    if frecuencia == "QUINCENAL":
        return fecha + timedelta(days=15 * periodos)
    if frecuencia == "MENSUAL":
        return _sumar_meses(fecha, periodos)
    if frecuencia == "ANUAL":
        return _sumar_meses(fecha, 12 * periodos)
    raise ValueError("La frecuencia no es valida.")


def _proxima_segun_ejecuciones(pago):
    """Primer periodo no pagado contando desde la fecha de inicio."""
    total = db.session.execute(
        db.select(func.count())
        .select_from(PagoRecEjecucion)
        .where(PagoRecEjecucion.pagoRecurrenteId == pago.idPagoRecurrente)
    ).scalar_one()
    return _sumar_periodos(pago.fechaInicio, pago.frecuencia, total)


def _sumar_meses(fecha, meses):
    total = fecha.month - 1 + meses
    anio = fecha.year + total // 12
    mes = total % 12 + 1
    # Si el dia no existe en el mes destino se usa el ultimo dia de ese mes.
    dia = min(fecha.day, calendar.monthrange(anio, mes)[1])
    return date(anio, mes, dia)


def crear(datos):
    cartera_id = datos.get("carteraId")
    if isinstance(cartera_id, bool) or not isinstance(cartera_id, int):
        return {"ok": False, "mensaje": "La cartera es obligatoria."}, 400

    try:
        membresia = _membresia(cartera_id)
    except SQLAlchemyError:
        db.session.rollback()
        return {"ok": False, "mensaje": "No se pudo validar la cartera."}, 503

    if membresia is None:
        return {"ok": False, "mensaje": "Cartera no encontrada."}, 404

    cambios, error = _validar(datos)
    if error:
        return {"ok": False, "mensaje": error}, 400

    pago = PagoRecurrente(
        carteraId=cartera_id,
        usuarioId=current_user.idUsuario,
        estado="ACTIVO",
        # El primer vencimiento es la fecha de inicio, no el siguiente periodo.
        proximaEjecucion=cambios["fechaInicio"],
        **cambios,
    )
    db.session.add(pago)

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo crear el pago recurrente.",
        }, 503

    return {
        "ok": True,
        "data": {"pago": _serializar(pago)},
        "mensaje": "Pago recurrente creado correctamente.",
    }, 201


def listar(cartera_id=None, estado=None, pagina="1", por_pagina="20"):
    pagina, error = entero_parametro("pagina", pagina, 1)
    if error:
        return {"ok": False, "mensaje": error}, 400
    por_pagina, error = entero_parametro("porPagina", por_pagina, 1, 100)
    if error:
        return {"ok": False, "mensaje": error}, 400

    estado = (estado or "").strip().upper()
    if estado and estado not in ESTADOS_PAGO:
        return {"ok": False, "mensaje": "El filtro estado no es valido."}, 400

    filtros = [
        MiembroCartera.usuarioId == current_user.idUsuario,
        MiembroCartera.estado == "ACTIVO",
    ]

    if cartera_id:
        cartera_id, error = entero_parametro("carteraId", cartera_id, 1)
        if error:
            return {"ok": False, "mensaje": error}, 400
        try:
            membresia = _membresia(cartera_id)
        except SQLAlchemyError:
            db.session.rollback()
            return {"ok": False, "mensaje": "No se pudo validar la cartera."}, 503
        if membresia is None:
            return {"ok": False, "mensaje": "Cartera no encontrada."}, 404
        filtros.append(PagoRecurrente.carteraId == cartera_id)

    if estado:
        filtros.append(PagoRecurrente.estado == estado)
    else:
        # Por defecto no se muestran los pagos dados de baja.
        filtros.append(PagoRecurrente.estado != "CANCELADO")

    try:
        total = db.session.execute(
            db.select(func.count())
            .select_from(PagoRecurrente)
            .join(
                MiembroCartera,
                MiembroCartera.carteraId == PagoRecurrente.carteraId,
            )
            .where(*filtros)
        ).scalar_one()
        filas = (
            db.session.execute(
                db.select(PagoRecurrente)
                .join(
                    MiembroCartera,
                    MiembroCartera.carteraId == PagoRecurrente.carteraId,
                )
                .where(*filtros)
                .order_by(
                    PagoRecurrente.proximaEjecucion.asc(),
                    PagoRecurrente.idPagoRecurrente.asc(),
                )
                .offset((pagina - 1) * por_pagina)
                .limit(por_pagina)
            )
            .scalars()
            .all()
        )
        ultimas = _ultimas_ejecuciones(
            [pago.idPagoRecurrente for pago in filas]
        )
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudieron obtener los pagos recurrentes.",
        }, 503

    total_paginas = math.ceil(total / por_pagina) if total else 0
    return {
        "ok": True,
        "data": {
            "pagos": [
                _serializar(pago, ultimas.get(pago.idPagoRecurrente))
                for pago in filas
            ],
            "paginacion": {
                "pagina": pagina,
                "porPagina": por_pagina,
                "total": total,
                "totalPaginas": total_paginas,
            },
        },
        "mensaje": "Pagos recurrentes obtenidos correctamente.",
    }, 200


def editar(id_pago, datos):
    pago, _, error = _pago_y_membresia(id_pago)
    if error:
        return error

    cambios, error = _validar(datos, pago)
    if error:
        return {"ok": False, "mensaje": error}, 400
    if not cambios:
        return {
            "ok": False,
            "mensaje": "No se enviaron campos para actualizar.",
        }, 400

    try:
        for campo, valor in cambios.items():
            setattr(pago, campo, valor)

        if "frecuencia" in cambios or "fechaInicio" in cambios:
            pago.proximaEjecucion = _proxima_segun_ejecuciones(pago)

        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo actualizar el pago recurrente.",
        }, 503

    return {
        "ok": True,
        "data": {"pago": _serializar(pago)},
        "mensaje": "Pago recurrente actualizado correctamente.",
    }, 200


def eliminar(id_pago):
    pago, _, error = _pago_y_membresia(id_pago)
    if error:
        return error

    pago.estado = "CANCELADO"

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo cancelar el pago recurrente.",
        }, 503

    return {
        "ok": True,
        "data": {"pago": _serializar(pago)},
        "mensaje": "Pago recurrente cancelado correctamente.",
    }, 200


def marcar_hecho(id_pago, datos):
    pago, _, error = _pago_y_membresia(id_pago)
    if error:
        return error

    fecha_programada = pago.proximaEjecucion
    if datos.get("fechaProgramada") is not None:
        try:
            fecha_programada = validacion.fecha_iso(datos["fechaProgramada"])
        except ValueError:
            return {
                "ok": False,
                "mensaje": "Las fechas deben tener formato YYYY-MM-DD.",
            }, 400

    if pago.estado == "CANCELADO":
        return {
            "ok": False,
            "mensaje": "Este pago recurrente está cancelado.",
        }, 409

    if fecha_programada is None:
        return {
            "ok": False,
            "mensaje": "El pago no tiene una fecha de vencimiento.",
        }, 409

    # Solo se puede marcar cuando vence hoy o ya venció.
    hoy = _hoy()
    if fecha_programada > hoy:
        return {
            "ok": False,
            "mensaje": (
                "Este pago aún no vence. Podrás marcarlo como hecho "
                f"a partir del {fecha_programada.isoformat()}."
            ),
        }, 409

    try:
        existe = db.session.execute(
            db.select(PagoRecEjecucion.idEjecucion).where(
                PagoRecEjecucion.pagoRecurrenteId == id_pago,
                PagoRecEjecucion.fechaProgramada == fecha_programada,
            )
        ).first()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo validar la ejecucion del pago.",
        }, 503

    if existe:
        return {
            "ok": False,
            "mensaje": "Ese pago ya fue marcado como realizado.",
        }, 409

    transaccion = Transaccion(
        carteraId=pago.carteraId,
        usuarioId=current_user.idUsuario,
        categoriaId=pago.categoriaId,
        tipo="GASTO",
        monto=pago.monto,
        descripcion=pago.nombre,
        estado="ACTIVO",
        fechaTransaccion=datetime.combine(fecha_programada, time.min),
    )
    db.session.add(transaccion)

    try:
        db.session.flush()
        ejecucion = PagoRecEjecucion(
            pagoRecurrenteId=pago.idPagoRecurrente,
            transaccionId=transaccion.idTransaccion,
            fechaProgramada=fecha_programada,
            fechaEjecucion=datetime.now(timezone.utc).replace(tzinfo=None),
            monto=pago.monto,
            estado="EJECUTADO",
        )
        db.session.add(ejecucion)
        if fecha_programada >= pago.proximaEjecucion:
            pago.proximaEjecucion = calcular_proxima_ejecucion(
                fecha_programada, pago.frecuencia
            )
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo registrar el pago como realizado.",
        }, 503

    return {
        "ok": True,
        "data": {
            "ejecucion": _serializar_ejecucion(ejecucion),
            "transaccion": serializar_transaccion(transaccion),
        },
        "mensaje": "Pago marcado como realizado correctamente.",
    }, 201


def _validar(datos, pago=None):
    """Valida los campos recibidos y devuelve los cambios a aplicar."""
    cambios = {}

    if "nombre" in datos or pago is None:
        nombre = datos.get("nombre")
        if not isinstance(nombre, str):
            return None, "El nombre es obligatorio."
        nombre = nombre.strip()
        if not nombre:
            return None, "El nombre no puede estar vacio."
        if len(nombre) > 120:
            return None, "El nombre admite hasta 120 caracteres."
        cambios["nombre"] = nombre

    if "descripcion" in datos:
        descripcion = datos.get("descripcion")
        if descripcion is not None and not isinstance(descripcion, str):
            return None, "La descripcion debe ser texto."
        if isinstance(descripcion, str):
            descripcion = descripcion.strip() or None
        if descripcion and len(descripcion) > 500:
            return None, "La descripcion admite hasta 500 caracteres."
        cambios["descripcion"] = descripcion

    if "monto" in datos or pago is None:
        monto, error = validar_monto(datos.get("monto"))
        if error:
            return None, error
        cambios["monto"] = monto

    if "frecuencia" in datos or pago is None:
        frecuencia = datos.get("frecuencia")
        if not isinstance(frecuencia, str):
            return None, "La frecuencia es obligatoria."
        frecuencia = frecuencia.strip().upper()
        if frecuencia not in FRECUENCIAS:
            return None, (
            "La frecuencia debe ser DIARIO, SEMANAL, QUINCENAL, MENSUAL o ANUAL."
        )
        cambios["frecuencia"] = frecuencia

    if "fechaInicio" in datos or pago is None:
        try:
            inicio = validacion.fecha_iso(datos.get("fechaInicio"))
        except ValueError:
            return None, "Las fechas deben tener formato YYYY-MM-DD."
        if inicio is None:
            return None, "La fecha de inicio es obligatoria."
        cambios["fechaInicio"] = inicio

    if "fechaFin" in datos:
        try:
            fin = validacion.fecha_iso(datos.get("fechaFin"))
        except ValueError:
            return None, "Las fechas deben tener formato YYYY-MM-DD."
        cambios["fechaFin"] = fin

    if "categoriaId" in datos:
        categoria_id = datos.get("categoriaId")
        if categoria_id is not None and (
            isinstance(categoria_id, bool) or not isinstance(categoria_id, int)
        ):
            return None, "La categoria no es valida."
        cambios["categoriaId"] = categoria_id

    if "estado" in datos and pago is not None:
        estado = datos.get("estado")
        if not isinstance(estado, str):
            return None, "El estado debe ser ACTIVO, PAUSADO o CANCELADO."
        estado = estado.strip().upper()
        if estado not in ESTADOS_PAGO:
            return None, "El estado debe ser ACTIVO, PAUSADO o CANCELADO."
        cambios["estado"] = estado

    inicio = cambios.get("fechaInicio", getattr(pago, "fechaInicio", None))
    fin = cambios.get("fechaFin", getattr(pago, "fechaFin", None))
    if inicio and fin and fin < inicio:
        return None, "La fecha fin no puede ser anterior a la fecha inicio."

    return cambios, None


def _membresia(cartera_id):
    return db.session.execute(
        db.select(MiembroCartera).where(
            MiembroCartera.carteraId == cartera_id,
            MiembroCartera.usuarioId == current_user.idUsuario,
            MiembroCartera.estado == "ACTIVO",
        )
    ).scalar_one_or_none()


def _pago_y_membresia(id_pago):
    try:
        fila = db.session.execute(
            db.select(PagoRecurrente, MiembroCartera)
            .join(
                MiembroCartera,
                MiembroCartera.carteraId == PagoRecurrente.carteraId,
            )
            .where(
                PagoRecurrente.idPagoRecurrente == id_pago,
                MiembroCartera.usuarioId == current_user.idUsuario,
                MiembroCartera.estado == "ACTIVO",
            )
        ).first()
    except SQLAlchemyError:
        db.session.rollback()
        return (
            None,
            None,
            (
                {"ok": False, "mensaje": "No se pudo validar el pago recurrente."},
                503,
            ),
        )

    if not fila:
        return (
            None,
            None,
            (
                {"ok": False, "mensaje": "Pago recurrente no encontrado."},
                404,
            ),
        )

    pago, membresia = fila
    return pago, membresia, None


def _ultimas_ejecuciones(ids):
    if not ids:
        return {}

    filas = (
        db.session.execute(
            db.select(PagoRecEjecucion)
            .where(PagoRecEjecucion.pagoRecurrenteId.in_(ids))
            .order_by(
                PagoRecEjecucion.fechaEjecucion.desc(),
                PagoRecEjecucion.idEjecucion.desc(),
            )
        )
        .scalars()
        .all()
    )

    ultimas = {}
    for fila in filas:
        ultimas.setdefault(fila.pagoRecurrenteId, fila)
    return ultimas


def _serializar(pago, ultima_ejecucion=None):
    return {
        "idPagoRecurrente": pago.idPagoRecurrente,
        "carteraId": pago.carteraId,
        "categoriaId": pago.categoriaId,
        "nombre": pago.nombre,
        "descripcion": pago.descripcion,
        "monto": float(pago.monto),
        "frecuencia": pago.frecuencia,
        "fechaInicio": (pago.fechaInicio.isoformat() if pago.fechaInicio else None),
        "fechaFin": pago.fechaFin.isoformat() if pago.fechaFin else None,
        "proximaEjecucion": (
            pago.proximaEjecucion.isoformat() if pago.proximaEjecucion else None
        ),
        "ultimaEjecucion": (
            _serializar_ejecucion(ultima_ejecucion)
            if ultima_ejecucion is not None
            else None
        ),
        "estado": pago.estado,
    }


def _serializar_ejecucion(ejecucion):
    return {
        "idEjecucion": ejecucion.idEjecucion,
        "pagoRecurrenteId": ejecucion.pagoRecurrenteId,
        "transaccionId": ejecucion.transaccionId,
        "fechaProgramada": ejecucion.fechaProgramada.isoformat(),
        "monto": float(ejecucion.monto),
        "estado": ejecucion.estado,
    }
