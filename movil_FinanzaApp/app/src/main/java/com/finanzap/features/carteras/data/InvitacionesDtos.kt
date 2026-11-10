package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.IngresoInvitacion
import com.finanzap.features.carteras.Invitacion
import kotlinx.serialization.Serializable

@Serializable
data class RespuestaInvitaciones(
    val data: DatosInvitaciones = DatosInvitaciones()
)

@Serializable
data class RespuestaInvitacionGenerada(
    val data: InvitacionDto = InvitacionDto()
)

@Serializable
data class DatosInvitaciones(
    val invitacion: InvitacionDto? = null,
    val ingresos: List<IngresoInvitacionDto> = emptyList()
)

@Serializable
data class InvitacionDto(
    val idInvitacion: Int = 0,
    val carteraId: Int = 0,
    val codigo: String = "",
    val qrContenido: String = "",
    val fechaCreacion: String? = null,
    val fechaExpiracion: String? = null,
    val estado: String = "ACTIVA",
    val expirada: Boolean = false
)

@Serializable
data class IngresoInvitacionDto(
    val idUsuario: Int = 0,
    val nombre: String = "",
    val iniciales: String = "",
    val fechaUnion: String? = null
)

@Serializable
data class UnirseRequest(
    val codigo: String
)

@Serializable
data class RespuestaUnion(
    val data: DatosUnion = DatosUnion()
)

@Serializable
data class DatosUnion(
    val invitacionId: Int = 0,
    val cartera: CarteraUnionDto? = null,
    val miembro: MiembroUnionDto? = null
)

@Serializable
data class CarteraUnionDto(
    val id: Int = 0,
    val nombre: String = "",
    val estado: String = ""
)

@Serializable
data class MiembroUnionDto(
    val usuarioId: Int = 0,
    val rol: String = "COLABORADOR",
    val estado: String = "ACTIVO"
)

fun InvitacionDto.aInvitacion(): Invitacion = Invitacion(
    codigo = codigo,
    qrContenido = qrContenido,
    fechaExpiracion = fechaExpiracion,
    estado = estado,
    expirada = expirada
)

fun IngresoInvitacionDto.aIngreso(): IngresoInvitacion = IngresoInvitacion(
    nombre = nombre,
    iniciales = iniciales,
    fechaUnion = fechaUnion
)
