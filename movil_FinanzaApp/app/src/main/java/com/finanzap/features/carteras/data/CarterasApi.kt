package com.finanzap.features.carteras.data

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
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
    suspend fun detalle(
        @Path("idCartera") idCartera: Int,
        @Query("periodoId") periodoId: Int? = null
    ): RespuestaCartera

    @GET("carteras/{idCartera}/periodos")
    suspend fun periodos(@Path("idCartera") idCartera: Int): RespuestaPeriodos

    @POST("carteras/{idCartera}/salir")
    suspend fun salir(@Path("idCartera") idCartera: Int): RespuestaSalidaCartera

    @POST("carteras/{idCartera}/finalizar")
    suspend fun finalizar(@Path("idCartera") idCartera: Int): RespuestaCierre

    @PUT("carteras/{idCartera}")
    suspend fun editar(
        @Path("idCartera") idCartera: Int,
        @Body peticion: CrearCarteraRequest
    ): RespuestaCartera

    @POST("carteras/{idCartera}/inactivar")
    suspend fun inactivar(@Path("idCartera") idCartera: Int): RespuestaCartera
}
