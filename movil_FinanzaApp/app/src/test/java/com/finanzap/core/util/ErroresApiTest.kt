package com.finanzap.core.util

import java.io.IOException
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Test
import retrofit2.HttpException
import retrofit2.Response

class ErroresApiTest {

    @Test
    fun `usa el mensaje del backend cuando viene`() {
        val error = errorHttp(400, """{"mensaje":"La cartera ya existe."}""")

        assertEquals(
            "La cartera ya existe.",
            mensajeErrorApi(error, "No se pudo crear la cartera.")
        )
    }

    @Test
    fun `mensaje vacio usa el texto por defecto`() {
        val error = errorHttp(500, """{"mensaje":""}""")

        assertEquals(
            "No se pudo crear la cartera.",
            mensajeErrorApi(error, "No se pudo crear la cartera.")
        )
    }

    @Test
    fun `error de red muestra el aviso de conexion`() {
        assertEquals(
            "No se pudo conectar. Revisa tu conexión.",
            mensajeErrorApi(IOException("sin red"), "No se pudo crear la cartera.")
        )
    }

    @Test
    fun `error desconocido usa el texto por defecto`() {
        assertEquals(
            "No se pudo crear la cartera.",
            mensajeErrorApi(IllegalStateException("raro"), "No se pudo crear la cartera.")
        )
    }

    private fun errorHttp(codigo: Int, cuerpo: String): HttpException =
        HttpException(
            Response.error<Unit>(
                codigo,
                cuerpo.toResponseBody("application/json".toMediaType())
            )
        )
}
