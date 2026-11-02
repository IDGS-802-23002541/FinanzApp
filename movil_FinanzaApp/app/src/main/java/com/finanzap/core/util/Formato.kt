package com.finanzap.core.util

import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

private val LOCALE_MX = Locale("es", "MX")
private val UTC = TimeZone.getTimeZone("UTC")

private fun formato(patron: String): SimpleDateFormat =
    SimpleDateFormat(patron, LOCALE_MX).apply { timeZone = UTC }

/** Montos en MXN con separador de miles; sin centavos cuando el monto es entero. */
fun formatearMoneda(monto: Double): String {
    val formato = NumberFormat.getCurrencyInstance(LOCALE_MX)
    formato.maximumFractionDigits = if (monto % 1.0 == 0.0) 0 else 2
    return formato.format(monto)
}

/** "2026-11-10" y "2026-11-17" → "10 – 17 nov 2026"; meses distintos → "10 nov – 17 dic 2026". */
fun formatearRangoFechas(inicio: String, fin: String): String {
    val dia = formato("d")
    val diaMes = formato("d MMM")
    val diaMesAnio = formato("d MMM yyyy")
    val mesAnio = formato("MMM yyyy")
    val anio = formato("yyyy")

    val desde = parsearFecha(inicio) ?: return inicio
    val hasta = parsearFecha(fin) ?: return fin

    return when {
        mesAnio.format(desde) == mesAnio.format(hasta) ->
            "${dia.format(desde)} – ${diaMesAnio.format(hasta)}"
        anio.format(desde) == anio.format(hasta) ->
            "${diaMes.format(desde)} – ${diaMesAnio.format(hasta)}"
        else ->
            "${diaMesAnio.format(desde)} – ${diaMesAnio.format(hasta)}"
    }
}
