package com.finanzap.features.notificaciones.data

interface NotificacionesRepository {

    suspend fun listar(pagina: Int = 1, porPagina: Int = 20): Result<ListadoNotificaciones>

    suspend fun marcarLeida(idNotificacion: Long): Result<Unit>

    suspend fun marcarTodasLeidas(): Result<Int>
}
