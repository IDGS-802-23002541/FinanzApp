package com.finanzap.features.auth.data.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// Respuesta de POST /auth/login (contrato en Backend_FinanzaApp/openapi.yaml).
@Serializable
data class RespuestaSesion(
    val ok: Boolean,
    val data: DatosSesion,
    val mensaje: String = ""
)

@Serializable
data class DatosSesion(
    @SerialName("access_token") val accessToken: String,
    @SerialName("refresh_token") val refreshToken: String,
    @SerialName("token_type") val tipoToken: String = "Bearer",
    @SerialName("expires_in") val expiraEn: Int = 0,
    val usuario: Usuario
)

@Serializable
data class Usuario(
    val idUsuario: Int,
    val nombreUsuario: String,
    val apaterno: String,
    val amaterno: String? = null,
    val correo: String,
    val rolGlobal: String,
    val estado: String,
    val fechaRegistro: String? = null
)
