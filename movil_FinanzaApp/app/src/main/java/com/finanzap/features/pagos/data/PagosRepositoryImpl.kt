package com.finanzap.features.pagos.data

import com.finanzap.core.util.mensajeErrorApi
import javax.inject.Inject
import kotlinx.coroutines.CancellationException

/**
 * Traduce los fallos de la API a un mensaje que la pantalla pueda mostrar.
 */
class PagosRepositoryImpl @Inject constructor(
    private val pagosApi: PagosApi
) : PagosRepository {

    override suspend fun listar(
        carteraId: Int,
        pagina: Int,
        porPagina: Int
    ): Result<ListadoPagos> =
        try {
            val datos = pagosApi.listar(carteraId, pagina, porPagina).data
            Result.success(
                ListadoPagos(
                    pagos = datos.pagos.map { it.aPagoRecurrente() },
                    pagina = datos.paginacion.pagina,
                    totalPaginas = datos.paginacion.totalPaginas
                )
            )
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(
                Exception(mensajeErrorApi(e, "No se pudieron cargar los pagos recurrentes."), e)
            )
        }

    override suspend fun crear(
        carteraId: Int,
        nombre: String,
        monto: Double,
        frecuencia: String,
        fechaInicio: String,
        fechaFin: String?,
        descripcion: String?
    ): Result<PagoRecurrente> =
        try {
            val respuesta = pagosApi.crear(
                CrearPagoRequest(
                    carteraId = carteraId,
                    nombre = nombre.trim(),
                    monto = monto,
                    frecuencia = frecuencia,
                    fechaInicio = fechaInicio,
                    descripcion = descripcion?.trim()?.ifBlank { null },
                    fechaFin = fechaFin
                )
            )
            Result.success(respuesta.data.pago.aPagoRecurrente())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(
                Exception(mensajeErrorApi(e, "No se pudo crear el pago recurrente."), e)
            )
        }

    override suspend fun actualizar(
        idPago: Int,
        nombre: String,
        monto: Double,
        frecuencia: String,
        fechaInicio: String,
        fechaFin: String?,
        descripcion: String?
    ): Result<PagoRecurrente> =
        try {
            val respuesta = pagosApi.actualizar(
                idPago,
                EditarPagoRequest(
                    nombre = nombre.trim(),
                    monto = monto,
                    frecuencia = frecuencia,
                    fechaInicio = fechaInicio,
                    descripcion = descripcion?.trim()?.ifBlank { null },
                    fechaFin = fechaFin
                )
            )
            Result.success(respuesta.data.pago.aPagoRecurrente())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(
                Exception(mensajeErrorApi(e, "No se pudo actualizar el pago recurrente."), e)
            )
        }

    override suspend fun cancelar(idPago: Int): Result<PagoRecurrente> =
        try {
            Result.success(pagosApi.cancelar(idPago).data.pago.aPagoRecurrente())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(
                Exception(mensajeErrorApi(e, "No se pudo cancelar el pago recurrente."), e)
            )
        }

    override suspend fun marcarHecho(idPago: Int, fechaProgramada: String?): Result<Unit> =
        try {
            pagosApi.marcarHecho(idPago, MarcarHechoRequest(fechaProgramada = fechaProgramada))
            Result.success(Unit)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(
                Exception(
                    mensajeErrorApi(e, "No se pudo registrar el pago como realizado."),
                    e
                )
            )
        }
}
