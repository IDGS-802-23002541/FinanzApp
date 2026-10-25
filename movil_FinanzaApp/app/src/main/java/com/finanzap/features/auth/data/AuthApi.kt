package com.finanzap.features.auth.data

import com.finanzap.features.auth.data.dto.CambiarContrasenaRequest
import com.finanzap.features.auth.data.dto.LoginRequest
import com.finanzap.features.auth.data.dto.RecuperarRequest
import com.finanzap.features.auth.data.dto.RefreshRequest
import com.finanzap.features.auth.data.dto.RespuestaMensaje
import com.finanzap.features.auth.data.dto.RespuestaRecuperacion
import com.finanzap.features.auth.data.dto.RespuestaSesion
import com.finanzap.features.auth.data.dto.RespuestaToken
import com.finanzap.features.auth.data.dto.RestablecerRequest
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

    @POST("auth/recuperar")
    suspend fun solicitarRecuperacion(@Body peticion: RecuperarRequest): RespuestaRecuperacion

    @POST("auth/restablecer")
    suspend fun restablecerContrasenia(@Body peticion: RestablecerRequest): RespuestaMensaje

    // Pendiente de backend (tarea #106): hoy responde 404 hasta que exista el endpoint.
    @POST("auth/cambiar")
    suspend fun cambiarContrasenia(@Body peticion: CambiarContrasenaRequest): RespuestaMensaje
}
