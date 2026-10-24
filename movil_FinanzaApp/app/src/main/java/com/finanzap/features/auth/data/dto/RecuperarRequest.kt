package com.finanzap.features.auth.data.dto

import kotlinx.serialization.Serializable

@Serializable
data class RecuperarRequest(
    val correo: String
)
