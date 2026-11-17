package com.finanzap.features.auth.data

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.HTTP
import retrofit2.http.POST
import retrofit2.http.PUT

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

    @POST("auth/cambiar")
    suspend fun cambiarContrasenia(@Body peticion: CambiarContrasenaRequest): RespuestaMensaje

    @POST("auth/desactivar")
    suspend fun desactivarCuenta(@Body peticion: ConfirmacionCuentaRequest): RespuestaMensaje

    @HTTP(method = "DELETE", path = "auth/cuenta", hasBody = true)
    suspend fun eliminarCuenta(@Body peticion: ConfirmacionCuentaRequest): RespuestaMensaje

    @PUT("auth/editar_cuenta")
    suspend fun editarCuenta(@Body peticion: EditarCuentaRequest): RespuestaMensaje

    @GET("auth/preferencias")
    suspend fun obtenerPreferencias(): RespuestaPreferencias

    @PUT("auth/preferencias")
    suspend fun guardarPreferencias(@Body peticion: PreferenciasRequest): RespuestaPreferencias
}
