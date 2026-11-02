package com.finanzap.core.network

import com.finanzap.core.storage.EventosSesion
import com.finanzap.core.storage.SesionLocalFalsa
import com.finanzap.features.auth.data.AuthApi
import com.finanzap.features.auth.data.CambiarContrasenaRequest
import com.finanzap.features.auth.data.ConfirmacionCuentaRequest
import com.finanzap.features.auth.data.DatosToken
import com.finanzap.features.auth.data.LoginRequest
import com.finanzap.features.auth.data.RecuperarRequest
import com.finanzap.features.auth.data.RefreshRequest
import com.finanzap.features.auth.data.RespuestaMensaje
import com.finanzap.features.auth.data.RespuestaRecuperacion
import com.finanzap.features.auth.data.RespuestaSesion
import com.finanzap.features.auth.data.RespuestaToken
import com.finanzap.features.auth.data.RestablecerRequest
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import okhttp3.Protocol
import okhttp3.Request
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test
import javax.inject.Provider

@OptIn(ExperimentalCoroutinesApi::class)
class TokenAuthenticatorTest {

    private val api = ApiFalsa()

    @Test
    fun `renueva el token y repite la peticion`() {
        val sesion = SesionLocalFalsa(refresh = "refresh-1")
        val autenticador = TokenAuthenticator(sesion, EventosSesion(), Provider { api })

        val peticion = autenticador.authenticate(null, respuesta(401, "/carteras"))

        assertNotNull(peticion)
        assertEquals("Bearer acceso-nuevo", peticion?.header("Authorization"))
        assertEquals("acceso-nuevo", sesion.access)
    }

    @Test
    fun `sin refresh token cierra la sesion`() {
        val sesion = SesionLocalFalsa(refresh = null)
        val autenticador = TokenAuthenticator(sesion, EventosSesion(), Provider { api })

        assertNull(autenticador.authenticate(null, respuesta(401, "/carteras")))
        assertEquals(1, sesion.limpiezas)
    }

    @Test
    fun `no intenta renovar sobre rutas de auth`() {
        val sesion = SesionLocalFalsa(refresh = "refresh-1")
        val autenticador = TokenAuthenticator(sesion, EventosSesion(), Provider { api })

        assertNull(autenticador.authenticate(null, respuesta(401, "/auth/login")))
        assertEquals(0, sesion.limpiezas)
    }

    @Test
    fun `avisa a la navegacion cuando la sesion termina`() = runTest {
        val sesion = SesionLocalFalsa(refresh = null)
        val eventos = EventosSesion()
        var avisoRecibido = false
        backgroundScope.launch(UnconfinedTestDispatcher(testScheduler)) {
            eventos.sesionTerminada.collect { avisoRecibido = true }
        }
        val autenticador = TokenAuthenticator(sesion, eventos, Provider { api })

        autenticador.authenticate(null, respuesta(401, "/carteras"))

        assertEquals(true, avisoRecibido)
    }

    private fun respuesta(codigo: Int, ruta: String): Response =
        Response.Builder()
            .request(Request.Builder().url("http://localhost$ruta").build())
            .protocol(Protocol.HTTP_1_1)
            .code(codigo)
            .message("Unauthorized")
            .body("".toResponseBody(null))
            .build()
}

private class ApiFalsa : AuthApi {

    override suspend fun renovarToken(peticion: RefreshRequest): RespuestaToken =
        RespuestaToken(data = DatosToken(accessToken = "acceso-nuevo"))

    override suspend fun iniciarSesion(peticion: LoginRequest): RespuestaSesion =
        throw UnsupportedOperationException()

    override suspend fun cerrarSesion() = Unit

    override suspend fun solicitarRecuperacion(peticion: RecuperarRequest): RespuestaRecuperacion =
        throw UnsupportedOperationException()

    override suspend fun restablecerContrasenia(peticion: RestablecerRequest): RespuestaMensaje =
        throw UnsupportedOperationException()

    override suspend fun cambiarContrasenia(peticion: CambiarContrasenaRequest): RespuestaMensaje =
        throw UnsupportedOperationException()

    override suspend fun desactivarCuenta(peticion: ConfirmacionCuentaRequest): RespuestaMensaje =
        throw UnsupportedOperationException()

    override suspend fun eliminarCuenta(peticion: ConfirmacionCuentaRequest): RespuestaMensaje =
        throw UnsupportedOperationException()
}
