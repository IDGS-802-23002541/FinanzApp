package com.finanzap.features.soporte.data

import javax.inject.Inject
import kotlinx.coroutines.CancellationException

class SoporteRepositoryImpl @Inject constructor(
    private val soporteApi: SoporteApi
) : SoporteRepository {

    override suspend fun listarTickets(pagina: Int, porPagina: Int): Result<ListadoTickets> =
        try {
            Result.success(
                soporteApi.listarTickets(pagina = pagina, porPagina = porPagina).data
            )
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun crearTicket(
        asunto: String,
        descripcion: String,
        categoria: String,
        prioridad: String
    ): Result<Ticket> =
        try {
            val respuesta = soporteApi.crearTicket(
                peticion = CrearTicketRequest(
                    asunto = asunto,
                    descripcion = descripcion,
                    categoria = categoria,
                    prioridad = prioridad
                )
            )
            Result.success(respuesta.data.ticket)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun actualizarTicket(
        idTicket: Int,
        asunto: String,
        descripcion: String,
        categoria: String,
        prioridad: String
    ): Result<Ticket> =
        try {
            val respuesta = soporteApi.actualizarTicket(
                idTicket = idTicket,
                peticion = EditarTicketRequest(
                    asunto = asunto,
                    descripcion = descripcion,
                    categoria = categoria,
                    prioridad = prioridad
                )
            )
            Result.success(respuesta.data.ticket)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun eliminarTicket(idTicket: Int): Result<Unit> =
        try {
            soporteApi.eliminarTicket(idTicket)
            Result.success(Unit)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }
}
