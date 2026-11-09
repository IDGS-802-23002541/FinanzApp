package com.finanzap.features.transacciones.data

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface CategoriasApi {

    @GET("carteras/{idCartera}/categorias")
    suspend fun listar(
        @Path("idCartera") idCartera: Int,
        @Query("tipo") tipo: String? = null
    ): RespuestaCategorias

    @POST("carteras/{idCartera}/categorias")
    suspend fun crear(
        @Path("idCartera") idCartera: Int,
        @Body peticion: CrearCategoriaRequest
    ): RespuestaCategoria
}
