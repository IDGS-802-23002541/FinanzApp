package com.finanzap.features.auth.ui

import com.finanzap.features.auth.data.AuthRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import kotlinx.coroutines.withTimeoutOrNull
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test
import retrofit2.HttpException
import retrofit2.Response

@OptIn(ExperimentalCoroutinesApi::class)
class LoginViewModelTest {

    private val repositorio = RepositorioLoginFalso()

    @Before
    fun preparar() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @After
    fun limpiar() {
        Dispatchers.resetMain()
    }

    @Test
    fun `correo invalido no llama a la api`() = runTest {
        val viewModel = LoginViewModel(repositorio)

        viewModel.onCorreoChange("sin-arroba")
        viewModel.onContrasenaChange("Segura123")
        viewModel.iniciarSesion()

        assertEquals("Ingresa un correo válido.", viewModel.state.value.errorCorreo)
        assertEquals(0, repositorio.llamadas)
    }

    @Test
    fun `contrasena vacia no llama a la api`() = runTest {
        val viewModel = LoginViewModel(repositorio)

        viewModel.onCorreoChange("diego@correo.com")
        viewModel.iniciarSesion()

        assertEquals("Ingresa tu contraseña.", viewModel.state.value.errorContrasena)
        assertEquals(0, repositorio.llamadas)
    }

    @Test
    fun `credenciales rechazadas muestran el mensaje de acceso`() = runTest {
        repositorio.falla = HttpException(
            Response.error<Unit>(
                401,
                "{}".toResponseBody("application/json".toMediaType())
            )
        )
        val viewModel = LoginViewModel(repositorio)

        viewModel.onCorreoChange("diego@correo.com")
        viewModel.onContrasenaChange("Segura123")
        viewModel.iniciarSesion()

        assertEquals("Correo o contraseña incorrectos.", viewModel.state.value.errorGeneral)
        assertNull(withTimeoutOrNull(100) { viewModel.eventos.first() })
    }

    @Test
    fun `login exitoso emite el evento de navegacion`() = runTest {
        val viewModel = LoginViewModel(repositorio)

        viewModel.onCorreoChange("diego@correo.com")
        viewModel.onContrasenaChange("Segura123")
        viewModel.iniciarSesion()

        assertEquals(LoginEvento.IrACarteras, viewModel.eventos.first())
        assertEquals(1, repositorio.llamadas)
    }
}

private class RepositorioLoginFalso : AuthRepository {

    var llamadas = 0
    var falla: Throwable? = null

    override suspend fun iniciarSesion(correo: String, contrasena: String): Result<Unit> {
        llamadas++
        val error = falla
        return if (error != null) Result.failure(error) else Result.success(Unit)
    }

    override suspend fun solicitarRecuperacion(correo: String): Result<String?> =
        Result.success(null)

    override suspend fun restablecerContrasenia(
        correo: String,
        codigo: String,
        contrasena: String
    ): Result<Unit> = Result.success(Unit)

    override suspend fun cambiarContrasenia(actual: String, nueva: String): Result<Unit> =
        Result.success(Unit)

    override suspend fun desactivarCuenta(contrasena: String): Result<Unit> =
        Result.success(Unit)

    override suspend fun eliminarCuenta(contrasena: String): Result<Unit> =
        Result.success(Unit)

    override suspend fun cerrarSesion() = Unit

    override fun haySesion(): Boolean = false
}
