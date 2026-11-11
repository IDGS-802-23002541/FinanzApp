import csv
import io
from datetime import date, datetime, time, timedelta
from decimal import Decimal

from flask_jwt_extended import current_user
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import (
    Cartera,
    Categoria,
    MiembroCartera,
    Periodo,
    Transaccion,
    Usuario,
)
from app.utils.serializers import tipo_api, tipo_bd

TIPOS = {"HOGAR", "VIAJE", "EVENTO", "OTRO", "OTRA"}
# La baja de carteras es lógica: ARCHIVADA queda fuera de los reportes.
ESTADOS_REPORTABLES = ("ACTIVA", "FINALIZADA")
CANTIDAD_POR_DEFECTO = 5
CANTIDAD_MAXIMA = 50
FORMATOS_EXPORTACION = {"CSV"}

ENCABEZADOS_CSV = [
    "Fecha",
    "Cartera",
    "Tipo",
    "Categoría",
    "Monto",
    "Descripción",
    "Autor",
    "Método de pago",
]


def vista_previa(
    cartera_id=None,
    tipo=None,
    periodo_id=None,
    fecha_inicio=None,
    fecha_fin=None,
    cantidad=None,
):
    contexto, error = _contexto(
        cartera_id, tipo, periodo_id, fecha_inicio, fecha_fin, cantidad
    )
    if error:
        return error

    try:
        indicadores = _indicadores(contexto["filtros"])
        gastos_por_categoria = _gastos_por_categoria(
            contexto["filtros"], contexto["cantidad"]
        )
        serie_mensual = _serie_mensual(contexto["filtros"])
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo generar la vista previa del reporte.",
        }, 503

    hay_datos = indicadores["movimientos"] > 0
    return {
        "ok": True,
        "data": {
            "hayDatos": hay_datos,
            "filtros": {
                "carteraId": contexto["cartera_id"],
                "tipo": tipo_api(contexto["tipo"]) if contexto["tipo"] else None,
                "periodoId": contexto["periodo_id"],
                "fechaInicio": (
                    contexto["inicio"].isoformat() if contexto["inicio"] else None
                ),
                "fechaFin": (
                    contexto["fin"].isoformat() if contexto["fin"] else None
                ),
                "cantidad": contexto["cantidad"],
            },
            "carteras": _serializar_carteras(contexto["carteras"]),
            "indicadores": indicadores,
            "graficas": {
                "gastosPorCategoria": gastos_por_categoria,
                "ingresosVsEgresos": serie_mensual,
            },
        },
        "mensaje": (
            "Vista previa del reporte generada correctamente."
            if hay_datos
            else "Sin datos para los filtros seleccionados."
        ),
    }, 200


def exportar(
    formato=None,
    cartera_id=None,
    tipo=None,
    periodo_id=None,
    fecha_inicio=None,
    fecha_fin=None,
    cantidad=None,
):
    formato = (formato or "CSV").strip().upper()
    if formato not in FORMATOS_EXPORTACION:
        return {
            "ok": False,
            "mensaje": "El formato solicitado no está disponible.",
        }, 400

    contexto, error = _contexto(
        cartera_id, tipo, periodo_id, fecha_inicio, fecha_fin, cantidad
    )
    if error:
        return error

    try:
        filas = _filas(contexto["filtros"])
        indicadores = _indicadores(contexto["filtros"])
    except SQLAlchemyError:
        db.session.rollback()
        return {
            "ok": False,
            "mensaje": "No se pudo generar el reporte.",
        }, 503

    if not filas:
        return {
            "ok": False,
            "mensaje": "Sin datos para los filtros seleccionados.",
        }, 409

    contenido = _contenido_csv(contexto, indicadores, filas)
    return {
        "ok": True,
        "data": {
            "nombreArchivo": _nombre_archivo(contexto),
            "contenido": contenido,
        },
        "mensaje": "Reporte generado correctamente.",
    }, 200


def _contexto(cartera_id, tipo, periodo_id, fecha_inicio, fecha_fin, cantidad):
    cartera_id, error = _entero_opcional("carteraId", cartera_id)
    if error:
        return None, ({"ok": False, "mensaje": error}, 400)

    tipo, error = _tipo_opcional(tipo)
    if error:
        return None, ({"ok": False, "mensaje": error}, 400)

    periodo_id, error = _entero_opcional("periodoId", periodo_id)
    if error:
        return None, ({"ok": False, "mensaje": error}, 400)

    cantidad, error = _entero_opcional(
        "cantidad", cantidad, CANTIDAD_POR_DEFECTO, CANTIDAD_MAXIMA
    )
    if error:
        return None, ({"ok": False, "mensaje": error}, 400)

    inicio, fin, error = _rango_fechas(fecha_inicio, fecha_fin)
    if error:
        return None, ({"ok": False, "mensaje": error}, 400)

    if periodo_id is not None and cartera_id is None:
        return None, (
            {"ok": False, "mensaje": "El periodo requiere indicar la cartera."},
            400,
        )

    try:
        carteras = _carteras_del_propietario(cartera_id, tipo)
        if cartera_id is not None and not carteras:
            return None, ({"ok": False, "mensaje": "Cartera no encontrada."}, 404)

        if periodo_id is not None:
            periodo = db.session.get(Periodo, periodo_id)
            if periodo is None or periodo.carteraId != cartera_id:
                return None, (
                    {
                        "ok": False,
                        "mensaje": "El periodo no es válido para esta cartera.",
                    },
                    400,
                )
            inicio, fin = periodo.fechaInicio, periodo.fechaFin
    except SQLAlchemyError:
        db.session.rollback()
        return None, (
            {"ok": False, "mensaje": "No se pudo consultar el reporte."},
            503,
        )

    return {
        "carteras": carteras,
        "inicio": inicio,
        "fin": fin,
        "filtros": _filtros_transacciones(carteras, inicio, fin),
        "cartera_id": cartera_id,
        "tipo": tipo,
        "periodo_id": periodo_id,
        "cantidad": cantidad,
    }, None


def _serializar_carteras(carteras):
    return [
        {
            "id": cartera.idCartera,
            "nombre": cartera.nombre,
            "tipo": tipo_api(cartera.tipo),
        }
        for cartera in carteras
    ]


def _carteras_del_propietario(cartera_id, tipo):
    consulta = (
        db.select(Cartera)
        .join(MiembroCartera, MiembroCartera.carteraId == Cartera.idCartera)
        .where(
            MiembroCartera.usuarioId == current_user.idUsuario,
            MiembroCartera.rol == "ADMIN",
            MiembroCartera.estado == "ACTIVO",
            Cartera.estado.in_(ESTADOS_REPORTABLES),
        )
        .order_by(Cartera.nombre)
    )
    if cartera_id is not None:
        consulta = consulta.where(Cartera.idCartera == cartera_id)
    if tipo:
        consulta = consulta.where(Cartera.tipo == tipo_bd(tipo))

    return db.session.execute(consulta).scalars().all()


def _filtros_transacciones(carteras, inicio, fin):
    filtros = [
        Transaccion.carteraId.in_([cartera.idCartera for cartera in carteras]),
        Transaccion.estado == "ACTIVO",
    ]
    if inicio:
        filtros.append(
            Transaccion.fechaTransaccion >= datetime.combine(inicio, time.min)
        )
    if fin:
        filtros.append(
            Transaccion.fechaTransaccion
            < datetime.combine(fin + timedelta(days=1), time.min)
        )
    return filtros


def _indicadores(filtros):
    filas = db.session.execute(
        db.select(
            Transaccion.tipo,
            func.coalesce(func.sum(Transaccion.monto), 0),
            func.count(),
        )
        .where(*filtros)
        .group_by(Transaccion.tipo)
    ).all()

    total_ingresos = Decimal("0")
    total_gastos = Decimal("0")
    movimientos = 0
    for tipo, monto, total in filas:
        if tipo == "INGRESO":
            total_ingresos = Decimal(monto)
        else:
            total_gastos = Decimal(monto)
        movimientos += int(total)

    return {
        "totalIngresos": float(total_ingresos),
        "totalGastos": float(total_gastos),
        "ahorro": float(total_ingresos - total_gastos),
        # Las aportaciones son los ingresos registrados en la cartera.
        "totalAportes": float(total_ingresos),
        "movimientos": movimientos,
    }


def _gastos_por_categoria(filtros, cantidad):
    filas = db.session.execute(
        db.select(
            Categoria.nombre,
            func.coalesce(func.sum(Transaccion.monto), 0),
        )
        .select_from(Transaccion)
        .outerjoin(Categoria, Categoria.idCategoria == Transaccion.categoriaId)
        .where(*filtros, Transaccion.tipo == "GASTO")
        .group_by(Categoria.nombre)
        .order_by(func.coalesce(func.sum(Transaccion.monto), 0).desc())
        .limit(cantidad)
    ).all()

    total = sum((Decimal(monto) for _, monto in filas), Decimal("0"))
    return [
        {
            "categoria": nombre or "Sin categoría",
            "monto": float(monto),
            "porcentaje": (
                float(Decimal(monto) / total * 100) if total else 0.0
            ),
        }
        for nombre, monto in filas
    ]


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

    meses = {}
    for anio, mes, tipo, monto in filas:
        clave = f"{anio:04d}-{mes:02d}"
        registro = meses.setdefault(
            clave, {"periodo": clave, "ingresos": 0.0, "gastos": 0.0}
        )
        if tipo == "INGRESO":
            registro["ingresos"] = float(monto)
        else:
            registro["gastos"] = float(monto)

    return list(meses.values())


def _filas(filtros):
    return db.session.execute(
        db.select(Transaccion, Cartera, Categoria, Usuario)
        .join(Cartera, Cartera.idCartera == Transaccion.carteraId)
        .outerjoin(Categoria, Categoria.idCategoria == Transaccion.categoriaId)
        .join(Usuario, Usuario.idUsuario == Transaccion.usuarioId)
        .where(*filtros)
        .order_by(
            Transaccion.fechaTransaccion,
            Transaccion.idTransaccion,
        )
    ).all()


def _contenido_csv(contexto, indicadores, filas):
    salida = io.StringIO()
    escritor = csv.writer(salida, lineterminator="\r\n")

    escritor.writerow(["Reporte de FinanzApp"])
    escritor.writerow(["Cartera(s)", _nombres_carteras(contexto["carteras"])])
    escritor.writerow(["Periodo", _texto_periodo(contexto["inicio"], contexto["fin"])])
    escritor.writerow(["Generado el", datetime.now().strftime("%d/%m/%Y %H:%M")])
    escritor.writerow(
        [
            "Totales",
            f"Ingresos {indicadores['totalIngresos']:.2f}",
            f"Gastos {indicadores['totalGastos']:.2f}",
            f"Ahorro {indicadores['ahorro']:.2f}",
        ]
    )
    escritor.writerow([])
    escritor.writerow(ENCABEZADOS_CSV)

    for transaccion, cartera, categoria, autor in filas:
        escritor.writerow(
            [
                transaccion.fechaTransaccion.strftime("%d/%m/%Y"),
                cartera.nombre,
                "Ingreso" if transaccion.tipo == "INGRESO" else "Gasto",
                categoria.nombre if categoria else "Sin categoría",
                f"{Decimal(transaccion.monto):.2f}",
                transaccion.descripcion or "",
                f"{autor.nombreUsuario} {autor.apaterno or ''}".strip(),
                transaccion.metodoPago or "",
            ]
        )

    return salida.getvalue()


def _nombres_carteras(carteras):
    return ", ".join(cartera.nombre for cartera in carteras)


def _texto_periodo(inicio, fin):
    if not inicio and not fin:
        return "Todo el historial"
    desde = inicio.strftime("%d/%m/%Y") if inicio else "inicio"
    hasta = fin.strftime("%d/%m/%Y") if fin else "hoy"
    return f"{desde} a {hasta}"


def _nombre_archivo(contexto):
    hoy = date.today().strftime("%Y%m%d")
    if contexto["cartera_id"] is not None:
        return f"reporte_cartera_{contexto['cartera_id']}_{hoy}.csv"
    return f"reporte_{hoy}.csv"


def _entero_opcional(nombre, valor, por_defecto=None, maximo=None):
    if valor in (None, ""):
        return por_defecto, None
    try:
        numero = int(valor)
    except (TypeError, ValueError):
        return None, f"El parámetro {nombre} debe ser un número entero."
    if numero < 1 or (maximo is not None and numero > maximo):
        return None, f"El parámetro {nombre} está fuera de rango."
    return numero, None


def _tipo_opcional(valor):
    if valor in (None, ""):
        return None, None
    if not isinstance(valor, str):
        return None, "El filtro tipo no es válido."
    tipo = valor.strip().upper()
    if tipo not in TIPOS:
        return None, "El filtro tipo no es válido."
    return tipo, None


def _rango_fechas(fecha_inicio, fecha_fin):
    try:
        inicio = _fecha(fecha_inicio)
        fin = _fecha(fecha_fin)
    except ValueError:
        return None, None, "Las fechas deben tener formato YYYY-MM-DD."
    if inicio and fin and fin < inicio:
        return None, None, "La fecha fin no puede ser anterior a la fecha inicio."
    return inicio, fin, None


def _fecha(valor):
    if valor in (None, ""):
        return None
    if not isinstance(valor, str) or len(valor) != 10:
        raise ValueError
    return date.fromisoformat(valor)
