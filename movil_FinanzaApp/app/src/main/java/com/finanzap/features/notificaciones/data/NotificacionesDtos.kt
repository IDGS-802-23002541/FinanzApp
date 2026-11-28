package com.finanzap.features.notificaciones.data

import kotlinx.serialization.Serializable

// Contrato de /notificaciones (ver Backend_FinanzaApp/app/services/notificacion_service.py).

@Serializable
data class RespuestaNotificaciones(
    val data: DatosNotificaciones = DatosNotificaciones()
)

@Serializable
data class DatosNotificaciones(
    val notificaciones: List<NotificacionDto> = emptyList(),
    val noLeidas: Int = 0,
    val paginacion: PaginacionNotificaciones = PaginacionNotificaciones()
)

@Serializable
data class PaginacionNotificaciones(
    val pagina: Int = 1,
    val porPagina: Int = 20,
    val total: Int = 0,
    val totalPaginas: Int = 0
)

@Serializable
data class NotificacionDto(
    val idNotificacion: Long = 0,
    val titulo: String = "",
    val mensaje: String = "",
    val tipo: String? = null,
    val fechaCreacion: String? = null,
    val leida: Boolean = false,
    val fechaLectura: String? = null
)

@Serializable
data class RespuestaAccionNotificacion(
    val data: DatosAccionNotificacion = DatosAccionNotificacion()
)

@Serializable
data class DatosAccionNotificacion(
    val actualizadas: Int = 0
)

data class Notificacion(
    val id: Long,
    val titulo: String,
    val mensaje: String,
    val tipo: String?,
    val fechaCreacion: String?,
    val leida: Boolean
)

data class ListadoNotificaciones(
    val notificaciones: List<Notificacion>,
    val noLeidas: Int,
    val pagina: Int,
    val totalPaginas: Int
)

fun NotificacionDto.aNotificacion(): Notificacion = Notificacion(
    id = idNotificacion,
    titulo = titulo,
    mensaje = mensaje,
    tipo = tipo,
    fechaCreacion = fechaCreacion,
    leida = leida
)
