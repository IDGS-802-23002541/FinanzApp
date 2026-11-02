package com.finanzap.features.auth.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// Peticiones de autenticación (la API usa "contrasenia"; en la app, "contrasena").
@Serializable
data class LoginRequest(
    val correo: String,
    val contrasenia: String
)

@Serializable
data class RefreshRequest(
    @SerialName("refresh_token") val refreshToken: String
)

@Serializable
data class RecuperarRequest(
    val correo: String
)

@Serializable
data class RestablecerRequest(
    val correo: String,
    val codigo: String,
    val contrasenia: String
)

@Serializable
data class CambiarContrasenaRequest(
    val actual: String,
    val nueva: String
)

@Serializable
data class ConfirmacionCuentaRequest(
    val contrasenia: String
)

// Respuestas: solo se declaran los campos que usa la app; el resto se ignora.
@Serializable
data class RespuestaSesion(
    val data: DatosSesion
)

@Serializable
data class DatosSesion(
    @SerialName("access_token") val accessToken: String,
    @SerialName("refresh_token") val refreshToken: String
)

@Serializable
data class RespuestaToken(
    val data: DatosToken
)

@Serializable
data class DatosToken(
    @SerialName("access_token") val accessToken: String
)

@Serializable
data class RespuestaRecuperacion(
    val data: DatosRecuperacion? = null
)

@Serializable
data class DatosRecuperacion(
    val codigo: String? = null
)

@Serializable
class RespuestaMensaje
