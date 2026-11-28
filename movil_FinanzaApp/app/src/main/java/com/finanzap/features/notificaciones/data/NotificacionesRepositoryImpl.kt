package com.finanzap.features.notificaciones.data

import javax.inject.Inject
import kotlinx.coroutines.CancellationException

class NotificacionesRepositoryImpl @Inject constructor(
    private val notificacionesApi: NotificacionesApi
) : NotificacionesRepository {

    override suspend fun listar(
        pagina: Int,
        porPagina: Int
    ): Result<ListadoNotificaciones> =
        try {
            val datos = notificacionesApi.listar(pagina, porPagina).data
            Result.success(
                ListadoNotificaciones(
                    notificaciones = datos.notificaciones.map { it.aNotificacion() },
                    noLeidas = datos.noLeidas,
                    pagina = datos.paginacion.pagina,
                    totalPaginas = datos.paginacion.totalPaginas
                )
            )
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun marcarLeida(idNotificacion: Long): Result<Unit> =
        try {
            notificacionesApi.marcarLeida(idNotificacion)
            Result.success(Unit)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun marcarTodasLeidas(): Result<Int> =
        try {
            Result.success(notificacionesApi.marcarTodasLeidas().data.actualizadas)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }
}
