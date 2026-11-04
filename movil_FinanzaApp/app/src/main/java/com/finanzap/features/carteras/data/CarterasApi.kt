package com.finanzap.features.carteras.data

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface CarterasApi {

    @POST("carteras")
    suspend fun crear(@Body peticion: CrearCarteraRequest): RespuestaCartera

    @GET("carteras")
    suspend fun listar(
        @Query("estado") estado: String? = null,
        @Query("tipo") tipo: String? = null,
        @Query("rol") rol: String? = null,
        @Query("busqueda") busqueda: String? = null
    ): RespuestaListaCarteras

    @GET("carteras/{idCartera}")
    suspend fun detalle(@Path("idCartera") idCartera: Int): RespuestaCartera
}
