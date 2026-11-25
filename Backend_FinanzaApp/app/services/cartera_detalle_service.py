from datetime import date, datetime, time, timedelta
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
            "nombre": (
                f"{usuario.nombreUsuario} {usuario.apaterno or ''}".strip()
            ),
            "iniciales": _iniciales(usuario),
            "rol": (
                "PROPIETARIO"
                if membresia.rol == "ADMIN"
                else "COLABORADOR"
            ),
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


def balance(id_cartera):
    filtros = [
        Transaccion.carteraId == id_cartera,
        Transaccion.estado == "ACTIVO",
    ]
    ingresos, gastos = _sumas(filtros)
    return {
        "totalIngresos": float(ingresos),
        "totalGastos": float(gastos),
        "balance": float(ingresos - gastos),
        "porCategoria": _gastos_por_categoria(filtros),
        "porParticipante": _balance_por_participante(filtros),
    }


def _balance_por_participante(filtros):
    filas = db.session.execute(
        db.select(
            Transaccion.usuarioId,
            Usuario.nombreUsuario,
            Usuario.apaterno,
            Transaccion.tipo,
            func.coalesce(func.sum(Transaccion.monto), 0),
        )
        .join(Usuario, Usuario.idUsuario == Transaccion.usuarioId)
        .where(*filtros)
        .group_by(
            Transaccion.usuarioId,
            Usuario.nombreUsuario,
            Usuario.apaterno,
            Transaccion.tipo,
        )
    ).all()

    participantes = {}
    for usuario_id, nombre, apaterno, tipo, total in filas:
        datos = participantes.setdefault(
            usuario_id,
            {
                "usuarioId": usuario_id,
                "nombre": f"{nombre} {apaterno or ''}".strip(),
                "totalIngresos": 0.0,
                "totalGastos": 0.0,
            },
        )
        if tipo == "INGRESO":
            datos["totalIngresos"] = float(total)
        else:
            datos["totalGastos"] = float(total)

    resultado = []
    for datos in participantes.values():
        datos["balance"] = datos["totalIngresos"] - datos["totalGastos"]
        resultado.append(datos)
    return sorted(resultado, key=lambda item: item["nombre"])


def resumen_y_series(cartera, periodo_id=None, desde=None, hasta=None):
    periodo = _validar_periodo(cartera, periodo_id)
    rango = None if periodo else _validar_rango(desde, hasta)

    filtros = [
        Transaccion.carteraId == cartera.idCartera,
        Transaccion.estado == "ACTIVO",
    ]
    if rango:
        filtros = filtros + _filtros_rango(rango)

    ingresos, gastos = _sumas(filtros)
    resumen = {
        "presupuestoInicial": float(cartera.presupuestoInicial or 0),
        "totalIngresos": float(ingresos),
        "totalGastos": float(gastos),
        "saldo": float(
            Decimal(cartera.presupuestoInicial or 0) + ingresos - gastos
        ),
    }

    resumen_periodo = None
    filtros_categoria = filtros
    if periodo:
        filtros_periodo = [
            Transaccion.carteraId == cartera.idCartera,
            Transaccion.estado == "ACTIVO",
            *_filtros_fechas(periodo),
        ]
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
            "ingresosVsEgresos": _serie_ingresos_egresos(
                cartera, periodo, rango
            ),
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


def _validar_rango(desde, hasta):
    inicio = _fecha(desde) if desde not in (None, "") else None
    fin = _fecha(hasta) if hasta not in (None, "") else None
    if inicio and fin and fin < inicio:
        raise ValueError(
            "La fecha desde no puede ser posterior a la fecha hasta."
        )
    if inicio is None and fin is None:
        return None
    return (inicio, fin)


def _fecha(valor):
    if not isinstance(valor, str) or len(valor) != 10:
        raise ValueError("Las fechas deben tener formato YYYY-MM-DD.")
    try:
        return date.fromisoformat(valor)
    except ValueError:
        raise ValueError("Las fechas deben tener formato YYYY-MM-DD.")


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


def _filtros_rango(rango):
    inicio, fin = rango
    filtros = []
    if inicio:
        filtros.append(
            Transaccion.fechaTransaccion
            >= datetime.combine(inicio, time.min)
        )
    if fin:
        filtros.append(
            Transaccion.fechaTransaccion
            < datetime.combine(fin + timedelta(days=1), time.min)
        )
    return filtros


def _serie_ingresos_egresos(cartera, periodo=None, rango=None):
    # Con periodoId se conserva el agrupado por los periodos de la cartera.
    if periodo is not None:
        return _serie_por_periodos(cartera)

    # Sin rango se mantiene el comportamiento histórico: periodos si existen.
    if rango is None and _periodos(cartera):
        return _serie_por_periodos(cartera)

    filtros = [
        Transaccion.carteraId == cartera.idCartera,
        Transaccion.estado == "ACTIVO",
    ]
    if rango:
        filtros = filtros + _filtros_rango(rango)
    return _serie_mensual(filtros)


def _periodos(cartera):
    return db.session.execute(
        db.select(Periodo)
        .where(Periodo.carteraId == cartera.idCartera)
        .order_by(Periodo.fechaInicio)
    ).scalars().all()


def _serie_por_periodos(cartera):
    serie = []
    for periodo in _periodos(cartera):
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


def _serie_mensual(filtros):
    filas = db.session.execute(
        db.select(
            func.year(Transaccion.fechaTransaccion),
            func.month(Transaccion.fechaTransaccion),
            Transaccion.tipo,
            func.coalesce(func.sum(Transaccion.monto), 0),
        )
        .where(*filtros)
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
        agrupado.setdefault(
            clave, {"INGRESO": Decimal("0"), "GASTO": Decimal("0")}
        )
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
    return (
        f"{(usuario.nombreUsuario or ' ')[0]}"
        f"{(usuario.apaterno or ' ')[0]}"
    ).upper()
