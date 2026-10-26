package com.finanzap.features.carteras.ui.formulario

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
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class NuevaCarteraViewModelTest {

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
    fun `nombre vacio no llama a la api`() = runTest {
        val viewModel = NuevaCarteraViewModel(repositorio)

        viewModel.onTipoChange(TipoCartera.HOGAR)
        viewModel.guardar()

        assertEquals("El nombre es obligatorio.", viewModel.state.value.errorNombre)
        assertEquals(0, repositorio.llamadasCrear)
    }

    @Test
    fun `sin tipo no llama a la api`() = runTest {
        val viewModel = NuevaCarteraViewModel(repositorio)

        viewModel.onNombreChange("Casa Borja")
        viewModel.guardar()

        assertEquals("Elige el tipo de cartera.", viewModel.state.value.errorTipo)
        assertEquals(0, repositorio.llamadasCrear)
    }

    @Test
    fun `presupuesto no numerico muestra error`() = runTest {
        val viewModel = NuevaCarteraViewModel(repositorio)

        viewModel.onNombreChange("Casa Borja")
        viewModel.onTipoChange(TipoCartera.HOGAR)
        viewModel.onPresupuestoChange("mucho")
        viewModel.guardar()

        assertEquals("Ingresa un monto válido.", viewModel.state.value.errorPresupuesto)
        assertEquals(0, repositorio.llamadasCrear)
    }

    @Test
    fun `fecha fin anterior a la de inicio muestra error`() = runTest {
        val viewModel = NuevaCarteraViewModel(repositorio)

        viewModel.onNombreChange("Viaje")
        viewModel.onTipoChange(TipoCartera.VIAJE)
        viewModel.onFechaInicioChange("2026-11-10")
        viewModel.onFechaFinChange("2026-11-01")
        viewModel.guardar()

        assertEquals(
            "La fecha de fin no puede ser anterior a la de inicio.",
            viewModel.state.value.errorFechas
        )
        assertEquals(0, repositorio.llamadasCrear)
    }

    @Test
    fun `creacion exitosa normaliza los datos y marca la cartera como creada`() = runTest {
        val viewModel = NuevaCarteraViewModel(repositorio)

        viewModel.onNombreChange("  Casa Borja  ")
        viewModel.onTipoChange(TipoCartera.HOGAR)
        viewModel.onDescripcionChange("   ")
        viewModel.onPresupuestoChange("5,000")
        viewModel.guardar()

        assertTrue(viewModel.state.value.creada)
        assertFalse(viewModel.state.value.guardando)
        assertEquals(1, repositorio.llamadasCrear)
        assertEquals("Casa Borja", repositorio.ultimoNombre)
        assertEquals(TipoCartera.HOGAR, repositorio.ultimoTipo)
        assertNull(repositorio.ultimaDescripcion)
        assertEquals(5000.0, repositorio.ultimoPresupuesto, 0.0)
    }

    @Test
    fun `fallo de la api no marca la cartera como creada`() = runTest {
        repositorio.falla = IOException("sin red")
        val viewModel = NuevaCarteraViewModel(repositorio)

        viewModel.onNombreChange("Casa Borja")
        viewModel.onTipoChange(TipoCartera.HOGAR)
        viewModel.guardar()

        assertFalse(viewModel.state.value.creada)
        assertEquals(
            "No se pudo conectar. Revisa tu conexión.",
            viewModel.state.value.errorGeneral
        )
    }

    @Test
    fun `elegir el tipo limpia su error`() = runTest {
        val viewModel = NuevaCarteraViewModel(repositorio)

        viewModel.onNombreChange("Casa Borja")
        viewModel.guardar()
        viewModel.onTipoChange(TipoCartera.OTRO)

        assertNull(viewModel.state.value.errorTipo)
    }
}

private class RepositorioFalso : CarterasRepository {

    var llamadasCrear = 0
    var ultimoNombre: String? = null
    var ultimoTipo: TipoCartera? = null
    var ultimaDescripcion: String? = "sin asignar"
    var ultimoPresupuesto: Double = 0.0
    var falla: Exception? = null

    override suspend fun carteras(): Result<List<Cartera>> = Result.success(emptyList())

    override suspend fun crear(
        nombre: String,
        tipo: TipoCartera,
        descripcion: String?,
        presupuestoInicial: Double,
        fechaInicio: String?,
        fechaFin: String?
    ): Result<Cartera> {
        llamadasCrear++
        ultimoNombre = nombre
        ultimoTipo = tipo
        ultimaDescripcion = descripcion
        ultimoPresupuesto = presupuestoInicial
        val error = falla
        if (error != null) return Result.failure(error)
        return Result.success(
            Cartera(id = 99, nombre = nombre, tipo = tipo, rol = RolEnCartera.PROPIETARIO)
        )
    }
}
