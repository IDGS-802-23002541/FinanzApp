package com.finanzap.features.carteras.ui.dashboard

import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.carteras.model.Cartera
import com.finanzap.features.carteras.model.RolEnCartera
import com.finanzap.features.carteras.model.TipoCartera
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
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class CarterasViewModelTest {

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
    fun `cargar separa propias y compartidas`() = runTest {
        val viewModel = CarterasViewModel(repositorio)

        viewModel.cargar()

        val estado = viewModel.state.value
        assertFalse(estado.cargando)
        assertEquals(2, estado.totalMis)
        assertEquals(1, estado.totalCompartidas)
        assertEquals(2, estado.carteras.size)
    }

    @Test
    fun `segmento compartidas muestra solo colaboraciones`() = runTest {
        val viewModel = CarterasViewModel(repositorio)
        viewModel.cargar()

        viewModel.onSegmentoChange(Segmento.COMPARTIDAS)

        assertEquals(listOf(3), viewModel.state.value.carteras.map { it.id })
    }

    @Test
    fun `filtro por tipo reduce la lista`() = runTest {
        val viewModel = CarterasViewModel(repositorio)
        viewModel.cargar()

        viewModel.onTipoChange(TipoCartera.HOGAR)

        assertEquals(listOf(1), viewModel.state.value.carteras.map { it.id })
    }

    @Test
    fun `busqueda ignora mayusculas`() = runTest {
        val viewModel = CarterasViewModel(repositorio)
        viewModel.cargar()

        viewModel.onBusquedaChange("viaJ")

        assertEquals(listOf(2), viewModel.state.value.carteras.map { it.id })
    }

    @Test
    fun `fallo de la api muestra error con reintento`() = runTest {
        repositorio.falla = IOException("sin red")
        val viewModel = CarterasViewModel(repositorio)

        viewModel.cargar()

        val estado = viewModel.state.value
        assertFalse(estado.cargando)
        assertEquals("No se pudieron cargar tus carteras.", estado.error)
    }
}

private class RepositorioFalso : CarterasRepository {

    var falla: Exception? = null

    override suspend fun carteras(): Result<List<Cartera>> {
        val error = falla
        if (error != null) return Result.failure(error)
        return Result.success(
            listOf(
                Cartera(id = 1, nombre = "Casa", tipo = TipoCartera.HOGAR, rol = RolEnCartera.PROPIETARIO),
                Cartera(id = 2, nombre = "Viaje", tipo = TipoCartera.VIAJE, rol = RolEnCartera.PROPIETARIO),
                Cartera(id = 3, nombre = "Fiesta", tipo = TipoCartera.EVENTO, rol = RolEnCartera.COLABORADOR)
            )
        )
    }

    override suspend fun carterasConFiltros(
        estado: String?,
        tipo: String?,
        rol: String?,
        busqueda: String?
    ): Result<List<Cartera>> = carteras()

    override suspend fun crear(
        nombre: String,
        tipo: TipoCartera,
        descripcion: String?,
        presupuestoInicial: Double,
        fechaInicio: String?,
        fechaFin: String?
    ): Result<Cartera> = Result.failure(UnsupportedOperationException())
}
