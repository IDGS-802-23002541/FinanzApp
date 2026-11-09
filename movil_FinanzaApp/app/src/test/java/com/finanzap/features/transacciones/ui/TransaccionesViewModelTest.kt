package com.finanzap.features.transacciones.ui

import com.finanzap.features.carteras.Cartera
import com.finanzap.features.carteras.CarteraDetalle
import com.finanzap.features.carteras.PeriodoCartera
import com.finanzap.features.carteras.RolEnCartera
import com.finanzap.features.carteras.TipoCartera
import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.transacciones.PaginaTransacciones
import com.finanzap.features.transacciones.TipoTransaccion
import com.finanzap.features.transacciones.Transaccion
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
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class TransaccionesViewModelTest {

    private val repositorio = RepositorioFalso()
    private val carteras = RepositorioCarterasFalso()

    @Before
    fun preparar() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @After
    fun limpiar() {
        Dispatchers.resetMain()
    }

    @Test
    fun `cargar trae la primera pagina y totales`() = runTest {
        val viewModel = TransaccionesViewModel(repositorio, carteras)

        viewModel.cargar(7)

        val estado = viewModel.state.value
        assertFalse(estado.cargando)
        assertEquals(1, estado.pagina)
        assertEquals(2, estado.totalPaginas)
        assertEquals(1, estado.transacciones.size)
        assertEquals(100.0, estado.totalIngresos, 0.0)
    }

    @Test
    fun `siguiente y anterior cambian de pagina`() = runTest {
        val viewModel = TransaccionesViewModel(repositorio, carteras)
        viewModel.cargar(7)

        viewModel.siguiente()
        assertEquals(2, viewModel.state.value.pagina)
        assertEquals(2, viewModel.state.value.transacciones.first().id)

        viewModel.anterior()
        assertEquals(1, viewModel.state.value.pagina)
    }

    @Test
    fun `fallo de red muestra error`() = runTest {
        repositorio.falla = IOException("sin red")
        val viewModel = TransaccionesViewModel(repositorio, carteras)

        viewModel.cargar(7)

        assertEquals(
            "No se pudo conectar. Revisa tu conexión.",
            viewModel.state.value.error
        )
    }

    @Test
    fun `actualizar emite evento`() = runTest {
        val viewModel = TransaccionesViewModel(repositorio, carteras)
        viewModel.cargar(7)

        viewModel.actualizar(
            idTransaccion = 1,
            tipo = TipoTransaccion.GASTO,
            monto = 150.0,
            fecha = "2026-11-04",
            categoriaId = 1,
            descripcion = "Editada"
        )

        assertEquals(TransaccionesEvento.Actualizada, viewModel.eventos.first())
    }

    @Test
    fun `eliminar emite evento`() = runTest {
        val viewModel = TransaccionesViewModel(repositorio, carteras)
        viewModel.cargar(7)

        viewModel.eliminar(1)

        assertEquals(TransaccionesEvento.Eliminada, viewModel.eventos.first())
    }
}

private class RepositorioCarterasFalso : CarterasRepository {

    override suspend fun carteras(): Result<List<Cartera>> = Result.success(emptyList())

    override suspend fun detalle(
        idCartera: Int,
        periodoId: Int?
    ): Result<CarteraDetalle> = Result.failure(UnsupportedOperationException())

    override suspend fun periodos(idCartera: Int): Result<List<PeriodoCartera>> =
        Result.success(
            listOf(
                PeriodoCartera(
                    id = 1,
                    nombre = "Semana 1",
                    fechaInicio = "2026-11-01",
                    fechaFin = "2026-11-07",
                    estado = "ABIERTO"
                )
            )
        )

    override suspend fun carterasConFiltros(
        estado: String?,
        tipo: String?,
        rol: String?,
        busqueda: String?
    ): Result<List<Cartera>> = Result.success(emptyList())

    override suspend fun crear(
        nombre: String,
        tipo: TipoCartera,
        descripcion: String?,
        presupuestoInicial: Double,
        fechaInicio: String?,
        fechaFin: String?
    ): Result<Cartera> = Result.failure(UnsupportedOperationException())
}

private class RepositorioFalso : TransaccionesRepository {

    var falla: Exception? = null

    override suspend fun listar(
        idCartera: Int,
        pagina: Int,
        porPagina: Int,
        periodoId: Int?
    ): Result<PaginaTransacciones> {
        val error = falla
        if (error != null) return Result.failure(error)
        return Result.success(
            PaginaTransacciones(
                items = listOf(
                    Transaccion(
                        id = pagina,
                        carteraId = idCartera,
                        tipo = TipoTransaccion.GASTO,
                        monto = 50.0,
                        descripcion = "Prueba",
                        categoriaId = 1,
                        categoria = "Alimentos",
                        autor = "Aideé",
                        fecha = "2026-11-03",
                        metodoPago = "EFECTIVO"
                    )
                ),
                pagina = pagina,
                totalPaginas = 2,
                total = 2,
                totalIngresos = 100.0,
                totalGastos = 50.0,
                balance = 50.0
            )
        )
    }

    override suspend fun crear(
        idCartera: Int,
        tipo: TipoTransaccion,
        monto: Double,
        fecha: String,
        categoriaId: Int?,
        descripcion: String?
    ): Result<Transaccion> = Result.success(
        Transaccion(
            id = 1,
            carteraId = idCartera,
            tipo = tipo,
            monto = monto,
            descripcion = descripcion,
            categoriaId = categoriaId,
            categoria = null,
            autor = null,
            fecha = fecha,
            metodoPago = null
        )
    )

    override suspend fun actualizar(
        idTransaccion: Int,
        tipo: TipoTransaccion,
        monto: Double,
        fecha: String,
        categoriaId: Int?,
        descripcion: String?
    ): Result<Transaccion> = Result.success(
        Transaccion(
            id = idTransaccion,
            carteraId = 7,
            tipo = tipo,
            monto = monto,
            descripcion = descripcion,
            categoriaId = categoriaId,
            categoria = null,
            autor = null,
            fecha = fecha,
            metodoPago = null
        )
    )

    override suspend fun eliminar(idTransaccion: Int): Result<Unit> = Result.success(Unit)
}
