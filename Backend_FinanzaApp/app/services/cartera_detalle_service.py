from datetime import datetime, time, timedelta
from decimal import Decimal

from sqlalchemy import func

from app.extensions import db
from app.models import Categoria, MiembroCartera, Periodo, Transaccion, Usuario


def colaboradores(id_cartera):
    filas = db.session.execute(
        db.select(MiembroCartera, Usuario)
        .join(Usuario, Usuario.idUsuario == MiembroCartera.usuarioId)
        .where(
            MiembroCartera.carteraId == id_cartera,
            MiembroCartera.estado == "ACTIVO",
        )
        .order_by(MiembroCartera.fechaUnion, MiembroCartera.usuarioId)
    ).all()

    return [
        {
            "idUsuario": usuario.idUsuario,
            "nombre": f"{usuario.nombreUsuario} {usuario.apaterno or ''}".strip(),
            "iniciales": _iniciales(usuario),
            "rol": "PROPIETARIO" if membresia.rol == "ADMIN" else "COLABORADOR",
        }
        for membresia, usuario in filas
    ]


def listar_periodos(id_cartera):
    periodos = db.session.execute(
        db.select(Periodo)
        .where(Periodo.carteraId == id_cartera)
        .order_by(Periodo.fechaInicio, Periodo.idPeriodo)
    ).scalars().all()

    return [
        {
            "idPeriodo": periodo.idPeriodo,
            "nombre": periodo.nombre,
            "fechaInicio": periodo.fechaInicio.isoformat(),
            "fechaFin": periodo.fechaFin.isoformat(),
            "estado": periodo.estado,
        }
        for periodo in periodos
    ]


def resumen_y_series(cartera, periodo_id=None):
    periodo = _validar_periodo(cartera, periodo_id)
    filtros = [
        Transaccion.carteraId == cartera.idCartera,
        Transaccion.estado == "ACTIVO",
    ]

    ingresos, gastos = _sumas(filtros)
    resumen = {
        "presupuestoInicial": float(cartera.presupuestoInicial or 0),
        "totalIngresos": float(ingresos),
        "totalGastos": float(gastos),
        "saldo": float(Decimal(cartera.presupuestoInicial or 0) + ingresos - gastos),
    }

    resumen_periodo = None
    filtros_categoria = filtros
    if periodo:
        filtros_periodo = filtros + _filtros_fechas(periodo)
        ingresos_periodo, gastos_periodo = _sumas(filtros_periodo)
        resumen_periodo = {
            "periodoId": periodo.idPeriodo,
            "nombre": periodo.nombre,
            "fechaInicio": periodo.fechaInicio.isoformat(),
            "fechaFin": periodo.fechaFin.isoformat(),
            "totalIngresos": float(ingresos_periodo),
            "totalGastos": float(gastos_periodo),
            "balance": float(ingresos_periodo - gastos_periodo),
        }
        filtros_categoria = filtros_periodo

    return {
        "resumen": resumen,
        "resumenPeriodo": resumen_periodo,
        "series": {
            "ingresosVsEgresos": _serie_ingresos_egresos(cartera),
            "gastosPorCategoria": _gastos_por_categoria(filtros_categoria),
        },
    }


def _validar_periodo(cartera, periodo_id):
    if periodo_id in (None, ""):
        return None
    try:
        periodo_id = int(periodo_id)
    except (TypeError, ValueError):
        raise ValueError("El periodoId debe ser un número entero.")
    periodo = db.session.get(Periodo, periodo_id)
    if periodo is None or periodo.carteraId != cartera.idCartera:
        raise ValueError("El periodo no es válido para esta cartera.")
    return periodo


def _sumas(filtros):
    filas = db.session.execute(
        db.select(
            Transaccion.tipo,
            func.coalesce(func.sum(Transaccion.monto), 0),
        )
        .where(*filtros)
        .group_by(Transaccion.tipo)
    ).all()
    por_tipo = {tipo: Decimal(total) for tipo, total in filas}
    return (
        por_tipo.get("INGRESO", Decimal("0")),
        por_tipo.get("GASTO", Decimal("0")),
    )


def _filtros_fechas(periodo):
    return [
        Transaccion.fechaTransaccion
        >= datetime.combine(periodo.fechaInicio, time.min),
        Transaccion.fechaTransaccion
        < datetime.combine(periodo.fechaFin + timedelta(days=1), time.min),
    ]


def _serie_ingresos_egresos(cartera):
    periodos = db.session.execute(
        db.select(Periodo)
        .where(Periodo.carteraId == cartera.idCartera)
        .order_by(Periodo.fechaInicio)
    ).scalars().all()

    if periodos:
        serie = []
        for periodo in periodos:
            filtros = [
                Transaccion.carteraId == cartera.idCartera,
                Transaccion.estado == "ACTIVO",
                *_filtros_fechas(periodo),
            ]
            ingresos, gastos = _sumas(filtros)
            serie.append(
                {
                    "periodoId": periodo.idPeriodo,
                    "nombre": periodo.nombre,
                    "fechaInicio": periodo.fechaInicio.isoformat(),
                    "fechaFin": periodo.fechaFin.isoformat(),
                    "ingresos": float(ingresos),
                    "gastos": float(gastos),
                }
            )
        return serie

    filas = db.session.execute(
        db.select(
            func.year(Transaccion.fechaTransaccion),
            func.month(Transaccion.fechaTransaccion),
            Transaccion.tipo,
            func.coalesce(func.sum(Transaccion.monto), 0),
        )
        .where(
            Transaccion.carteraId == cartera.idCartera,
            Transaccion.estado == "ACTIVO",
        )
        .group_by(
            func.year(Transaccion.fechaTransaccion),
            func.month(Transaccion.fechaTransaccion),
            Transaccion.tipo,
        )
        .order_by(
            func.year(Transaccion.fechaTransaccion),
            func.month(Transaccion.fechaTransaccion),
        )
    ).all()

    agrupado = {}
    for anio, mes, tipo, total in filas:
        clave = (anio, mes)
        agrupado.setdefault(clave, {"INGRESO": Decimal("0"), "GASTO": Decimal("0")})
        agrupado[clave][tipo] = Decimal(total)

    return [
        {
            "periodoId": None,
            "nombre": f"{anio}-{mes:02d}",
            "fechaInicio": None,
            "fechaFin": None,
            "ingresos": float(valores["INGRESO"]),
            "gastos": float(valores["GASTO"]),
        }
        for (anio, mes), valores in sorted(agrupado.items())
    ]


def _gastos_por_categoria(filtros):
    filas = db.session.execute(
        db.select(
            Categoria.idCategoria,
            func.coalesce(Categoria.nombre, "Sin categoría"),
            func.coalesce(func.sum(Transaccion.monto), 0),
        )
        .outerjoin(
            Categoria,
            Categoria.idCategoria == Transaccion.categoriaId,
        )
        .where(*filtros, Transaccion.tipo == "GASTO")
        .group_by(Categoria.idCategoria, Categoria.nombre)
        .order_by(func.coalesce(func.sum(Transaccion.monto), 0).desc())
    ).all()

    return [
        {
            "categoriaId": categoria_id,
            "nombre": nombre,
            "total": float(total),
        }
        for categoria_id, nombre, total in filas
    ]


def _iniciales(usuario):
    return f"{(usuario.nombreUsuario or ' ')[0]}{(usuario.apaterno or ' ')[0]}".upper()
