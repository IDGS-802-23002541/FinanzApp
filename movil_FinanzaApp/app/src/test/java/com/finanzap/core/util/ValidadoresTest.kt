package com.finanzap.core.util

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ValidadoresTest {

    @Test
    fun `correo vacio pide el dato`() {
        assertEquals("Ingresa tu correo.", errorCorreo("   "))
    }

    @Test
    fun `correo sin arroba es invalido`() {
        assertEquals("Ingresa un correo válido.", errorCorreo("diego.correo.com"))
    }

    @Test
    fun `correo correcto no tiene error`() {
        assertNull(errorCorreo("diego@correo.com"))
    }

    @Test
    fun `codigo solo acepta seis digitos`() {
        assertTrue(codigoValido("123456"))
        assertFalse(codigoValido("12345"))
        assertFalse(codigoValido("12a456"))
    }

    @Test
    fun `contrasena debil enumera todos los requisitos`() {
        assertEquals(
            "Debe incluir: mínimo 8 caracteres, una mayúscula, un número.",
            errorContrasenaNueva("corta")
        )
    }

    @Test
    fun `contrasena fuerte no tiene error`() {
        assertNull(errorContrasenaNueva("Segura123"))
    }

    @Test
    fun `confirmacion distinta muestra error`() {
        assertEquals(
            "Las contraseñas no coinciden.",
            errorConfirmacion("Segura123", "Otra123")
        )
        assertNull(errorConfirmacion("Segura123", "Segura123"))
    }
}
