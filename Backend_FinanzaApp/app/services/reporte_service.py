import csv
import io
import unicodedata
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
FORMATOS_EXPORTACION = {"CSV", "PDF"}

ENCABEZADOS_CSV = [
    "Fecha",
    "Cartera",
    "Tipo",
    "Categoría",
    "Monto (MXN)",
    "Descripción",
    "Autor",
    "Método de pago",
]

# --- Maquetación del PDF --------------------------------------------------
# Medidas de una hoja carta en puntos (1 pt = 1/72 pulgada).
MARGEN = 40
ANCHO_PAGINA = 612
ALTO_PAGINA = 792
ANCHO_CONTENIDO = ANCHO_PAGINA - 2 * MARGEN
LIMITE_INFERIOR = 740
FILA_DETALLE = 15

# Colores de marca (los mismos del logo en web_FinanzaApp/public/marca).
PETROLEO = (0.090, 0.231, 0.271)  # #173B45
TERRACOTA = (0.776, 0.365, 0.271)  # #C65D45
CREMA = (0.973, 0.953, 0.937)  # #F8F3EF
GRIS_TEXTO = (0.365, 0.443, 0.463)  # #5D7176
GRIS_BORDE = (0.890, 0.847, 0.820)  # #E3D8D1
BARRA_FONDO = (0.941, 0.918, 0.898)  # #F0EAE5
BLANCO = (1.0, 1.0, 1.0)

# Columnas de la tabla de detalle: (título, x, ancho, alineación).
COLUMNAS_DETALLE = [
    ("Fecha", 0, 52, "izq"),
    ("Tipo", 56, 46, "izq"),
    ("Categoría", 106, 80, "izq"),
    ("Descripción", 190, 132, "izq"),
    ("Autor", 326, 68, "izq"),
    ("Método", 398, 80, "izq"),
    ("Monto", 478, 54, "der"),
]

# Anchos estándar de Helvetica en milésimas para estimar el ancho del texto.
_ANCHOS_TEXTO = {
    " ": 278, "!": 278, '"': 355, "#": 556, "$": 556, "%": 889,
    "&": 667, "'": 191, "(": 333, ")": 333, "*": 389, "+": 584,
    ",": 278, "-": 333, ".": 278, "/": 278, "0": 556, "1": 556,
    "2": 556, "3": 556, "4": 556, "5": 556, "6": 556, "7": 556,
    "8": 556, "9": 556, ":": 278, ";": 278, "<": 584, "=": 584,
    ">": 584, "?": 556, "@": 1015, "[": 278, "\\": 278, "]": 278,
    "^": 469, "_": 556, "`": 333, "{": 334, "|": 260, "}": 334,
    "~": 584, "·": 278, "¿": 611, "¡": 333, "°": 400, "º": 365,
    "A": 667, "B": 667, "C": 722, "D": 722, "E": 667, "F": 611,
    "G": 778, "H": 722, "I": 278, "J": 500, "K": 667, "L": 556,
    "M": 833, "N": 722, "O": 778, "P": 667, "Q": 778, "R": 722,
    "S": 667, "T": 611, "U": 722, "V": 667, "W": 944, "X": 667,
    "Y": 667, "Z": 611,
    "a": 556, "b": 556, "c": 500, "d": 556, "e": 556, "f": 278,
    "g": 556, "h": 556, "i": 222, "j": 222, "k": 500, "l": 222,
    "m": 833, "n": 556, "o": 556, "p": 556, "q": 556, "r": 333,
    "s": 500, "t": 278, "u": 556, "v": 500, "w": 722, "x": 500,
    "y": 500, "z": 500,
    "á": 556, "é": 556, "í": 278, "ó": 556, "ú": 556, "ñ": 556,
    "ü": 556, "Á": 667, "É": 667, "Í": 278, "Ó": 778, "Ú": 722,
    "Ñ": 722, "Ü": 722,
}


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

    if formato == "PDF":
        contenido = _contenido_pdf(contexto, indicadores, filas)
        mimetype = "application/pdf"
    else:
        contenido = _contenido_csv(contexto, indicadores, filas)
        mimetype = "text/csv"

    return {
        "ok": True,
        "data": {
            "nombreArchivo": _nombre_archivo(contexto, formato),
            "contenido": contenido,
            "mimetype": mimetype,
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

    if cartera_id is None:
        return None, (
            {
                "ok": False,
                "mensaje": "Selecciona una cartera para generar el reporte.",
            },
            400,
        )

    try:
        carteras = _carteras_del_propietario(cartera_id)
        if not carteras:
            return None, ({"ok": False, "mensaje": "Cartera no encontrada."}, 404)

        # El tipo es un filtro de apoyo: debe coincidir con la cartera elegida.
        if tipo and carteras[0].tipo != tipo_bd(tipo):
            return None, (
                {
                    "ok": False,
                    "mensaje": "La cartera no corresponde al tipo seleccionado.",
                },
                400,
            )

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


def _carteras_del_propietario(cartera_id):
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

    escritor.writerow(["Reporte financiero · FinanzApp"])
    escritor.writerow(["Cartera(s)", _nombres_carteras(contexto["carteras"])])
    escritor.writerow(["Tipo", _etiqueta_tipo(contexto)])
    escritor.writerow(
        ["Periodo", _texto_periodo(contexto["inicio"], contexto["fin"])]
    )
    escritor.writerow(["Generado el", datetime.now().strftime("%d/%m/%Y %H:%M")])
    escritor.writerow(["Moneda", "MXN"])
    escritor.writerow([])

    escritor.writerow(["Resumen"])
    escritor.writerow(["Ingresos", _monto_csv(indicadores["totalIngresos"])])
    escritor.writerow(["Gastos", _monto_csv(indicadores["totalGastos"])])
    escritor.writerow(["Ahorro", _monto_csv(indicadores["ahorro"])])
    escritor.writerow(["Movimientos", indicadores["movimientos"]])
    escritor.writerow([])

    gastos = _gastos_de_filas(filas)
    if gastos:
        total_gastos = sum(gastos.values(), Decimal("0"))
        escritor.writerow(["Gastos por categoría"])
        escritor.writerow(["Categoría", "Monto (MXN)", "Porcentaje"])
        for nombre, monto in sorted(
            gastos.items(), key=lambda item: item[1], reverse=True
        ):
            porcentaje = (
                float(monto / total_gastos * 100) if total_gastos else 0.0
            )
            escritor.writerow(
                [nombre, _monto_csv(monto), f"{porcentaje:.1f}%"]
            )
        escritor.writerow(["Total de gastos", _monto_csv(total_gastos), "100.0%"])
        escritor.writerow([])

    escritor.writerow(["Detalle de movimientos"])
    escritor.writerow(ENCABEZADOS_CSV)

    for transaccion, cartera, categoria, autor in filas:
        escritor.writerow(
            [
                transaccion.fechaTransaccion.strftime("%d/%m/%Y"),
                cartera.nombre,
                "Ingreso" if transaccion.tipo == "INGRESO" else "Gasto",
                categoria.nombre if categoria else "Sin categoría",
                _monto_csv(transaccion.monto),
                transaccion.descripcion or "",
                f"{autor.nombreUsuario} {autor.apaterno or ''}".strip(),
                transaccion.metodoPago or "",
            ]
        )

    return salida.getvalue()


def _contenido_pdf(contexto, indicadores, filas):
    lienzo = _LienzoPdf()
    alto = _cabecera_reporte(lienzo)
    alto = _bloque_info(lienzo, contexto, indicadores, alto)
    alto = _bloque_resumen(lienzo, indicadores, alto)
    alto = _bloque_gastos(lienzo, filas, alto)
    _bloque_detalle(lienzo, filas, alto)
    lienzo.sello_pies("Reporte generado automáticamente por FinanzApp")
    return lienzo.a_bytes()


def _gastos_de_filas(filas):
    gastos = {}
    for transaccion, _cartera, categoria, _autor in filas:
        if transaccion.tipo != "GASTO":
            continue
        nombre = categoria.nombre if categoria else "Sin categoría"
        gastos[nombre] = gastos.get(nombre, Decimal("0")) + Decimal(
            transaccion.monto
        )
    return gastos


def _etiqueta_tipo(contexto):
    tipo = contexto["tipo"]
    if not tipo and contexto["carteras"]:
        tipo = contexto["carteras"][0].tipo
    etiquetas = {
        "HOGAR": "Hogar",
        "VIAJE": "Viaje",
        "EVENTO": "Evento",
        "OTRO": "Otro",
        "OTRA": "Otra",
    }
    return etiquetas.get(tipo, "-")


def _monto_pdf(valor):
    return f"{Decimal(str(valor)):,.2f}"


def _monto_csv(valor):
    return f"{Decimal(str(valor)):.2f}"


def _cabecera_reporte(lienzo, continuacion=False):
    if continuacion:
        lienzo.texto(
            MARGEN,
            40,
            "FinanzApp · Reporte financiero (continuación)",
            tam=9,
            negrita=True,
            color=GRIS_TEXTO,
        )
        lienzo.linea(MARGEN, 48, ANCHO_PAGINA - MARGEN, 48, GRIS_BORDE, 0.8)
        return 62

    _dibujar_logo(lienzo, MARGEN, 24, 46)
    lienzo.texto(
        MARGEN + 58, 45, "FinanzApp", tam=19, negrita=True, color=PETROLEO
    )
    lienzo.texto(
        MARGEN + 58, 63, "Reporte financiero", tam=10, color=GRIS_TEXTO
    )
    lienzo.texto_derecha(
        ANCHO_PAGINA - MARGEN, 44, "Generado el", tam=8, color=GRIS_TEXTO
    )
    lienzo.texto_derecha(
        ANCHO_PAGINA - MARGEN,
        59,
        datetime.now().strftime("%d/%m/%Y %H:%M"),
        tam=9,
        negrita=True,
        color=PETROLEO,
    )
    lienzo.linea(MARGEN, 82, ANCHO_PAGINA - MARGEN, 82, PETROLEO, 1.5)
    return 100


def _bloque_info(lienzo, contexto, indicadores, alto):
    altura = 52
    lienzo.rect_redondeado(
        MARGEN, alto, ANCHO_CONTENIDO, altura, 8, relleno=CREMA
    )
    izquierda = MARGEN + 14
    derecha = MARGEN + 272
    fila_uno = alto + 20
    fila_dos = alto + 38

    _campo(
        lienzo, izquierda, fila_uno, "Cartera",
        _nombres_carteras(contexto["carteras"]), 226,
    )
    _campo(
        lienzo, derecha, fila_uno, "Periodo",
        _texto_periodo(contexto["inicio"], contexto["fin"]), 226,
    )
    _campo(lienzo, izquierda, fila_dos, "Tipo", _etiqueta_tipo(contexto), 226)
    _campo(
        lienzo, derecha, fila_dos, "Movimientos",
        str(indicadores["movimientos"]), 226,
    )
    return alto + altura + 18


def _campo(lienzo, x, y, etiqueta, valor, ancho):
    lienzo.texto(x, y, f"{etiqueta}:", tam=8, color=GRIS_TEXTO)
    desplazamiento = lienzo.ancho_texto(f"{etiqueta}:", 8) + 5
    lienzo.texto(
        x + desplazamiento,
        y,
        lienzo.recortar(valor, ancho - desplazamiento, 9, True),
        tam=9,
        negrita=True,
        color=PETROLEO,
    )


def _bloque_resumen(lienzo, indicadores, alto):
    tarjetas = [
        ("Ingresos", _monto_pdf(indicadores["totalIngresos"]), PETROLEO),
        ("Gastos", _monto_pdf(indicadores["totalGastos"]), TERRACOTA),
        ("Ahorro", _monto_pdf(indicadores["ahorro"]), PETROLEO),
        ("Movimientos", str(indicadores["movimientos"]), GRIS_TEXTO),
    ]
    separacion = 10
    ancho = (ANCHO_CONTENIDO - separacion * 3) / 4
    altura = 54
    for indice, (etiqueta, valor, color) in enumerate(tarjetas):
        x = MARGEN + indice * (ancho + separacion)
        lienzo.rect_redondeado(x, alto, ancho, altura, 8, relleno=CREMA)
        lienzo.texto(x + 14, alto + 21, etiqueta, tam=8, color=GRIS_TEXTO)
        lienzo.texto(
            x + 14, alto + 42, valor, tam=14, negrita=True, color=color
        )
    lienzo.texto(
        MARGEN, alto + altura + 14, "Montos en MXN.", tam=8, color=GRIS_TEXTO
    )
    return alto + altura + 28


def _bloque_gastos(lienzo, filas, alto):
    gastos = _gastos_de_filas(filas)
    if not gastos:
        return alto

    total = sum(gastos.values(), Decimal("0"))
    ordenados = sorted(gastos.items(), key=lambda item: item[1], reverse=True)

    if alto + 90 > LIMITE_INFERIOR:
        lienzo.nueva_pagina()
        alto = _cabecera_reporte(lienzo, continuacion=True)

    lienzo.texto(
        MARGEN, alto, "Gastos por categoría",
        tam=11, negrita=True, color=PETROLEO,
    )
    alto += 20
    alto = _encabezado_gastos(lienzo, alto)

    for nombre, monto in ordenados:
        if alto + 16 > LIMITE_INFERIOR:
            lienzo.nueva_pagina()
            alto = _cabecera_reporte(lienzo, continuacion=True)
            lienzo.texto(
                MARGEN, alto, "Gastos por categoría (continuación)",
                tam=11, negrita=True, color=PETROLEO,
            )
            alto += 18
            alto = _encabezado_gastos(lienzo, alto)
        porcentaje = float(monto / total * 100) if total else 0.0
        _fila_gasto(lienzo, alto, nombre, monto, porcentaje)
        alto += 16

    lienzo.linea(
        MARGEN, alto, MARGEN + ANCHO_CONTENIDO, alto, GRIS_BORDE, 0.6
    )
    alto += 13
    lienzo.texto(
        MARGEN, alto, "Total de gastos", tam=9, negrita=True, color=PETROLEO
    )
    lienzo.texto_derecha(
        MARGEN + 420, alto, _monto_pdf(total),
        tam=9, negrita=True, color=TERRACOTA,
    )
    lienzo.texto_derecha(
        MARGEN + ANCHO_CONTENIDO, alto, "100%",
        tam=9, negrita=True, color=GRIS_TEXTO,
    )
    return alto + 32


def _encabezado_gastos(lienzo, alto):
    lienzo.texto(MARGEN, alto, "Categoría", tam=7.5, negrita=True, color=GRIS_TEXTO)
    lienzo.texto(
        MARGEN + 200, alto, "Distribución",
        tam=7.5, negrita=True, color=GRIS_TEXTO,
    )
    lienzo.texto_derecha(
        MARGEN + 420, alto, "Monto", tam=7.5, negrita=True, color=GRIS_TEXTO
    )
    lienzo.texto_derecha(
        MARGEN + ANCHO_CONTENIDO, alto, "%",
        tam=7.5, negrita=True, color=GRIS_TEXTO,
    )
    lienzo.linea(
        MARGEN, alto + 5, MARGEN + ANCHO_CONTENIDO, alto + 5, GRIS_BORDE, 0.6
    )
    return alto + 16


def _fila_gasto(lienzo, alto, nombre, monto, porcentaje):
    lienzo.texto(
        MARGEN, alto + 11,
        lienzo.recortar(nombre, 190, 8.5),
        tam=8.5, color=PETROLEO,
    )
    barra_x = MARGEN + 200
    ancho_barra = 150
    lienzo.rect(barra_x, alto + 4, ancho_barra, 8, relleno=BARRA_FONDO)
    relleno = max(0.0, min(1.0, porcentaje / 100))
    if relleno > 0:
        lienzo.rect(
            barra_x, alto + 4, ancho_barra * relleno, 8, relleno=TERRACOTA
        )
    lienzo.texto_derecha(
        MARGEN + 420, alto + 11, _monto_pdf(monto), tam=8.5, color=TERRACOTA
    )
    lienzo.texto_derecha(
        MARGEN + ANCHO_CONTENIDO, alto + 11,
        f"{porcentaje:.1f}%", tam=8.5, color=GRIS_TEXTO,
    )


def _bloque_detalle(lienzo, filas, alto):
    if alto + 60 > LIMITE_INFERIOR:
        lienzo.nueva_pagina()
        alto = _cabecera_reporte(lienzo, continuacion=True)

    lienzo.texto(
        MARGEN, alto, "Detalle de movimientos",
        tam=11, negrita=True, color=PETROLEO,
    )
    alto += 20
    alto = _encabezado_detalle(lienzo, alto)

    for indice, (transaccion, cartera, categoria, autor) in enumerate(filas):
        if alto + FILA_DETALLE > LIMITE_INFERIOR:
            lienzo.nueva_pagina()
            alto = _cabecera_reporte(lienzo, continuacion=True)
            lienzo.texto(
                MARGEN, alto, "Detalle de movimientos (continuación)",
                tam=10, negrita=True, color=PETROLEO,
            )
            alto += 18
            alto = _encabezado_detalle(lienzo, alto)
        _fila_detalle(
            lienzo, alto, indice, transaccion, cartera, categoria, autor
        )
        alto += FILA_DETALLE


def _encabezado_detalle(lienzo, alto):
    lienzo.rect(MARGEN, alto, ANCHO_CONTENIDO, 16, relleno=PETROLEO)
    for titulo, desplazamiento, ancho, alineacion in COLUMNAS_DETALLE:
        x = MARGEN + desplazamiento
        if alineacion == "der":
            lienzo.texto_derecha(
                x + ancho - 4, alto + 11, titulo,
                tam=7.5, negrita=True, color=BLANCO,
            )
        else:
            lienzo.texto(
                x + 4, alto + 11, titulo,
                tam=7.5, negrita=True, color=BLANCO,
            )
    return alto + 16


def _fila_detalle(lienzo, alto, indice, transaccion, cartera, categoria, autor):
    if indice % 2 == 0:
        lienzo.rect(
            MARGEN, alto, ANCHO_CONTENIDO, FILA_DETALLE, relleno=CREMA
        )
    valores = [
        transaccion.fechaTransaccion.strftime("%d/%m/%Y"),
        "Ingreso" if transaccion.tipo == "INGRESO" else "Gasto",
        categoria.nombre if categoria else "Sin categoría",
        transaccion.descripcion or "-",
        f"{autor.nombreUsuario} {autor.apaterno or ''}".strip(),
        transaccion.metodoPago or "-",
        _monto_pdf(transaccion.monto),
    ]
    color_monto = PETROLEO if transaccion.tipo == "INGRESO" else TERRACOTA
    for (_, desplazamiento, ancho, alineacion), valor in zip(
        COLUMNAS_DETALLE, valores
    ):
        x = MARGEN + desplazamiento
        if alineacion == "der":
            lienzo.texto_derecha(
                x + ancho - 4,
                alto + 11,
                lienzo.recortar(valor, ancho - 6, 7.5),
                tam=7.5,
                negrita=True,
                color=color_monto,
            )
        else:
            lienzo.texto(
                x + 4,
                alto + 11,
                lienzo.recortar(valor, ancho - 8, 7.5),
                tam=7.5,
                color=PETROLEO,
            )


def _dibujar_logo(lienzo, x, y, tam):
    escala = tam / 180.0

    def px(valor):
        return x + valor * escala

    def py(valor):
        return y + valor * escala

    oscuro = (0.090, 0.231, 0.271)  # #173B45
    amarillo_claro = (0.976, 0.847, 0.341)  # #F9D857
    amarillo = (0.957, 0.769, 0.188)  # #F4C430
    amarillo_borde = (0.878, 0.678, 0.106)  # #E0AD1B
    crema = (0.973, 0.953, 0.937)  # #F8F3EF

    lienzo.circulo(
        px(104), py(54), 25 * escala,
        relleno=amarillo_claro, borde=amarillo,
        grosor=max(1.0, 4 * escala),
    )
    lienzo.circulo(
        px(78), py(65), 25 * escala,
        relleno=amarillo, borde=amarillo_borde,
        grosor=max(1.0, 4 * escala),
    )
    lienzo.rect_redondeado(
        px(28), py(58), 118 * escala, 98 * escala, 16 * escala, relleno=oscuro
    )
    lienzo.linea(
        px(38), py(66), px(136), py(66), crema, max(1.0, 5 * escala)
    )
    lienzo.rect_redondeado(
        px(112), py(95), 42 * escala, 28 * escala, 14 * escala,
        relleno=oscuro, borde=crema, grosor=max(1.0, 5 * escala),
    )
    lienzo.circulo(px(126), py(109), 4.5 * escala, relleno=crema)


def _pdf_bytes(lineas, por_pagina=52):
    lienzo = _LienzoPdf()
    for indice, linea in enumerate(lineas):
        if indice and indice % por_pagina == 0:
            lienzo.nueva_pagina()
        alto = 60 + (indice % por_pagina) * 13
        lienzo.texto(MARGEN, alto, linea, tam=10, color=PETROLEO)
    lienzo.sello_pies("FinanzApp")
    return lienzo.a_bytes()


class _LienzoPdf:
    ALTO = ALTO_PAGINA

    def __init__(self):
        self.paginas = []
        self._ops = []
        self.paginas.append(self._ops)

    def nueva_pagina(self):
        self._ops = []
        self.paginas.append(self._ops)

    def texto(self, x, y, texto, tam=9, negrita=False, color=PETROLEO):
        fuente = "F2" if negrita else "F1"
        self._ops.append(
            f"BT /{fuente} {tam:.2f} Tf {_rgb(color)} rg "
            f"1 0 0 1 {x:.2f} {self.ALTO - y:.2f} Tm "
            f"({_pdf_escape(_pdf_texto(texto))}) Tj ET"
        )

    def texto_derecha(
        self, x_derecha, y, texto, tam=9, negrita=False, color=PETROLEO
    ):
        ancho = self.ancho_texto(texto, tam, negrita)
        self.texto(x_derecha - ancho, y, texto, tam, negrita, color)

    def ancho_texto(self, texto, tam=9, negrita=False):
        limpio = _pdf_texto(texto)
        total = sum(
            _ANCHOS_TEXTO.get(caracter, 556) for caracter in limpio
        )
        ancho = total / 1000 * tam
        return ancho * 1.04 if negrita else ancho

    def recortar(self, texto, ancho, tam=9, negrita=False):
        texto = str(texto)
        if self.ancho_texto(texto, tam, negrita) <= ancho:
            return texto
        recorte = texto
        while recorte and self.ancho_texto(
            recorte + "...", tam, negrita
        ) > ancho:
            recorte = recorte[:-1]
        return f"{recorte}..." if recorte else ""

    def rect(self, x, y, ancho, alto, relleno=None, borde=None, grosor=1):
        ruta = (
            f"{x:.2f} {self.ALTO - y - alto:.2f} "
            f"{ancho:.2f} {alto:.2f} re"
        )
        self._ops.append(_operacion_forma(ruta, relleno, borde, grosor))

    def linea(self, x1, y1, x2, y2, color, grosor=1):
        self._ops.append(
            f"{_rgb(color)} RG {grosor:.2f} w "
            f"{x1:.2f} {self.ALTO - y1:.2f} m "
            f"{x2:.2f} {self.ALTO - y2:.2f} l S"
        )

    def rect_redondeado(
        self, x, y, ancho, alto, radio, relleno=None, borde=None, grosor=1
    ):
        ruta = _ruta_rect_redondeado(
            x, y, ancho, alto, radio, self.ALTO
        )
        self._ops.append(_operacion_forma(ruta, relleno, borde, grosor))

    def circulo(self, cx, cy, radio, relleno=None, borde=None, grosor=1):
        ruta = _ruta_circulo(cx, cy, radio, self.ALTO)
        self._ops.append(_operacion_forma(ruta, relleno, borde, grosor))

    def sello_pies(self, texto):
        total = len(self.paginas)
        for indice, pagina in enumerate(self.paginas):
            anterior = self._ops
            self._ops = pagina
            self.linea(
                MARGEN, 752, ANCHO_PAGINA - MARGEN, 752, GRIS_BORDE, 0.6
            )
            self.texto(MARGEN, 766, texto, tam=7.5, color=GRIS_TEXTO)
            self.texto_derecha(
                ANCHO_PAGINA - MARGEN,
                766,
                f"Página {indice + 1} de {total}",
                tam=7.5,
                color=GRIS_TEXTO,
            )
            self._ops = anterior

    def a_bytes(self):
        cantidad = len(self.paginas)
        ids_pagina = []
        ids_contenido = []
        siguiente = 5
        for _ in range(cantidad):
            ids_pagina.append(siguiente)
            ids_contenido.append(siguiente + 1)
            siguiente += 2

        objetos = [
            "<< /Type /Catalog /Pages 2 0 R >>",
            (
                "<< /Type /Pages /Kids ["
                + " ".join(
                    f"{identificador} 0 R" for identificador in ids_pagina
                )
                + f"] /Count {cantidad} >>"
            ),
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica "
            "/Encoding /WinAnsiEncoding >>",
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold "
            "/Encoding /WinAnsiEncoding >>",
        ]

        for id_pagina, id_contenido, operaciones in zip(
            ids_pagina, ids_contenido, self.paginas
        ):
            objetos.append(
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
                "/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> "
                f"/Contents {id_contenido} 0 R >>"
            )
            contenido = "\n".join(operaciones)
            objetos.append(
                f"<< /Length {len(contenido.encode('latin-1'))} >>\n"
                f"stream\n{contenido}\nendstream"
            )

        salida = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
        offsets = [0]
        for numero, objeto in enumerate(objetos, start=1):
            offsets.append(len(salida))
            salida += f"{numero} 0 obj\n{objeto}\nendobj\n".encode("latin-1")

        inicio_xref = len(salida)
        salida += f"xref\n0 {len(objetos) + 1}\n".encode("latin-1")
        salida += b"0000000000 65535 f \n"
        for offset in offsets[1:]:
            salida += f"{offset:010d} 00000 n \n".encode("latin-1")
        salida += (
            f"trailer\n<< /Size {len(objetos) + 1} /Root 1 0 R >>\n"
            f"startxref\n{inicio_xref}\n%%EOF\n"
        ).encode("latin-1")
        return salida


def _operacion_forma(ruta, relleno, borde, grosor):
    partes = []
    if relleno is not None:
        partes.append(f"{_rgb(relleno)} rg")
    if borde is not None:
        partes.append(f"{_rgb(borde)} RG {grosor:.2f} w")
    partes.append(ruta)
    if relleno is not None and borde is not None:
        partes.append("B")
    elif relleno is not None:
        partes.append("f")
    elif borde is not None:
        partes.append("S")
    return " ".join(partes)


def _ruta_rect_redondeado(x, y, ancho, alto, radio, alto_pagina):
    k = 0.5522847498
    radio = min(radio, ancho / 2, alto / 2)
    x0, y0, x1, y1 = x, y, x + ancho, y + alto
    control = radio * k

    def convertir(valor):
        return alto_pagina - valor

    return " ".join(
        [
            f"{x0 + radio:.2f} {convertir(y0):.2f} m",
            f"{x1 - radio:.2f} {convertir(y0):.2f} l",
            f"{x1 - radio + control:.2f} {convertir(y0):.2f} "
            f"{x1:.2f} {convertir(y0 + radio - control):.2f} "
            f"{x1:.2f} {convertir(y0 + radio):.2f} c",
            f"{x1:.2f} {convertir(y1 - radio):.2f} l",
            f"{x1:.2f} {convertir(y1 - radio + control):.2f} "
            f"{x1 - radio + control:.2f} {convertir(y1):.2f} "
            f"{x1 - radio:.2f} {convertir(y1):.2f} c",
            f"{x0 + radio:.2f} {convertir(y1):.2f} l",
            f"{x0 + radio - control:.2f} {convertir(y1):.2f} "
            f"{x0:.2f} {convertir(y1 - radio + control):.2f} "
            f"{x0:.2f} {convertir(y1 - radio):.2f} c",
            f"{x0:.2f} {convertir(y0 + radio):.2f} l",
            f"{x0:.2f} {convertir(y0 + radio - control):.2f} "
            f"{x0 + radio - control:.2f} {convertir(y0):.2f} "
            f"{x0 + radio:.2f} {convertir(y0):.2f} c",
            "h",
        ]
    )


def _ruta_circulo(cx, cy, radio, alto_pagina):
    k = 0.5522847498 * radio

    def convertir(valor):
        return alto_pagina - valor

    return " ".join(
        [
            f"{cx + radio:.2f} {convertir(cy):.2f} m",
            f"{cx + radio:.2f} {convertir(cy + k):.2f} "
            f"{cx + k:.2f} {convertir(cy + radio):.2f} "
            f"{cx:.2f} {convertir(cy + radio):.2f} c",
            f"{cx - k:.2f} {convertir(cy + radio):.2f} "
            f"{cx - radio:.2f} {convertir(cy + k):.2f} "
            f"{cx - radio:.2f} {convertir(cy):.2f} c",
            f"{cx - radio:.2f} {convertir(cy - k):.2f} "
            f"{cx - k:.2f} {convertir(cy - radio):.2f} "
            f"{cx:.2f} {convertir(cy - radio):.2f} c",
            f"{cx + k:.2f} {convertir(cy - radio):.2f} "
            f"{cx + radio:.2f} {convertir(cy - k):.2f} "
            f"{cx + radio:.2f} {convertir(cy):.2f} c",
            "h",
        ]
    )


def _rgb(color):
    return f"{color[0]:.3f} {color[1]:.3f} {color[2]:.3f}"


def _pdf_texto(valor):
    texto = unicodedata.normalize("NFC", str(valor))
    texto = texto.encode("latin-1", "replace").decode("latin-1")
    return texto.replace("\r", " ").replace("\n", " ")


def _pdf_escape(valor):
    return valor.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _nombres_carteras(carteras):
    return ", ".join(cartera.nombre for cartera in carteras)


def _texto_periodo(inicio, fin):
    if not inicio and not fin:
        return "Todo el historial"
    desde = inicio.strftime("%d/%m/%Y") if inicio else "inicio"
    hasta = fin.strftime("%d/%m/%Y") if fin else "hoy"
    return f"{desde} a {hasta}"


def _nombre_archivo(contexto, formato="CSV"):
    hoy = date.today().strftime("%Y%m%d")
    extension = "pdf" if formato == "PDF" else "csv"
    if contexto["cartera_id"] is not None:
        base = f"reporte_cartera_{contexto['cartera_id']}"
    else:
        base = "reporte"

    if contexto["inicio"] or contexto["fin"]:
        desde = (
            contexto["inicio"].strftime("%Y%m%d")
            if contexto["inicio"]
            else "inicio"
        )
        hasta = (
            contexto["fin"].strftime("%Y%m%d") if contexto["fin"] else hoy
        )
        return f"{base}_{desde}_{hasta}.{extension}"

    return f"{base}_{hoy}.{extension}"


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
