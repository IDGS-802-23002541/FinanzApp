package com.finanzap.features.auth.ui.cuenta

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
class CambiarContrasenaViewModelTest {

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
    fun `actual vacia no llama a la api`() = runTest {
        val viewModel = CambiarContrasenaViewModel(repositorio)

        viewModel.onNuevaChange("Nueva123")
        viewModel.onConfirmarChange("Nueva123")
        viewModel.guardar()

        assertEquals("Ingresa tu contraseña actual.", viewModel.state.value.errorActual)
        assertEquals(0, repositorio.llamadasCambiar)
    }

    @Test
    fun `nueva igual a la actual no llama a la api`() = runTest {
        val viewModel = CambiarContrasenaViewModel(repositorio)

        viewModel.onActualChange("Actual123")
        viewModel.onNuevaChange("Actual123")
        viewModel.onConfirmarChange("Actual123")
        viewModel.guardar()

        assertEquals(
            "La nueva contraseña debe ser distinta de la actual.",
            viewModel.state.value.errorNueva
        )
        assertEquals(0, repositorio.llamadasCambiar)
    }

    @Test
    fun `nueva debil no llama a la api`() = runTest {
        val viewModel = CambiarContrasenaViewModel(repositorio)

        viewModel.onActualChange("Actual123")
        viewModel.onNuevaChange("corta")
        viewModel.onConfirmarChange("corta")
        viewModel.guardar()

        val error = viewModel.state.value.errorNueva
        assertTrue(error != null && error.startsWith("Debe incluir:"))
        assertEquals(0, repositorio.llamadasCambiar)
    }

    @Test
    fun `confirmacion distinta no llama a la api`() = runTest {
        val viewModel = CambiarContrasenaViewModel(repositorio)

        viewModel.onActualChange("Actual123")
        viewModel.onNuevaChange("Nueva123")
        viewModel.onConfirmarChange("Otra123")
        viewModel.guardar()

        assertEquals("Las contraseñas no coinciden.", viewModel.state.value.errorConfirmar)
        assertEquals(0, repositorio.llamadasCambiar)
    }

    @Test
    fun `cambio exitoso marca el cambio como completado`() = runTest {
        val viewModel = CambiarContrasenaViewModel(repositorio)

        viewModel.onActualChange("Actual123")
        viewModel.onNuevaChange("Nueva123")
        viewModel.onConfirmarChange("Nueva123")
        viewModel.guardar()

        val estado = viewModel.state.value
        assertTrue(estado.cambioCompletado)
        assertFalse(estado.guardando)
        assertNull(estado.errorGeneral)
        assertEquals(1, repositorio.llamadasCambiar)
    }

    @Test
    fun `fallo de la api no marca el cambio como completado`() = runTest {
        repositorio.falla = IOException("sin red")
        val viewModel = CambiarContrasenaViewModel(repositorio)

        viewModel.onActualChange("Actual123")
        viewModel.onNuevaChange("Nueva123")
        viewModel.onConfirmarChange("Nueva123")
        viewModel.guardar()

        val estado = viewModel.state.value
        assertFalse(estado.cambioCompletado)
        assertEquals("No se pudo conectar. Revisa tu conexión.", estado.errorGeneral)
    }
}

private class RepositorioFalso : AuthRepository {

    var llamadasCambiar = 0
    var falla: Exception? = null

    override suspend fun iniciarSesion(correo: String, contrasena: String): Result<Unit> =
        Result.success(Unit)

    override suspend fun solicitarRecuperacion(correo: String): Result<String?> =
        Result.success(null)

    override suspend fun restablecerContrasenia(
        correo: String,
        codigo: String,
        contrasena: String
    ): Result<Unit> = Result.success(Unit)

    override suspend fun cambiarContrasenia(actual: String, nueva: String): Result<Unit> {
        llamadasCambiar++
        val error = falla
        return if (error != null) Result.failure(error) else Result.success(Unit)
    }

    override suspend fun cerrarSesion() = Unit

    override fun haySesion(): Boolean = false
}
