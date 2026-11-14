package com.finanzap.features.soporte

import com.finanzap.features.soporte.data.ListadoTickets
import com.finanzap.features.soporte.data.PaginacionTickets
import com.finanzap.features.soporte.data.RespuestaTicket
import com.finanzap.features.soporte.data.SoporteRepository
import com.finanzap.features.soporte.data.Ticket
import com.finanzap.features.soporte.ui.SoporteViewModel
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
class SoporteViewModelTest {

    private val repositorio = RepositorioSoporteFalso()

    @Before
    fun preparar() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
    }

    @After
    fun limpiar() {
        Dispatchers.resetMain()
    }

    @Test
    fun `cargar deja los tickets en el estado`() = runTest {
        val viewModel = SoporteViewModel(repositorio)

        viewModel.cargar()

        val estado = viewModel.state.value
        assertFalse(estado.cargando)
        assertNull(estado.error)
        assertEquals(1, estado.tickets.size)
        assertEquals("Problema con el saldo", estado.tickets.first().asunto)
    }

    @Test
    fun `sin tickets el listado queda vacio`() = runTest {
        repositorio.tickets = mutableListOf()
        val viewModel = SoporteViewModel(repositorio)

        viewModel.cargar()

        val estado = viewModel.state.value
        assertFalse(estado.cargando)
        assertNull(estado.error)
        assertTrue(estado.tickets.isEmpty())
    }

    @Test
    fun `fallo de la api al listar muestra el mensaje`() = runTest {
        repositorio.falla = IOException("sin red")
        val viewModel = SoporteViewModel(repositorio)

        viewModel.cargar()

        val estado = viewModel.state.value
        assertFalse(estado.cargando)
        assertEquals("No se pudo conectar. Revisa tu conexión.", estado.error)
    }

    @Test
    fun `crear reporte guarda el ticket y cierra el formulario`() = runTest {
        val viewModel = SoporteViewModel(repositorio)
        viewModel.abrirFormulario()
        viewModel.onAsuntoChange("No puedo entrar")
        viewModel.onDescripcionChange("La app no me deja iniciar sesión")

        viewModel.crearTicket()

        val estado = viewModel.state.value
        assertFalse(estado.formularioAbierto)
        assertFalse(estado.guardando)
        assertNull(estado.errorFormulario)
        assertEquals(2, estado.tickets.size)
        assertEquals("No puedo entrar", estado.tickets.first().asunto)
    }

    @Test
    fun `crear sin asunto muestra el error de validacion`() = runTest {
        val viewModel = SoporteViewModel(repositorio)
        viewModel.abrirFormulario()
        viewModel.onDescripcionChange("La app no me deja iniciar sesión")

        viewModel.crearTicket()

        val estado = viewModel.state.value
        assertEquals("Escribe el asunto.", estado.errorAsunto)
        assertTrue(estado.formularioAbierto)
        assertEquals(1, repositorio.tickets.size)
    }

    @Test
    fun `responder a un ticket guarda la respuesta`() = runTest {
        val viewModel = SoporteViewModel(repositorio)
        viewModel.abrirRespuesta(1)
        viewModel.onMensajeRespuestaChange("Ya lo reviso, gracias")

        viewModel.enviarRespuesta()

        val estado = viewModel.state.value
        assertNull(estado.ticketRespondiendoId)
        assertFalse(estado.respondiendo)
        assertEquals(1, estado.tickets.first().respuestas.size)
        assertEquals("Ya lo reviso, gracias", estado.tickets.first().respuestas.first().mensaje)
    }
}

private class RepositorioSoporteFalso : SoporteRepository {

    var falla: Exception? = null
    var tickets: MutableList<Ticket> = mutableListOf(ticketEjemplo())

    override suspend fun listarTickets(pagina: Int, porPagina: Int): Result<ListadoTickets> {
        val error = falla
        if (error != null) {
            return Result.failure(error)
        }
        return Result.success(
            ListadoTickets(
                tickets = tickets.toList(),
                paginacion = PaginacionTickets(
                    pagina = pagina,
                    porPagina = porPagina,
                    total = tickets.size,
                    totalPaginas = 1
                )
            )
        )
    }

    override suspend fun crearTicket(
        asunto: String,
        descripcion: String,
        categoria: String,
        prioridad: String
    ): Result<Ticket> {
        val ticket = Ticket(
            idTicket = 9,
            asunto = asunto,
            descripcion = descripcion,
            categoria = categoria,
            prioridad = prioridad,
            estado = "ABIERTO",
            fechaCreacion = "2026-11-14T10:00:00"
        )
        tickets.add(0, ticket)
        return Result.success(ticket)
    }

    override suspend fun responderTicket(
        idTicket: Int,
        mensaje: String
    ): Result<RespuestaTicket> {
        val respuesta = RespuestaTicket(
            idRespuesta = 5,
            ticketId = idTicket,
            mensaje = mensaje,
            fechaCreacion = "2026-11-14T11:00:00"
        )
        tickets.replaceAll { ticket ->
            if (ticket.idTicket == idTicket) {
                ticket.copy(respuestas = ticket.respuestas + respuesta)
            } else {
                ticket
            }
        }
        return Result.success(respuesta)
    }
}

private fun ticketEjemplo() = Ticket(
    idTicket = 1,
    asunto = "Problema con el saldo",
    descripcion = "El saldo no coincide con los movimientos.",
    categoria = "CARTERA",
    prioridad = "MEDIA",
    estado = "ABIERTO",
    fechaCreacion = "2026-11-10T09:30:00"
)
