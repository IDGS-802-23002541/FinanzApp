package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.data.dto.CrearCarteraRequest
import com.finanzap.features.carteras.data.dto.RespuestaCartera
import com.finanzap.features.carteras.data.dto.RespuestaListaCarteras
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
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
}
