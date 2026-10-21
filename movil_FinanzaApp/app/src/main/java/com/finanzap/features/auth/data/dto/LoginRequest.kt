package com.finanzap.features.auth.data.dto

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val correo: String,
    // La API usa "contrasenia" (ver openapi.yaml); en el resto de la app se escribe "contrasena".
    val contrasenia: String
)
