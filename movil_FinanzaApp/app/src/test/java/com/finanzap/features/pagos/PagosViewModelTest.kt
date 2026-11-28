package com.finanzap.features.pagos

import com.finanzap.R
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.pagos.data.ListadoPagos
import com.finanzap.features.pagos.data.PagoRecurrente
import com.finanzap.features.pagos.data.PagosRepository
import com.finanzap.features.pagos.ui.PagosViewModel
import com.finanzap.features.transacciones.Categoria
import com.finanzap.features.transacciones.data.CategoriasRepository
import java.io.IOException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import retrofit2.HttpException
import retrofit2.Response

@OptIn(ExperimentalCoroutinesApi::class)
class PagosViewModelTest {

    private val repositorio = RepositorioPagosFalso()
    private val categorias = RepositorioCategoriasFalso()

    @Before
    fun preparar() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @After
    fun limpiar() {
        Dispatchers.resetMain()
    }

    @Test
    fun `cargar deja los pagos en el estado`() = runTest {
        val viewModel = PagosViewModel(repositorio, categorias)

        viewModel.cargar(7)

        val estado = viewModel.state.value
        assertFalse(estado.cargando)
        assertNull(estado.error)
        assertEquals(1, estado.pagos.size)
        assertEquals("Renta", estado.pagos.first().nombre)
    }

    @Test
    fun `sin pagos el listado queda vacio`() = runTest {
        repositorio.pagos = mutableListOf()
        val viewModel = PagosViewModel(repositorio, categorias)

        viewModel.cargar(7)

        val estado = viewModel.state.value
        assertFalse(estado.cargando)
        assertNull(estado.error)
        assertTrue(estado.pagos.isEmpty())
    }

    @Test
    fun `fallo de la api al listar muestra el mensaje`() = runTest {
        repositorio.fallaListar = IOException("sin red")
        val viewModel = PagosViewModel(repositorio, categorias)

        viewModel.cargar(7)

        val estado = viewModel.state.value
        assertFalse(estado.cargando)
        assertEquals("No se pudo conectar. Revisa tu conexión.", estado.error)
    }

    @Test
    fun `crear un pago lo agrega y cierra el formulario`() = runTest {
        val viewModel = PagosViewModel(repositorio, categorias)
        viewModel.cargar(7)
        viewModel.abrirFormulario()
        viewModel.onNombreChange("Internet")
        viewModel.onMontoChange("650")

        viewModel.guardar()

        val estado = viewModel.state.value
        assertFalse(estado.formularioAbierto)
        assertFalse(estado.guardando)
        assertNull(estado.errorFormulario)
        assertEquals(2, estado.pagos.size)
        assertEquals("Internet", estado.pagos.first().nombre)
    }

    @Test
    fun `crear sin nombre muestra el error de validacion`() = runTest {
        val viewModel = PagosViewModel(repositorio, categorias)
        viewModel.cargar(7)
        viewModel.abrirFormulario()
        viewModel.onMontoChange("650")

        viewModel.guardar()

        val estado = viewModel.state.value
        assertEquals(R.string.pagos_error_nombre, estado.errorNombre)
        assertTrue(estado.formularioAbierto)
        assertEquals(1, repositorio.pagos.size)
    }

    @Test
    fun `editar un pago cambia sus datos`() = runTest {
        val viewModel = PagosViewModel(repositorio, categorias)
        viewModel.cargar(7)
        viewModel.abrirEdicion(repositorio.pagos.first())
        viewModel.onNombreChange("Renta nueva")
        viewModel.onMontoChange("1800")

        viewModel.guardar()

        val estado = viewModel.state.value
        assertFalse(estado.formularioAbierto)
        assertEquals("Renta nueva", estado.pagos.first().nombre)
        assertEquals(1800.0, estado.pagos.first().monto, 0.0)
    }

    @Test
    fun `cancelar un pago lo deja cancelado`() = runTest {
        val viewModel = PagosViewModel(repositorio, categorias)
        viewModel.cargar(7)

        viewModel.cancelar(repositorio.pagos.first().id)

        val estado = viewModel.state.value
        assertFalse(estado.cancelando)
        assertNull(estado.errorCancelar)
        assertEquals("CANCELADO", estado.pagos.first().estado)
    }

    @Test
    fun `marcar como hecho registra la ejecucion`() = runTest {
        val viewModel = PagosViewModel(repositorio, categorias)
        viewModel.cargar(7)

        viewModel.marcarHecho(repositorio.pagos.first())

        val estado = viewModel.state.value
        assertNull(estado.marcandoHechoId)
        assertNull(estado.errorMarcarHecho)
        assertEquals(listOf(3), repositorio.marcadosHecho)
    }

    @Test
    fun `crear un pago envia la categoria elegida`() = runTest {
        val viewModel = PagosViewModel(repositorio, categorias)
        viewModel.cargar(7)
        viewModel.abrirFormulario()
        viewModel.onCategoriaChange(categorias.categorias.first())
        viewModel.onNombreChange("Internet")
        viewModel.onMontoChange("650")

        viewModel.guardar()

        assertEquals(1, repositorio.ultimaCategoriaId)
        assertEquals(1, viewModel.state.value.pagos.first().categoriaId)
    }

    @Test
    fun `marcar como hecho con conflicto 409 muestra el mensaje de la api`() = runTest {
        repositorio.fallaMarcarHecho = errorHttp(
            409,
            """{"ok": false, "mensaje": "Ese pago ya fue marcado como realizado."}"""
        )
        val viewModel = PagosViewModel(repositorio, categorias)
        viewModel.cargar(7)

        viewModel.marcarHecho(repositorio.pagos.first())

        val estado = viewModel.state.value
        assertNull(estado.marcandoHechoId)
        assertEquals("Ese pago ya fue marcado como realizado.", estado.errorMarcarHecho)
        assertTrue(repositorio.marcadosHecho.isEmpty())
    }
}

private class RepositorioPagosFalso : PagosRepository {

    var fallaListar: Exception? = null
    var fallaMarcarHecho: Exception? = null
    var pagos: MutableList<PagoRecurrente> = mutableListOf(pagoEjemplo())
    val marcadosHecho = mutableListOf<Int>()
    var ultimaCategoriaId: Int? = null

    override suspend fun listar(
        carteraId: Int,
        pagina: Int,
        porPagina: Int
    ): Result<ListadoPagos> {
        val error = fallaListar
        if (error != null) {
            return Result.failure(
                Exception(mensajeErrorApi(error, "No se pudieron cargar los pagos recurrentes."))
            )
        }
        return Result.success(
            ListadoPagos(
                pagos = pagos.toList(),
                pagina = pagina,
                totalPaginas = 1
            )
        )
    }

    override suspend fun crear(
        carteraId: Int,
        nombre: String,
        monto: Double,
        frecuencia: String,
        fechaInicio: String,
        fechaFin: String?,
        descripcion: String?,
        categoriaId: Int?
    ): Result<PagoRecurrente> {
        ultimaCategoriaId = categoriaId
        val pago = PagoRecurrente(
            id = 9,
            carteraId = carteraId,
            categoriaId = categoriaId,
            nombre = nombre,
            descripcion = descripcion,
            monto = monto,
            frecuencia = frecuencia,
            fechaInicio = fechaInicio,
            fechaFin = fechaFin,
            proximaEjecucion = "2026-12-01",
            ultimaEjecucion = null,
            estado = "ACTIVO"
        )
        pagos.add(0, pago)
        return Result.success(pago)
    }

    override suspend fun actualizar(
        idPago: Int,
        nombre: String,
        monto: Double,
        frecuencia: String,
        fechaInicio: String,
        fechaFin: String?,
        descripcion: String?,
        categoriaId: Int?
    ): Result<PagoRecurrente> {
        ultimaCategoriaId = categoriaId
        val actualizado = pagos.first { it.id == idPago }.copy(
            nombre = nombre,
            monto = monto,
            frecuencia = frecuencia,
            fechaInicio = fechaInicio,
            fechaFin = fechaFin,
            descripcion = descripcion,
            categoriaId = categoriaId
        )
        pagos.replaceAll { if (it.id == idPago) actualizado else it }
        return Result.success(actualizado)
    }

    override suspend fun cancelar(idPago: Int): Result<PagoRecurrente> {
        val cancelado = pagos.first { it.id == idPago }.copy(estado = "CANCELADO")
        pagos.replaceAll { if (it.id == idPago) cancelado else it }
        return Result.success(cancelado)
    }

    override suspend fun marcarHecho(idPago: Int, fechaProgramada: String?): Result<Unit> {
        val error = fallaMarcarHecho
        if (error != null) {
            return Result.failure(
                Exception(mensajeErrorApi(error, "No se pudo registrar el pago como realizado."))
            )
        }
        marcadosHecho.add(idPago)
        return Result.success(Unit)
    }
}

private fun pagoEjemplo() = PagoRecurrente(
    id = 3,
    carteraId = 7,
    categoriaId = 1,
    nombre = "Renta",
    descripcion = "Renta del depa",
    monto = 1500.0,
    frecuencia = "MENSUAL",
    fechaInicio = "2026-11-01",
    fechaFin = null,
    proximaEjecucion = "2026-12-01",
    ultimaEjecucion = null,
    estado = "ACTIVO"
)

private fun errorHttp(codigo: Int, cuerpo: String): HttpException =
    HttpException(
        Response.error<Unit>(
            codigo,
            cuerpo.toResponseBody("application/json".toMediaType())
        )
    )

private class RepositorioCategoriasFalso : CategoriasRepository {

    val categorias = listOf(
        Categoria(
            id = 1,
            carteraId = 7,
            nombre = "Servicios",
            tipo = "GASTO",
            orden = 1,
            estado = "ACTIVO"
        )
    )

    override suspend fun listar(
        idCartera: Int,
        tipo: String?
    ): Result<List<Categoria>> = Result.success(categorias)

    override suspend fun crear(idCartera: Int, nombre: String): Result<Categoria> =
        Result.success(
            Categoria(
                id = 2,
                carteraId = idCartera,
                nombre = nombre,
                tipo = "GASTO",
                orden = 2,
                estado = "ACTIVO"
            )
        )
}
