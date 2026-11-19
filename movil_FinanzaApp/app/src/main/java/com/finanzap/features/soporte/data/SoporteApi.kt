package com.finanzap.features.soporte.data

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
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

    @PUT("soporte/tickets/{idTicket}")
    suspend fun actualizarTicket(
        @Path("idTicket") idTicket: Int,
        @Body peticion: EditarTicketRequest
    ): RespuestaCrearTicket

    @DELETE("soporte/tickets/{idTicket}")
    suspend fun eliminarTicket(
        @Path("idTicket") idTicket: Int
    ): RespuestaEliminarTicket
}
