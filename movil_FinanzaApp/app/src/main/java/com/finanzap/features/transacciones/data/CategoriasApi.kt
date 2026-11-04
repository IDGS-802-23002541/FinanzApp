package com.finanzap.features.transacciones.data

import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Path

interface CategoriasApi {

    @POST("carteras/{idCartera}/categorias")
    suspend fun crear(
        @Path("idCartera") idCartera: Int,
        @Body peticion: CrearCategoriaRequest
    ): RespuestaCategoria
}
