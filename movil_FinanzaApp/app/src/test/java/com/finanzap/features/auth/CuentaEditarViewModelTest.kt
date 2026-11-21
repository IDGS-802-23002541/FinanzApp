package com.finanzap.features.auth

import com.finanzap.features.auth.data.AuthRepository
import com.finanzap.features.auth.data.PreferenciasNotificacion
import com.finanzap.features.auth.ui.CuentaEditarEvento
import com.finanzap.features.auth.ui.CuentaEditarViewModel
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
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Before
import org.junit.Test
import retrofit2.HttpException
import retrofit2.Response

@OptIn(ExperimentalCoroutinesApi::class)
class CuentaEditarViewModelTest {

    private val repositorio = RepositorioEdicionFalso()

    @Before
    fun preparar() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @After
    fun limpiar() {
        Dispatchers.resetMain()
    }

    @Test
    fun `nombre vacio no envia la cuenta`() = runTest {
        val viewModel = CuentaEditarViewModel(repositorio)

        viewModel.onNombreChange("   ")
        viewModel.guardar()

        assertEquals(
            "El nombre de usuario es obligatorio.",
            viewModel.state.value.errorNombre
        )
        assertEquals(0, repositorio.llamadasEditar)
    }

    @Test
    fun `guardar envia los datos escritos`() = runTest {
        val viewModel = CuentaEditarViewModel(repositorio)

        viewModel.onNombreChange(" Diego ")
        viewModel.onApaternoChange("Borja")
        viewModel.onAmaternoChange("Romero")
        viewModel.onCorreoChange("diego@correo.com")
        viewModel.guardar()

        assertEquals(1, repositorio.llamadasEditar)
        assertEquals("Diego", repositorio.nombreEnviado)
        assertEquals("Borja", repositorio.apaternoEnviado)
        assertEquals("Romero", repositorio.amaternoEnviado)
        assertEquals("diego@correo.com", repositorio.correoEnviado)
        assertEquals(CuentaEditarEvento.CuentaActualizada, viewModel.eventos.first())
    }

    @Test
    fun `correo ya registrado muestra el error de la api`() = runTest {
        repositorio.falla = errorHttp(409, """{"mensaje":"El correo ya está registrado."}""")
        val viewModel = CuentaEditarViewModel(repositorio)

        viewModel.onNombreChange("Diego")
        viewModel.guardar()

        assertEquals("El correo ya está registrado.", viewModel.state.value.errorGeneral)
        assertFalse(viewModel.state.value.guardando)
        assertNull(withTimeoutOrNull(100) { viewModel.eventos.first() })
    }
}

private fun errorHttp(codigo: Int, cuerpo: String): HttpException =
    HttpException(
        Response.error<Unit>(
            codigo,
            cuerpo.toResponseBody("application/json".toMediaType())
        )
    )

private class RepositorioEdicionFalso : AuthRepository {

    var llamadasEditar = 0
    var falla: Exception? = null
    var nombreEnviado: String? = null
    var apaternoEnviado: String? = null
    var amaternoEnviado: String? = null
    var correoEnviado: String? = null

    override suspend fun editarCuenta(
        nombreUsuario: String,
        apaterno: String,
        amaterno: String,
        correo: String
    ): Result<Unit> {
        llamadasEditar++
        nombreEnviado = nombreUsuario
        apaternoEnviado = apaterno
        amaternoEnviado = amaterno
        correoEnviado = correo
        val error = falla
        return if (error != null) Result.failure(error) else Result.success(Unit)
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

    override suspend fun obtenerPreferencias(): Result<PreferenciasNotificacion> =
        Result.failure(UnsupportedOperationException())

    override suspend fun guardarPreferencias(
        movimientos: Boolean,
        sistema: Boolean,
        pagos: Boolean
    ): Result<PreferenciasNotificacion> = Result.failure(UnsupportedOperationException())

    override suspend fun cerrarSesion() = Unit

    override fun haySesion(): Boolean = false
}
