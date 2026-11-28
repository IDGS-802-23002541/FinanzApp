package com.finanzap.core.util

import java.time.Instant
import java.util.TimeZone
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class FechasTest {

    private lateinit var zonaOriginal: TimeZone

    @Before
    fun prepararZona() {
        zonaOriginal = TimeZone.getDefault()
        TimeZone.setDefault(TimeZone.getTimeZone("GMT-06:00"))
    }

    @After
    fun restaurarZona() {
        TimeZone.setDefault(zonaOriginal)
    }

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
    fun `fecha con hora se muestra en la zona local`() {
        assertEquals(
            "01/11/2026 08:30",
            formatearFechaHoraCorta("2026-11-01T14:30:00.123456")
        )
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
