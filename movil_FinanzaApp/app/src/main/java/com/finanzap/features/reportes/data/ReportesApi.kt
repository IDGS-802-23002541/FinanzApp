package com.finanzap.features.reportes.data

import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface ReportesApi {

    @GET("reportes")
    suspend fun vistaPrevia(
        @Query("carteraId") carteraId: Int? = null,
        @Query("tipo") tipo: String? = null,
        @Query("periodoId") periodoId: Int? = null,
        @Query("fechaInicio") fechaInicio: String? = null,
        @Query("fechaFin") fechaFin: String? = null
    ): RespuestaVistaPrevia

    @GET("reportes/exportar")
    suspend fun exportar(
        @Query("formato") formato: String,
        @Query("carteraId") carteraId: Int? = null,
        @Query("tipo") tipo: String? = null,
        @Query("periodoId") periodoId: Int? = null,
        @Query("fechaInicio") fechaInicio: String? = null,
        @Query("fechaFin") fechaFin: String? = null
    ): Response<ResponseBody>
}
