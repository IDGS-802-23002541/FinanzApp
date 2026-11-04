package com.finanzap.features.transacciones.ui

import com.finanzap.features.transacciones.Categoria
import com.finanzap.features.transacciones.PaginaTransacciones
import com.finanzap.features.transacciones.TipoTransaccion
import com.finanzap.features.transacciones.Transaccion
import com.finanzap.features.transacciones.data.CategoriasRepository
import com.finanzap.features.transacciones.data.TransaccionesRepository
import java.io.IOException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
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
class RegistrarTransaccionViewModelTest {

    private val transacciones = RepositorioTransaccionesFalso()
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
    fun `guardar sin datos muestra errores y no llama a la api`() = runTest {
        val viewModel = viewModel()

        viewModel.guardar()

        val estado = viewModel.state.value
        assertEquals("Elige si es ingreso o gasto.", estado.errorTipo)
        assertEquals("Ingresa el monto.", estado.errorMonto)
        assertEquals(0, transacciones.llamadasCrear)
    }

    @Test
    fun `gasto exitoso emite evento`() = runTest {
        val viewModel = viewModel()
        viewModel.onTipoChange(TipoTransaccion.GASTO)
        viewModel.onMontoChange("100")
        viewModel.onCategoriaChange(Categoria(1, 7, "Alimentos", "GASTO", 1, "ACTIVA"))

        viewModel.guardar()

        assertEquals(TransaccionEvento.Guardada, viewModel.eventos.first())
        assertEquals(1, transacciones.llamadasCrear)
        assertEquals(1, transacciones.categoriaId)
        assertFalse(viewModel.state.value.guardando)
    }

    @Test
    fun `crear categoria la agrega y selecciona`() = runTest {
        val viewModel = viewModel()

        viewModel.crearCategoria("Servicio de internet")

        val estado = viewModel.state.value
        assertEquals(1, estado.categorias.size)
        assertEquals("Servicio de internet", estado.categoria?.nombre)
    }

    @Test
    fun `fallo al guardar muestra error general`() = runTest {
        transacciones.falla = IOException("sin red")
        val viewModel = viewModel()
        viewModel.onTipoChange(TipoTransaccion.INGRESO)
        viewModel.onMontoChange("100")

        viewModel.guardar()

        assertEquals(
            "No se pudo conectar. Revisa tu conexión.",
            viewModel.state.value.errorGeneral
        )
    }

    private fun viewModel(): RegistrarTransaccionViewModel {
        val viewModel = RegistrarTransaccionViewModel(transacciones, categorias)
        viewModel.iniciar(7)
        return viewModel
    }
}

private class RepositorioTransaccionesFalso : TransaccionesRepository {

    var llamadasCrear = 0
    var categoriaId: Int? = null
    var falla: Exception? = null

    override suspend fun listar(
        idCartera: Int,
        pagina: Int,
        porPagina: Int,
        periodoId: Int?
    ): Result<PaginaTransacciones> = Result.success(
        PaginaTransacciones(emptyList(), 1, 1, 0, 0.0, 0.0, 0.0)
    )

    override suspend fun crear(
        idCartera: Int,
        tipo: TipoTransaccion,
        monto: Double,
        fecha: String,
        categoriaId: Int?,
        descripcion: String?
    ): Result<Transaccion> {
        llamadasCrear++
        this.categoriaId = categoriaId
        falla?.let { return Result.failure(it) }
        return Result.success(
            Transaccion(
                id = 1,
                carteraId = idCartera,
                tipo = tipo,
                monto = monto,
                descripcion = descripcion,
                categoria = null,
                autor = null,
                fecha = fecha,
                metodoPago = null
            )
        )
    }
}

private class RepositorioCategoriasFalso : CategoriasRepository {

    override suspend fun crear(idCartera: Int, nombre: String): Result<Categoria> =
        Result.success(
            Categoria(
                id = 10,
                carteraId = idCartera,
                nombre = nombre,
                tipo = "AMBOS",
                orden = 1,
                estado = "ACTIVA"
            )
        )
}
