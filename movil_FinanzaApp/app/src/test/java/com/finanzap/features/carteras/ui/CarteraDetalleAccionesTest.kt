package com.finanzap.features.carteras.ui

import com.finanzap.features.carteras.Cartera
import com.finanzap.features.carteras.CarteraDetalle
import com.finanzap.features.carteras.PeriodoCartera
import com.finanzap.features.carteras.ResumenCartera
import com.finanzap.features.carteras.RolEnCartera
import com.finanzap.features.carteras.SeriesCartera
import com.finanzap.features.carteras.TipoCartera
import com.finanzap.features.carteras.BalanceCierre
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
class CarteraDetalleAccionesTest {

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

    @Test
    fun `inactivar marca la cartera como inactiva`() = runTest {
        val viewModel = CarteraDetalleViewModel(carteras, invitaciones)

        viewModel.inactivar(7)

        assertEquals(7, carteras.ultimaInactivacion)
        assertTrue(viewModel.state.value.inactivada)
        assertFalse(viewModel.state.value.inactivando)
        assertNull(viewModel.state.value.errorInactivar)
    }

    @Test
    fun `error al inactivar muestra mensaje y no marca la cartera`() = runTest {
        carteras.fallaInactivar = IllegalStateException("409")
        val viewModel = CarteraDetalleViewModel(carteras, invitaciones)

        viewModel.inactivar(7)

        assertFalse(viewModel.state.value.inactivada)
        assertFalse(viewModel.state.value.inactivando)
        assertEquals(
            "No se pudo inactivar la cartera.",
            viewModel.state.value.errorInactivar
        )
    }

    @Test
    fun `finalizar guarda el balance y marca el cierre`() = runTest {
        val viewModel = CarteraDetalleViewModel(carteras, invitaciones)

        viewModel.finalizar(7)

        assertEquals(7, carteras.ultimaFinalizacion)
        assertTrue(viewModel.state.value.cierreExitoso)
        assertFalse(viewModel.state.value.finalizando)
        assertEquals(800.0, viewModel.state.value.balance?.balance)
        assertNull(viewModel.state.value.errorFinalizar)
    }

    @Test
    fun `error al finalizar muestra mensaje y no marca el cierre`() = runTest {
        carteras.fallaFinalizar = IllegalStateException("409")
        val viewModel = CarteraDetalleViewModel(carteras, invitaciones)

        viewModel.finalizar(7)

        assertFalse(viewModel.state.value.cierreExitoso)
        assertFalse(viewModel.state.value.finalizando)
        assertEquals(
            "No se pudo cerrar la cartera.",
            viewModel.state.value.errorFinalizar
        )
    }
}

private class RepositorioSalirFalso : CarterasRepository {

    var fallaSalir: Exception? = null
    var ultimaSalida: Int? = null
    var fallaInactivar: Exception? = null
    var ultimaInactivacion: Int? = null
    var fallaFinalizar: Exception? = null
    var ultimaFinalizacion: Int? = null

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

    override suspend fun editar(
        idCartera: Int,
        nombre: String,
        tipo: TipoCartera,
        descripcion: String?,
        presupuestoInicial: Double,
        fechaInicio: String?,
        fechaFin: String?
    ): Result<Cartera> = Result.failure(UnsupportedOperationException())

    override suspend fun inactivar(idCartera: Int): Result<Cartera> {
        ultimaInactivacion = idCartera
        val error = fallaInactivar
        if (error != null) return Result.failure(error)
        return Result.success(
            Cartera(id = idCartera, nombre = "Casa", tipo = TipoCartera.HOGAR, rol = RolEnCartera.PROPIETARIO, estado = "ARCHIVADA")
        )
    }

    override suspend fun finalizar(idCartera: Int): Result<BalanceCierre> {
        ultimaFinalizacion = idCartera
        val error = fallaFinalizar
        if (error != null) return Result.failure(error)
        return Result.success(BalanceCierre(balance = 800.0))
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
