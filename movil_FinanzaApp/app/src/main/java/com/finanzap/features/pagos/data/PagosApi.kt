package com.finanzap.features.pagos.data

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface PagosApi {

    @GET("pagos-recurrentes")
    suspend fun listar(
        @Query("carteraId") carteraId: Int,
        @Query("pagina") pagina: Int = 1,
        @Query("porPagina") porPagina: Int = 20
    ): RespuestaPagos

    @POST("pagos-recurrentes")
    suspend fun crear(@Body peticion: CrearPagoRequest): RespuestaPago

    @PUT("pagos-recurrentes/{idPago}")
    suspend fun actualizar(
        @Path("idPago") idPago: Int,
        @Body peticion: EditarPagoRequest
    ): RespuestaPago

    @DELETE("pagos-recurrentes/{idPago}")
    suspend fun cancelar(@Path("idPago") idPago: Int): RespuestaPago

    @POST("pagos-recurrentes/{idPago}/hecho")
    suspend fun marcarHecho(
        @Path("idPago") idPago: Int,
        @Body peticion: MarcarHechoRequest
    ): RespuestaHecho
}
