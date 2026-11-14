package com.finanzap.features.soporte.data

import kotlinx.serialization.Serializable

// Contrato de /soporte (ver Backend_FinanzaApp/app/services/soporte_service.py).

/** Categorías que acepta la API de soporte. */
val CATEGORIAS_SOPORTE = listOf("GENERAL", "CUENTA", "CARTERA", "PAGOS", "ERROR", "OTRO")

/** Prioridades que acepta la API de soporte. */
val PRIORIDADES_SOPORTE = listOf("BAJA", "MEDIA", "ALTA", "URGENTE")

@Serializable
data class CrearTicketRequest(
    val asunto: String,
    val descripcion: String,
    val categoria: String,
    val prioridad: String
)

@Serializable
data class ResponderTicketRequest(
    val mensaje: String
)

@Serializable
data class RespuestaCrearTicket(
    val data: DatosTicketCreado = DatosTicketCreado()
)

@Serializable
data class DatosTicketCreado(
    val ticket: Ticket = Ticket()
)

@Serializable
data class RespuestaListarTickets(
    val data: ListadoTickets = ListadoTickets()
)

@Serializable
data class ListadoTickets(
    val tickets: List<Ticket> = emptyList(),
    val paginacion: PaginacionTickets = PaginacionTickets()
)

@Serializable
data class PaginacionTickets(
    val pagina: Int = 1,
    val porPagina: Int = 20,
    val total: Int = 0,
    val totalPaginas: Int = 0
)

@Serializable
data class RespuestaResponderTicket(
    val data: DatosRespuestaCreada = DatosRespuestaCreada()
)

@Serializable
data class DatosRespuestaCreada(
    val respuesta: RespuestaTicket = RespuestaTicket()
)

@Serializable
data class Ticket(
    val idTicket: Int = 0,
    val asunto: String = "",
    val descripcion: String = "",
    val categoria: String = "GENERAL",
    val prioridad: String = "MEDIA",
    val estado: String = "ABIERTO",
    val fechaCreacion: String = "",
    val fechaCierre: String? = null,
    val respuestas: List<RespuestaTicket> = emptyList(),
    val asignacionActual: AsignacionTicket? = null
)

@Serializable
data class RespuestaTicket(
    val idRespuesta: Int = 0,
    val ticketId: Int = 0,
    val mensaje: String = "",
    val fechaCreacion: String = ""
)

@Serializable
data class AsignacionTicket(
    val idAsignacion: Int = 0,
    val ticketId: Int = 0,
    val trabajadorId: Int = 0,
    val fechaInicio: String = "",
    val observaciones: String? = null
)
