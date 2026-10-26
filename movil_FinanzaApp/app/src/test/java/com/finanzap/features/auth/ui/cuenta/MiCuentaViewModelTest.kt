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
class MiCuentaViewModelTest {

    private val repositorio = RepositorioCuentaFalso()

    @Before
    fun preparar() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @After
    fun limpiar() {
        Dispatchers.resetMain()
    }

    @Test
    fun `confirmar sin contrasena no llama a la api`() = runTest {
        val viewModel = MiCuentaViewModel(repositorio)

        viewModel.onPedirAccion(AccionCuenta.DESACTIVAR)
        viewModel.confirmarAccion()

        assertEquals(
            "Ingresa tu contraseña para confirmar.",
            viewModel.state.value.errorContrasena
        )
        assertEquals(0, repositorio.llamadasDesactivar)
    }

    @Test
    fun `desactivar exitosa cierra la cuenta`() = runTest {
        val viewModel = MiCuentaViewModel(repositorio)

        viewModel.onPedirAccion(AccionCuenta.DESACTIVAR)
        viewModel.onContrasenaChange("Actual123")
        viewModel.confirmarAccion()

        val estado = viewModel.state.value
        assertTrue(estado.cuentaCerrada)
        assertFalse(estado.procesando)
        assertEquals(1, repositorio.llamadasDesactivar)
        assertEquals(0, repositorio.llamadasEliminar)
    }

    @Test
    fun `eliminar exitosa cierra la cuenta`() = runTest {
        val viewModel = MiCuentaViewModel(repositorio)

        viewModel.onPedirAccion(AccionCuenta.ELIMINAR)
        viewModel.onContrasenaChange("Actual123")
        viewModel.confirmarAccion()

        val estado = viewModel.state.value
        assertTrue(estado.cuentaCerrada)
        assertEquals(1, repositorio.llamadasEliminar)
        assertEquals(0, repositorio.llamadasDesactivar)
    }

    @Test
    fun `fallo de la api no cierra la cuenta`() = runTest {
        repositorio.falla = IOException("sin red")
        val viewModel = MiCuentaViewModel(repositorio)

        viewModel.onPedirAccion(AccionCuenta.ELIMINAR)
        viewModel.onContrasenaChange("Actual123")
        viewModel.confirmarAccion()

        val estado = viewModel.state.value
        assertFalse(estado.cuentaCerrada)
        assertEquals("No se pudo conectar. Revisa tu conexión.", estado.errorGeneral)
    }

    @Test
    fun `cancelar limpia la accion pendiente`() = runTest {
        val viewModel = MiCuentaViewModel(repositorio)

        viewModel.onPedirAccion(AccionCuenta.DESACTIVAR)
        viewModel.onContrasenaChange("Actual123")
        viewModel.onCancelarAccion()

        val estado = viewModel.state.value
        assertEquals(AccionCuenta.NINGUNA, estado.accion)
        assertEquals("", estado.contrasena)
        assertNull(estado.errorGeneral)
    }
}
