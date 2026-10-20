package com.finanzap.features.auth.data.dto

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val correo: String,
    val contrasena: String
)
