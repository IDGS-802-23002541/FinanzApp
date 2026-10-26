package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.data.dto.CrearCarteraRequest
import com.finanzap.features.carteras.data.dto.RespuestaCartera
import retrofit2.http.Body
import retrofit2.http.POST

interface CarterasApi {

    @POST("carteras")
    suspend fun crear(@Body peticion: CrearCarteraRequest): RespuestaCartera
}
