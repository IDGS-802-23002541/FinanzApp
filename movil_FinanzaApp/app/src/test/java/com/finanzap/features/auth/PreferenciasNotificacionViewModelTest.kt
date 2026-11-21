package com.finanzap.features.auth

import com.finanzap.features.auth.data.AuthRepository
import com.finanzap.features.auth.data.PreferenciasNotificacion
import com.finanzap.features.auth.ui.PreferenciasNotificacionEvento
import com.finanzap.features.auth.ui.PreferenciasNotificacionViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import retrofit2.HttpException
import retrofit2.Response

@OptIn(ExperimentalCoroutinesApi::class)
class PreferenciasNotificacionViewModelTest {

    private val repositorio = RepositorioPreferenciasFalso()

    @Before
    fun preparar() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @After
    fun limpiar() {
        Dispatchers.resetMain()
    }

    @Test
    fun `carga los tres interruptores`() = runTest {
        repositorio.preferencias = PreferenciasNotificacion(
            movimientos = false,
            sistema = true,
            pagos = false
        )
        val viewModel = PreferenciasNotificacionViewModel(repositorio)

        viewModel.cargar()

        val estado = viewModel.state.value
        assertFalse(estado.cargando)
        assertFalse(estado.movimientos)
        assertTrue(estado.sistema)
        assertFalse(estado.pagos)
    }

    @Test
    fun `guardar envia el interruptor cambiado`() = runTest {
        val viewModel = PreferenciasNotificacionViewModel(repositorio)
        viewModel.cargar()

        viewModel.onMovimientosChange(false)
        viewModel.guardar()

        assertEquals(1, repositorio.llamadasGuardar)
        assertFalse(repositorio.movimientosGuardado)
        assertTrue(repositorio.sistemaGuardado)
        assertTrue(repositorio.pagosGuardado)
        assertEquals(
            PreferenciasNotificacionEvento.PreferenciasGuardadas,
            viewModel.eventos.first()
        )
    }

    @Test
    fun `error de la api al guardar muestra el mensaje`() = runTest {
        repositorio.fallaGuardar = errorHttp(
            400,
            """{"mensaje":"No se envió ninguna preferencia."}"""
        )
        val viewModel = PreferenciasNotificacionViewModel(repositorio)
        viewModel.cargar()

        viewModel.guardar()

        assertEquals(
            "No se envió ninguna preferencia.",
            viewModel.state.value.errorGuardado
        )
        assertFalse(viewModel.state.value.guardando)
    }
}

private fun errorHttp(codigo: Int, cuerpo: String): HttpException =
    HttpException(
        Response.error<Unit>(
            codigo,
            cuerpo.toResponseBody("application/json".toMediaType())
        )
    )

private class RepositorioPreferenciasFalso : AuthRepository {

    var preferencias = PreferenciasNotificacion(
        movimientos = true,
        sistema = true,
        pagos = true
    )
    var llamadasGuardar = 0
    var fallaGuardar: Exception? = null
    var movimientosGuardado = false
    var sistemaGuardado = false
    var pagosGuardado = false

    override suspend fun obtenerPreferencias(): Result<PreferenciasNotificacion> =
        Result.success(preferencias)

    override suspend fun guardarPreferencias(
        movimientos: Boolean,
        sistema: Boolean,
        pagos: Boolean
    ): Result<PreferenciasNotificacion> {
        llamadasGuardar++
        movimientosGuardado = movimientos
        sistemaGuardado = sistema
        pagosGuardado = pagos
        val error = fallaGuardar
        return if (error != null) {
            Result.failure(error)
        } else {
            Result.success(
                PreferenciasNotificacion(
                    movimientos = movimientos,
                    sistema = sistema,
                    pagos = pagos
                )
            )
        }
    }

    override suspend fun iniciarSesion(correo: String, contrasena: String): Result<Unit> =
        Result.failure(UnsupportedOperationException())

    override suspend fun solicitarRecuperacion(correo: String): Result<String?> =
        Result.failure(UnsupportedOperationException())

    override suspend fun restablecerContrasenia(
        correo: String,
        codigo: String,
        contrasena: String
    ): Result<Unit> = Result.failure(UnsupportedOperationException())

    override suspend fun cambiarContrasenia(actual: String, nueva: String): Result<Unit> =
        Result.failure(UnsupportedOperationException())

    override suspend fun desactivarCuenta(contrasena: String): Result<Unit> =
        Result.failure(UnsupportedOperationException())

    override suspend fun eliminarCuenta(contrasena: String): Result<Unit> =
        Result.failure(UnsupportedOperationException())

    override suspend fun editarCuenta(
        nombreUsuario: String,
        apaterno: String,
        amaterno: String,
        correo: String
    ): Result<Unit> = Result.failure(UnsupportedOperationException())

    override suspend fun cerrarSesion() = Unit

    override fun haySesion(): Boolean = false
}
