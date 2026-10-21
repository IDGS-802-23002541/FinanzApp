package com.finanzap.core.util

import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Locale

private val LOCALE_MX = Locale("es", "MX")

/** Montos en MXN con separador de miles; sin centavos cuando el monto es entero. */
fun formatearMoneda(monto: Double): String {
    val formato = NumberFormat.getCurrencyInstance(LOCALE_MX)
    formato.maximumFractionDigits = if (monto % 1.0 == 0.0) 0 else 2
    return formato.format(monto)
}

/** "2026-11-10" y "2026-11-17" → "10 – 17 nov 2026"; meses distintos → "10 nov – 17 dic 2026". */
fun formatearRangoFechas(inicio: String, fin: String): String {
    val entrada = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    val dia = SimpleDateFormat("d", LOCALE_MX)
    val diaMes = SimpleDateFormat("d MMM", LOCALE_MX)
    val diaMesAnio = SimpleDateFormat("d MMM yyyy", LOCALE_MX)
    val mesAnio = SimpleDateFormat("MMM yyyy", LOCALE_MX)
    val anio = SimpleDateFormat("yyyy", LOCALE_MX)

    val desde = entrada.parse(inicio) ?: return inicio
    val hasta = entrada.parse(fin) ?: return fin

    return when {
        mesAnio.format(desde) == mesAnio.format(hasta) ->
            "${dia.format(desde)} – ${diaMesAnio.format(hasta)}"
        anio.format(desde) == anio.format(hasta) ->
            "${diaMes.format(desde)} – ${diaMesAnio.format(hasta)}"
        else ->
            "${diaMesAnio.format(desde)} – ${diaMesAnio.format(hasta)}"
    }
}
