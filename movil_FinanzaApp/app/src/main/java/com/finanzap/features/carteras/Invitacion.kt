package com.finanzap.features.carteras

data class Invitacion(
    val codigo: String,
    val qrContenido: String,
    val fechaExpiracion: String?,
    val estado: String,
    val expirada: Boolean
)

data class IngresoInvitacion(
    val nombre: String,
    val iniciales: String,
    val fechaUnion: String?
)

data class InvitacionesCartera(
    val invitacion: Invitacion? = null,
    val ingresos: List<IngresoInvitacion> = emptyList()
)
