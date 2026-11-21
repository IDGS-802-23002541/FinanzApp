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

// Los apellidos y el correo vacíos conservan su valor en el backend.
@Serializable
data class EditarCuentaRequest(
    val nombreUsuario: String,
    val apaterno: String,
    val amaterno: String,
    val correo: String
)

@Serializable
data class PreferenciasRequest(
    val notificacionesMovimientos: Boolean,
    val notificacionesSistema: Boolean,
    val notificacionesPagos: Boolean
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

@Serializable
data class PreferenciasDto(
    val notificacionesMovimientos: Boolean,
    val notificacionesSistema: Boolean,
    val notificacionesPagos: Boolean
)

@Serializable
data class RespuestaPreferencias(
    val data: PreferenciasDto
)
