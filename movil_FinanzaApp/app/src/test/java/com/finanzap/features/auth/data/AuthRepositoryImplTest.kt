package com.finanzap.features.auth.data

import com.finanzap.core.storage.SesionLocalFalsa
import com.finanzap.features.auth.data.dto.CambiarContrasenaRequest
import com.finanzap.features.auth.data.dto.ConfirmacionCuentaRequest
import com.finanzap.features.auth.data.dto.DatosRecuperacion
import com.finanzap.features.auth.data.dto.DatosSesion
import com.finanzap.features.auth.data.dto.DatosToken
import com.finanzap.features.auth.data.dto.LoginRequest
import com.finanzap.features.auth.data.dto.RecuperarRequest
import com.finanzap.features.auth.data.dto.RefreshRequest
import com.finanzap.features.auth.data.dto.RespuestaMensaje
import com.finanzap.features.auth.data.dto.RespuestaRecuperacion
import com.finanzap.features.auth.data.dto.RespuestaSesion
import com.finanzap.features.auth.data.dto.RespuestaToken
import com.finanzap.features.auth.data.dto.RestablecerRequest
import com.finanzap.features.auth.data.dto.Usuario
import java.io.IOException
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AuthRepositoryImplTest {

    private val api = ApiFalsa()
    private val sesion = SesionLocalFalsa()
    private val repositorio = AuthRepositoryImpl(api, sesion)

    @Test
    fun `login exitoso guarda access y refresh`() = runTest {
        val resultado = repositorio.iniciarSesion("diego@correo.com", "Segura123")

        assertTrue(resultado.isSuccess)
        assertEquals("access-1", sesion.access)
        assertEquals("refresh-1", sesion.refresh)
    }

    @Test
    fun `login con token vacio no guarda sesion`() = runTest {
        api.accessVacio = true

        val resultado = repositorio.iniciarSesion("diego@correo.com", "Segura123")

        assertTrue(resultado.isFailure)
        assertNull(sesion.access)
        assertNull(sesion.refresh)
    }

    @Test
    fun `recuperacion devuelve el codigo de desarrollo`() = runTest {
        api.codigo = "123456"

        assertEquals("123456", repositorio.solicitarRecuperacion("diego@correo.com").getOrNull())
    }

    @Test
    fun `desactivar cuenta limpia la sesion`() = runTest {
        sesion.guardarSesion("access-1", "refresh-1")

        assertTrue(repositorio.desactivarCuenta("Segura123").isSuccess)
        assertNull(sesion.access)
        assertEquals(1, sesion.limpiezas)
    }

    @Test
    fun `eliminar cuenta limpia la sesion`() = runTest {
        sesion.guardarSesion("access-1", "refresh-1")

        assertTrue(repositorio.eliminarCuenta("Segura123").isSuccess)
        assertNull(sesion.access)
        assertEquals(1, sesion.limpiezas)
    }

    @Test
    fun `cerrar sesion limpia aunque la api falle`() = runTest {
        sesion.guardarSesion("access-1", "refresh-1")
        api.fallaCerrar = IOException("sin red")

        repositorio.cerrarSesion()

        assertNull(sesion.access)
        assertEquals(1, sesion.limpiezas)
    }

    @Test
    fun `hay sesion delega en el almacenamiento`() {
        sesion.guardarSesion("access-1", "refresh-1")
        assertTrue(repositorio.haySesion())

        sesion.limpiar()
        assertFalse(repositorio.haySesion())
    }
}

private class ApiFalsa : AuthApi {

    var accessVacio = false
    var codigo: String? = null
    var fallaCerrar: Exception? = null

    override suspend fun iniciarSesion(peticion: LoginRequest): RespuestaSesion {
        val access = if (accessVacio) "" else "access-1"
        return RespuestaSesion(
            ok = true,
            data = DatosSesion(
                accessToken = access,
                refreshToken = "refresh-1",
                usuario = Usuario(
                    idUsuario = 1,
                    nombreUsuario = "Diego",
                    apaterno = "Borja",
                    correo = "diego@correo.com",
                    rolGlobal = "USUARIO",
                    estado = "ACTIVO"
                )
            )
        )
    }

    override suspend fun renovarToken(peticion: RefreshRequest): RespuestaToken =
        RespuestaToken(data = DatosToken(accessToken = "nuevo"))

    override suspend fun cerrarSesion() {
        fallaCerrar?.let { throw it }
    }

    override suspend fun solicitarRecuperacion(peticion: RecuperarRequest): RespuestaRecuperacion =
        RespuestaRecuperacion(data = DatosRecuperacion(codigo = codigo))

    override suspend fun restablecerContrasenia(peticion: RestablecerRequest): RespuestaMensaje =
        RespuestaMensaje()

    override suspend fun cambiarContrasenia(peticion: CambiarContrasenaRequest): RespuestaMensaje =
        RespuestaMensaje()

    override suspend fun desactivarCuenta(peticion: ConfirmacionCuentaRequest): RespuestaMensaje =
        RespuestaMensaje()

    override suspend fun eliminarCuenta(peticion: ConfirmacionCuentaRequest): RespuestaMensaje =
        RespuestaMensaje()
}
