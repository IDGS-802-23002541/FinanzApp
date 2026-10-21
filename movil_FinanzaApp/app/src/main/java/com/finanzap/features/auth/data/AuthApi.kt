package com.finanzap.features.auth.data

import com.finanzap.features.auth.data.dto.LoginRequest
import com.finanzap.features.auth.data.dto.RefreshRequest
import com.finanzap.features.auth.data.dto.RespuestaSesion
import com.finanzap.features.auth.data.dto.RespuestaToken
import retrofit2.http.Body
import retrofit2.http.POST

// Definición de los endpoints de autenticación.
interface AuthApi {

    @POST("auth/login")
    suspend fun iniciarSesion(@Body peticion: LoginRequest): RespuestaSesion

    @POST("auth/refresh")
    suspend fun renovarToken(@Body peticion: RefreshRequest): RespuestaToken

    @POST("auth/logout")
    suspend fun cerrarSesion()
}
