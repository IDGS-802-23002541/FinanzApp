package com.finanzap.features.soporte.data

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface SoporteApi {

    @POST("soporte/tickets")
    suspend fun crearTicket(@Body peticion: CrearTicketRequest): RespuestaCrearTicket

    @GET("soporte/tickets")
    suspend fun listarTickets(
        @Query("pagina") pagina: Int = 1,
        @Query("porPagina") porPagina: Int = 20
    ): RespuestaListarTickets

    @POST("soporte/tickets/{idTicket}/respuestas")
    suspend fun crearRespuesta(
        @Path("idTicket") idTicket: Int,
        @Body peticion: ResponderTicketRequest
    ): RespuestaResponderTicket
}
