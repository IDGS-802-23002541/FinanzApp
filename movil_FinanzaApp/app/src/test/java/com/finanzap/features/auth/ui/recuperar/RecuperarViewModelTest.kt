package com.finanzap.features.auth.ui.recuperar

import com.finanzap.features.auth.data.AuthRepository
import java.io.IOException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class RecuperarViewModelTest {

    private val repositorio = RepositorioFalso()

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
        val viewModel = RecuperarViewModel(repositorio)

        viewModel.onCorreoChange("sin-arroba")
        viewModel.solicitarCodigo()

        assertEquals("Ingresa un correo válido.", viewModel.state.value.errorCorreo)
        assertEquals(PasoRecuperacion.SOLICITUD, viewModel.state.value.paso)
        assertEquals(0, repositorio.llamadasRecuperacion)
    }

    @Test
    fun `solicitud exitosa avanza al codigo y expone el codigo de desarrollo`() = runTest {
        val viewModel = RecuperarViewModel(repositorio)

        viewModel.onCorreoChange("diego@correo.com")
        viewModel.solicitarCodigo()

        val estado = viewModel.state.value
        assertEquals(PasoRecuperacion.CODIGO, estado.paso)
        // BuildConfig.DEBUG es true en las pruebas unitarias del variant debug.
        assertEquals("123456", estado.codigoDesarrollo)
        assertFalse(estado.cargando)
        assertEquals(1, repositorio.llamadasRecuperacion)
    }

    @Test
    fun `fallo al solicitar mantiene la solicitud y muestra el error`() = runTest {
        repositorio.fallaRecuperacion = IOException("sin red")
        val viewModel = RecuperarViewModel(repositorio)

        viewModel.onCorreoChange("diego@correo.com")
        viewModel.solicitarCodigo()

        val estado = viewModel.state.value
        assertEquals(PasoRecuperacion.SOLICITUD, estado.paso)
        assertEquals("No se pudo conectar. Revisa tu conexión.", estado.errorGeneral)
        assertFalse(estado.cargando)
    }

    @Test
    fun `codigo invalido no llama a restablecer`() = runTest {
        val viewModel = viewModelEnPasoDeCodigo()

        viewModel.onCodigoChange("12ab")
        viewModel.restablecer()

        assertEquals("", viewModel.state.value.codigo)
        assertEquals("Ingresa el código de 6 dígitos.", viewModel.state.value.errorCodigo)
        assertEquals(0, repositorio.llamadasRestablecer)
    }

    @Test
    fun `contrasena debil y confirmacion distinta muestran ambos errores`() = runTest {
        val viewModel = viewModelEnPasoDeCodigo()

        viewModel.onCodigoChange("123456")
        viewModel.onContrasenaChange("corta")
        viewModel.onConfirmarChange("otra")
        viewModel.restablecer()

        val estado = viewModel.state.value
        assertEquals(
            "Debe incluir: mínimo 8 caracteres, una mayúscula, un número.",
            estado.errorContrasena
        )
        assertEquals("Las contraseñas no coinciden.", estado.errorConfirmar)
        assertEquals(0, repositorio.llamadasRestablecer)
    }

    @Test
    fun `restablecer exitoso marca la recuperacion como completada`() = runTest {
        val viewModel = viewModelEnPasoDeCodigo()

        viewModel.onCodigoChange("123456")
        viewModel.onContrasenaChange("Segura123")
        viewModel.onConfirmarChange("Segura123")
        viewModel.restablecer()

        val estado = viewModel.state.value
        assertTrue(estado.recuperacionCompletada)
        assertFalse(estado.cargando)
        assertNull(estado.errorGeneral)
        assertEquals(1, repositorio.llamadasRestablecer)
    }

    @Test
    fun `fallo al restablecer no marca la recuperacion como completada`() = runTest {
        repositorio.fallaRestablecer = IOException("sin red")
        val viewModel = viewModelEnPasoDeCodigo()

        viewModel.onCodigoChange("123456")
        viewModel.onContrasenaChange("Segura123")
        viewModel.onConfirmarChange("Segura123")
        viewModel.restablecer()

        val estado = viewModel.state.value
        assertFalse(estado.recuperacionCompletada)
        assertEquals("No se pudo conectar. Revisa tu conexión.", estado.errorGeneral)
    }

    @Test
    fun `volver al paso de solicitud limpia codigo y errores`() = runTest {
        val viewModel = viewModelEnPasoDeCodigo()

        viewModel.onCodigoChange("123")
        viewModel.restablecer()
        viewModel.volverPaso()

        val estado = viewModel.state.value
        assertEquals(PasoRecuperacion.SOLICITUD, estado.paso)
        assertEquals("", estado.codigo)
        assertNull(estado.errorCodigo)
        assertNull(estado.errorGeneral)
    }

    private fun viewModelEnPasoDeCodigo(): RecuperarViewModel {
        val viewModel = RecuperarViewModel(repositorio)
        viewModel.onCorreoChange("diego@correo.com")
        viewModel.solicitarCodigo()
        return viewModel
    }
}

private class RepositorioFalso : AuthRepository {

    var llamadasRecuperacion = 0
    var llamadasRestablecer = 0
    var fallaRecuperacion: Exception? = null
    var fallaRestablecer: Exception? = null

    override suspend fun iniciarSesion(correo: String, contrasena: String): Result<Unit> =
        Result.success(Unit)

    override suspend fun solicitarRecuperacion(correo: String): Result<String?> {
        llamadasRecuperacion++
        val falla = fallaRecuperacion
        return if (falla != null) Result.failure(falla) else Result.success("123456")
    }

    override suspend fun restablecerContrasenia(
        correo: String,
        codigo: String,
        contrasena: String
    ): Result<Unit> {
        llamadasRestablecer++
        val falla = fallaRestablecer
        return if (falla != null) Result.failure(falla) else Result.success(Unit)
    }

    override suspend fun cambiarContrasenia(actual: String, nueva: String): Result<Unit> =
        Result.success(Unit)

    override suspend fun desactivarCuenta(contrasena: String): Result<Unit> =
        Result.success(Unit)

    override suspend fun eliminarCuenta(contrasena: String): Result<Unit> =
        Result.success(Unit)

    override suspend fun cerrarSesion() = Unit

    override fun haySesion(): Boolean = false
}
