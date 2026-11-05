package com.finanzap.features.carteras

data class Invitacion(
    val codigo: String,
    val qrContenido: String,
    val fechaExpiracion: String?,
    val estado: String,
    val expirada: Boolean
)
