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

    override suspend fun responderTicket(
        idTicket: Int,
        mensaje: String
    ): Result<RespuestaTicket> =
        try {
            val respuesta = soporteApi.crearRespuesta(
                idTicket = idTicket,
                peticion = ResponderTicketRequest(mensaje = mensaje)
            )
            Result.success(respuesta.data.respuesta)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }
}
