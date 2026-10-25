package com.finanzap.features.auth.data.dto

import kotlinx.serialization.Serializable

@Serializable
data class CambiarContrasenaRequest(
    // La API usa "contrasenia" (ver openapi.yaml); en el resto de la app se escribe "contrasena".
    val actual: String,
    val nueva: String
)
