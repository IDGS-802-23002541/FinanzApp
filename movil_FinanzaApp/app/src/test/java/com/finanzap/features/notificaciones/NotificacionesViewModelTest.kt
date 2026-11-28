package com.finanzap.features.notificaciones

import com.finanzap.features.notificaciones.data.ListadoNotificaciones
import com.finanzap.features.notificaciones.data.Notificacion
import com.finanzap.features.notificaciones.data.NotificacionesRepository
import com.finanzap.features.notificaciones.ui.NotificacionesViewModel
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
class NotificacionesViewModelTest {

    private val repositorio = RepositorioNotificacionesFalso()

    @Before
    fun preparar() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @After
    fun limpiar() {
        Dispatchers.resetMain()
    }

    @Test
    fun `cargar deja las notificaciones y las no leidas`() = runTest {
        val viewModel = NotificacionesViewModel(repositorio)

        viewModel.cargar()

        val estado = viewModel.state.value
        assertFalse(estado.cargando)
        assertNull(estado.error)
        assertEquals(2, estado.notificaciones.size)
        assertEquals(1, estado.noLeidas)
    }

    @Test
    fun `marcar todas deja cero no leidas`() = runTest {
        val viewModel = NotificacionesViewModel(repositorio)
        viewModel.cargar()

        viewModel.marcarTodasLeidas()

        val estado = viewModel.state.value
        assertEquals(0, estado.noLeidas)
        assertTrue(estado.notificaciones.all { it.leida })
        assertEquals(1, repositorio.vecesMarcarTodas)
    }

    @Test
    fun `fallo al listar muestra mensaje`() = runTest {
        repositorio.falla = IOException("sin red")
        val viewModel = NotificacionesViewModel(repositorio)

        viewModel.cargar()

        assertEquals(
            "No se pudo conectar. Revisa tu conexión.",
            viewModel.state.value.error
        )
    }
}

private class RepositorioNotificacionesFalso : NotificacionesRepository {

    var falla: Exception? = null
    var vecesMarcarTodas = 0

    private val datos = listOf(
        Notificacion(1, "Movimiento", "Se registró un gasto.", "MOVIMIENTO", "2026-11-27T10:00:00", false),
        Notificacion(2, "Pago", "La renta vence pronto.", "PAGOS", "2026-11-27T09:00:00", true)
    )

    override suspend fun listar(pagina: Int, porPagina: Int): Result<ListadoNotificaciones> {
        val error = falla
        if (error != null) return Result.failure(error)
        return Result.success(
            ListadoNotificaciones(
                notificaciones = datos,
                noLeidas = datos.count { !it.leida },
                pagina = 1,
                totalPaginas = 1
            )
        )
    }

    override suspend fun marcarLeida(idNotificacion: Long): Result<Unit> = Result.success(Unit)

    override suspend fun marcarTodasLeidas(): Result<Int> {
        vecesMarcarTodas += 1
        return Result.success(1)
    }
}
