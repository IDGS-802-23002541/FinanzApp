package com.finanzap.core.util

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class FormatoTest {

    @Test
    fun `monto entero no muestra centavos`() {
        val texto = formatearMoneda(1500.0)

        assertTrue(texto.contains("1,500"))
        assertFalse(texto.contains(".00"))
    }

    @Test
    fun `monto con decimales conserva centavos`() {
        assertTrue(formatearMoneda(1500.5).contains("50"))
    }

    @Test
    fun `rango con meses distintos menciona ambos meses`() {
        val texto = formatearRangoFechas("2026-11-10", "2026-12-17")

        assertTrue("texto: $texto", texto.contains("10"))
        assertTrue("texto: $texto", texto.contains("17"))
        assertTrue("texto: $texto", texto.contains("2026"))
    }
}
