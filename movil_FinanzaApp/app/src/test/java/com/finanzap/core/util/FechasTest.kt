package com.finanzap.core.util

import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class FechasTest {

    @Test
    fun `millis utc se convierten a iso`() {
        val millis = Instant.parse("2026-11-01T00:00:00Z").toEpochMilli()

        assertEquals("2026-11-01", fechaIsoDesdeMillis(millis))
    }

    @Test
    fun `iso se muestra en formato dd MM aaaa`() {
        assertEquals("01/11/2026", formatearFechaCorta("2026-11-01"))
    }

    @Test
    fun `texto invalido se devuelve sin cambios`() {
        assertEquals("sin-fecha", formatearFechaCorta("sin-fecha"))
    }

    @Test
    fun `rango del mismo mes incluye ambos dias`() {
        val texto = formatearRangoFechas("2026-11-10", "2026-11-17")

        assertTrue("texto: $texto", texto.contains("10"))
        assertTrue("texto: $texto", texto.contains("17"))
        assertTrue("texto: $texto", texto.contains("2026"))
    }
}
