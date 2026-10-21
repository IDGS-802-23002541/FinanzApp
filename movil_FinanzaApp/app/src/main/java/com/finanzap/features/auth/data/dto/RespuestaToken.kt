package com.finanzap.features.auth.data.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class RefreshRequest(
    @SerialName("refresh_token") val refreshToken: String
)

// Respuesta de POST /auth/refresh (contrato en Backend_FinanzaApp/openapi.yaml).
@Serializable
data class RespuestaToken(
    val ok: Boolean = true,
    val data: DatosToken,
    val mensaje: String = ""
)

@Serializable
data class DatosToken(
    @SerialName("access_token") val accessToken: String,
    @SerialName("token_type") val tipoToken: String = "Bearer",
    @SerialName("expires_in") val expiraEn: Int = 0
)
