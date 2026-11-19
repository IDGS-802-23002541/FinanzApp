package com.finanzap.features.soporte.data

/**
 * Contrato del módulo de soporte consumido por el ViewModel.
 * La implementación real está en [SoporteRepositoryImpl]; en las pruebas se sustituye por un doble.
 */
interface SoporteRepository {

    suspend fun listarTickets(
        pagina: Int = 1,
        porPagina: Int = 20
    ): Result<ListadoTickets>

    suspend fun crearTicket(
        asunto: String,
        descripcion: String,
        categoria: String,
        prioridad: String
    ): Result<Ticket>

    suspend fun actualizarTicket(
        idTicket: Int,
        asunto: String,
        descripcion: String,
        categoria: String,
        prioridad: String
    ): Result<Ticket>

    suspend fun eliminarTicket(idTicket: Int): Result<Unit>
}
