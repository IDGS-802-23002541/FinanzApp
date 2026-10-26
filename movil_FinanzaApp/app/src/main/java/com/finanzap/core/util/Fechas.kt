package com.finanzap.core.util

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

private val ISO = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}
private val CORTA = SimpleDateFormat("dd/MM/yyyy", Locale("es", "MX")).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/** El DatePicker entrega milisegundos en UTC; la API espera YYYY-MM-DD. */
fun fechaIsoDesdeMillis(millis: Long): String = ISO.format(Date(millis))

/** "2026-11-01" → "01/11/2026" para mostrar en el formulario. */
fun formatearFechaCorta(iso: String): String = ISO.parse(iso)?.let { CORTA.format(it) } ?: iso
