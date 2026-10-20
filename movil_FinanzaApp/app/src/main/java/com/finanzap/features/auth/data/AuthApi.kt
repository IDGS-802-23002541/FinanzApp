package com.finanzap.features.auth.data

import com.finanzap.features.auth.data.dto.LoginRequest
import com.finanzap.features.auth.data.dto.LoginResponse
import retrofit2.http.Body
import retrofit2.http.POST

// Definición de los endpoints de autenticación.
interface AuthApi {

    @POST("auth/login")
    suspend fun iniciarSesion(@Body peticion: LoginRequest): LoginResponse
}
