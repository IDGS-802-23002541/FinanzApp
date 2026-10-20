package com.finanzap.features.auth.data.dto

import kotlinx.serialization.Serializable

@Serializable
data class LoginResponse(
    val token: String
)
