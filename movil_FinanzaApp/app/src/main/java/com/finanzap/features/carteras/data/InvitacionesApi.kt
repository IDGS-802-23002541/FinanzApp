package com.finanzap.features.carteras.data

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface InvitacionesApi {

    @GET("carteras/{idCartera}/invitaciones")
    suspend fun consultar(@Path("idCartera") idCartera: Int): RespuestaInvitaciones

    @POST("carteras/{idCartera}/invitaciones")
    suspend fun generar(@Path("idCartera") idCartera: Int): RespuestaInvitacionGenerada

    @POST("invitaciones/unirse")
    suspend fun unirse(@Body peticion: UnirseRequest): RespuestaUnion
}
