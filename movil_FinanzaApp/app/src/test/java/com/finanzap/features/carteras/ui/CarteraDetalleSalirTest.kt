package com.finanzap.features.carteras.ui

import com.finanzap.features.carteras.Cartera
import com.finanzap.features.carteras.CarteraDetalle
import com.finanzap.features.carteras.PeriodoCartera
import com.finanzap.features.carteras.ResumenCartera
import com.finanzap.features.carteras.RolEnCartera
import com.finanzap.features.carteras.SeriesCartera
import com.finanzap.features.carteras.TipoCartera
import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.carteras.data.InvitacionesRepository
import com.finanzap.features.carteras.Invitacion
import com.finanzap.features.carteras.InvitacionesCartera
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
class CarteraDetalleSalirTest {

    private val carteras = RepositorioSalirFalso()
    private val invitaciones = InvitacionesFalso()

    @Before
    fun preparar() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @After
    fun limpiar() {
        Dispatchers.resetMain()
    }

    @Test
    fun `salir marca la salida como exitosa`() = runTest {
        val viewModel = CarteraDetalleViewModel(carteras, invitaciones)

        viewModel.salir(7)

        assertEquals(7, carteras.ultimaSalida)
        assertTrue(viewModel.state.value.salidaExitosa)
        assertFalse(viewModel.state.value.saliendo)
        assertNull(viewModel.state.value.errorSalir)
    }

    @Test
    fun `error al salir muestra mensaje y no marca salida`() = runTest {
        carteras.fallaSalir = IllegalStateException("409")
        val viewModel = CarteraDetalleViewModel(carteras, invitaciones)

        viewModel.salir(7)

        assertFalse(viewModel.state.value.salidaExitosa)
        assertFalse(viewModel.state.value.saliendo)
        assertEquals(
            "No se pudo salir de la cartera.",
            viewModel.state.value.errorSalir
        )
    }
}

private class RepositorioSalirFalso : CarterasRepository {

    var fallaSalir: Exception? = null
    var ultimaSalida: Int? = null

    override suspend fun carteras(): Result<List<Cartera>> = Result.success(emptyList())

    override suspend fun detalle(
        idCartera: Int,
        periodoId: Int?
    ): Result<CarteraDetalle> = Result.failure(UnsupportedOperationException())

    override suspend fun periodos(idCartera: Int): Result<List<PeriodoCartera>> =
        Result.success(emptyList())

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

    override suspend fun salir(idCartera: Int): Result<Unit> {
        ultimaSalida = idCartera
        val error = fallaSalir
        if (error != null) return Result.failure(error)
        return Result.success(Unit)
    }
}

private class InvitacionesFalso : InvitacionesRepository {

    override suspend fun consultar(idCartera: Int): Result<InvitacionesCartera> =
        Result.success(InvitacionesCartera())

    override suspend fun generar(idCartera: Int): Result<Invitacion> =
        Result.failure(UnsupportedOperationException())

    override suspend fun unirse(codigo: String): Result<Unit> =
        Result.failure(UnsupportedOperationException())
}
