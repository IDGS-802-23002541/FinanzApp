package com.finanzap.core.util

import java.text.ParsePosition
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
private val ISO_HORA = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}
private val CORTA_HORA = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale("es", "MX")).apply {
    timeZone = TimeZone.getTimeZone("UTC")
}

/** Devuelve null si el texto no es una fecha ISO completa, en vez de lanzar. */
internal fun parsearFecha(iso: String): Date? {
    val posicion = ParsePosition(0)
    val fecha = ISO.parse(iso, posicion)
    return if (posicion.index == iso.length) fecha else null
}

/** El DatePicker entrega milisegundos en UTC; la API espera YYYY-MM-DD. */
fun fechaIsoDesdeMillis(millis: Long): String = ISO.format(Date(millis))

/** "2026-11-01" → "01/11/2026" para mostrar en el formulario. */
fun formatearFechaCorta(iso: String): String = parsearFecha(iso)?.let { CORTA.format(it) } ?: iso

/** "2026-11-01T14:30:00.123456" → "01/11/2026 14:30"; ignora fracciones de segundo. */
fun formatearFechaHoraCorta(iso: String): String {
    val sinFraccion = iso.take(19)
    val posicion = ParsePosition(0)
    val fecha = ISO_HORA.parse(sinFraccion, posicion)
    return if (fecha != null && posicion.index == sinFraccion.length) {
        CORTA_HORA.format(fecha)
    } else {
        iso
    }
}
