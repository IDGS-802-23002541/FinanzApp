package com.finanzap.features.reportes

import com.finanzap.features.carteras.BalanceCierre
import com.finanzap.features.carteras.Cartera
import com.finanzap.features.carteras.CarteraDetalle
import com.finanzap.features.carteras.PeriodoCartera
import com.finanzap.features.carteras.RolEnCartera
import com.finanzap.features.carteras.TipoCartera
import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.reportes.data.FormatoReporte
import com.finanzap.features.reportes.data.FiltrosReporte
import com.finanzap.features.reportes.data.GastoPorCategoria
import com.finanzap.features.reportes.data.GraficasReporte
import com.finanzap.features.reportes.data.IndicadoresReporte
import com.finanzap.features.reportes.data.Reporte
import com.finanzap.features.reportes.data.ReportesRepository
import com.finanzap.features.reportes.data.SerieMensual
import com.finanzap.features.reportes.ui.ReportesViewModel
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
class ReportesViewModelTest {

    private val repositorio = RepositorioReportesFalso()
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
    fun `cargar deja el reporte en el estado`() = runTest {
        val viewModel = ReportesViewModel(repositorio, carteras)

        viewModel.cargar()

        val estado = viewModel.state.value
        val reporte = estado.reporte ?: error("no se cargó el reporte")
        assertFalse(estado.cargando)
        assertNull(estado.error)
        assertTrue(reporte.hayDatos)
        assertEquals(1000.0, reporte.indicadores.totalIngresos, 0.0)
        assertEquals(12, reporte.indicadores.movimientos)
    }

    @Test
    fun `sin datos el reporte queda vacio`() = runTest {
        repositorio.hayDatos = false
        val viewModel = ReportesViewModel(repositorio, carteras)

        viewModel.cargar()

        val estado = viewModel.state.value
        val reporte = estado.reporte ?: error("no se cargó el reporte")
        assertFalse(estado.cargando)
        assertNull(estado.error)
        assertFalse(reporte.hayDatos)
    }

    @Test
    fun `fallo de la api muestra error`() = runTest {
        repositorio.falla = IOException("sin red")
        val viewModel = ReportesViewModel(repositorio, carteras)

        viewModel.cargar()

        val estado = viewModel.state.value
        assertFalse(estado.cargando)
        assertEquals("No se pudo conectar. Revisa tu conexión.", estado.error)
        assertNull(estado.reporte)
    }

    @Test
    fun `la vista previa se pide con los filtros elegidos`() = runTest {
        val viewModel = ReportesViewModel(repositorio, carteras)

        viewModel.seleccionarCartera(7)
        viewModel.seleccionarTipo(TipoCartera.HOGAR)
        viewModel.elegirFechas("2026-11-01", "2026-11-30")
        viewModel.cargar()

        val filtros = repositorio.ultimosFiltros ?: error("no se pidió la vista previa")
        assertEquals(7, filtros.carteraId)
        assertEquals("HOGAR", filtros.tipo)
        assertEquals("2026-11-01", filtros.fechaInicio)
        assertEquals("2026-11-30", filtros.fechaFin)
    }

    @Test
    fun `exportar guarda la ruta del archivo`() = runTest {
        val viewModel = ReportesViewModel(repositorio, carteras)

        viewModel.exportar(FormatoReporte.CSV)

        val estado = viewModel.state.value
        assertFalse(estado.exportando)
        assertNull(estado.errorExportacion)
        assertEquals("/descargas/reporte.csv", estado.archivoGenerado)
    }
}

private class RepositorioReportesFalso : ReportesRepository {

    var falla: Exception? = null
    var hayDatos: Boolean = true
    var ultimosFiltros: FiltrosReporte? = null

    override suspend fun vistaPrevia(filtros: FiltrosReporte): Result<Reporte> {
        ultimosFiltros = filtros
        val error = falla
        if (error != null) return Result.failure(error)

        return Result.success(
            Reporte(
                hayDatos = hayDatos,
                indicadores = IndicadoresReporte(
                    totalIngresos = 1000.0,
                    totalGastos = 400.0,
                    ahorro = 600.0,
                    totalAportes = 1000.0,
                    movimientos = 12
                ),
                graficas = GraficasReporte(
                    gastosPorCategoria = listOf(
                        GastoPorCategoria(categoria = "Alimentos", monto = 400.0, porcentaje = 100.0)
                    ),
                    ingresosVsEgresos = listOf(
                        SerieMensual(periodo = "2026-11", ingresos = 1000.0, gastos = 400.0)
                    )
                )
            )
        )
    }

    override suspend fun exportar(
        filtros: FiltrosReporte,
        formato: FormatoReporte
    ): Result<String> {
        ultimosFiltros = filtros
        val error = falla
        if (error != null) return Result.failure(error)
        return Result.success("/descargas/reporte.${formato.valor}")
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
    ): Result<List<Cartera>> = Result.success(
        listOf(
            Cartera(
                id = 7,
                nombre = "Casa",
                tipo = TipoCartera.HOGAR,
                rol = RolEnCartera.PROPIETARIO
            )
        )
    )

    override suspend fun crear(
        nombre: String,
        tipo: TipoCartera,
        descripcion: String?,
        presupuestoInicial: Double,
        fechaInicio: String?,
        fechaFin: String?
    ): Result<Cartera> = Result.failure(UnsupportedOperationException())

    override suspend fun salir(idCartera: Int): Result<Unit> =
        Result.failure(UnsupportedOperationException())

    override suspend fun editar(
        idCartera: Int,
        nombre: String,
        tipo: TipoCartera,
        descripcion: String?,
        presupuestoInicial: Double,
        fechaInicio: String?,
        fechaFin: String?
    ): Result<Cartera> = Result.failure(UnsupportedOperationException())

    override suspend fun finalizar(idCartera: Int): Result<BalanceCierre> =
        Result.failure(UnsupportedOperationException())

    override suspend fun inactivar(idCartera: Int): Result<Cartera> =
        Result.failure(UnsupportedOperationException())
}
