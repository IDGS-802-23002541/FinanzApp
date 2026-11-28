package com.finanzap.features.notificaciones.data

import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface NotificacionesApi {

    @GET("notificaciones")
    suspend fun listar(
        @Query("pagina") pagina: Int = 1,
        @Query("porPagina") porPagina: Int = 20
    ): RespuestaNotificaciones

    @PUT("notificaciones/leidas")
    suspend fun marcarTodasLeidas(): RespuestaAccionNotificacion

    @PUT("notificaciones/{idNotificacion}/leida")
    suspend fun marcarLeida(
        @Path("idNotificacion") idNotificacion: Long
    ): RespuestaNotificaciones
}
