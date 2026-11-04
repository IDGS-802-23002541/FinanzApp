package com.finanzap.features.transacciones.data

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface TransaccionesApi {

    @GET("carteras/{idCartera}/transacciones")
    suspend fun listar(
        @Path("idCartera") idCartera: Int,
        @Query("pagina") pagina: Int = 1,
        @Query("porPagina") porPagina: Int = 20,
        @Query("periodoId") periodoId: Int? = null
    ): RespuestaTransacciones

    @POST("carteras/{idCartera}/transacciones")
    suspend fun crear(
        @Path("idCartera") idCartera: Int,
        @Body peticion: CrearTransaccionRequest
    ): RespuestaTransaccionCreada
}
