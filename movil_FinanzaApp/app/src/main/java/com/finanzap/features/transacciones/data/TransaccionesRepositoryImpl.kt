package com.finanzap.features.transacciones.data

import com.finanzap.features.transacciones.PaginaTransacciones
import com.finanzap.features.transacciones.TipoTransaccion
import com.finanzap.features.transacciones.Transaccion
import javax.inject.Inject
import kotlinx.coroutines.CancellationException

class TransaccionesRepositoryImpl @Inject constructor(
    private val transaccionesApi: TransaccionesApi
) : TransaccionesRepository {

    override suspend fun listar(
        idCartera: Int,
        pagina: Int,
        porPagina: Int,
        periodoId: Int?
    ): Result<PaginaTransacciones> =
        try {
            val respuesta = transaccionesApi.listar(idCartera, pagina, porPagina, periodoId)
            Result.success(respuesta.data.aPagina())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun crear(
        idCartera: Int,
        tipo: TipoTransaccion,
        monto: Double,
        fecha: String,
        categoriaId: Int?,
        descripcion: String?
    ): Result<Transaccion> =
        try {
            val respuesta = transaccionesApi.crear(
                idCartera = idCartera,
                peticion = CrearTransaccionRequest(
                    tipo = tipo.name,
                    monto = monto,
                    fecha = fecha,
                    categoriaId = categoriaId,
                    descripcion = descripcion?.trim()?.ifBlank { null }
                )
            )
            Result.success(respuesta.data.transaccion.aTransaccion())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun actualizar(
        idTransaccion: Int,
        tipo: TipoTransaccion,
        monto: Double,
        fecha: String,
        categoriaId: Int?,
        descripcion: String?
    ): Result<Transaccion> =
        try {
            val respuesta = transaccionesApi.actualizar(
                idTransaccion = idTransaccion,
                peticion = CrearTransaccionRequest(
                    tipo = tipo.name,
                    monto = monto,
                    fecha = fecha,
                    categoriaId = categoriaId,
                    descripcion = descripcion?.trim()?.ifBlank { null }
                )
            )
            Result.success(respuesta.data.transaccion.aTransaccion())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun eliminar(idTransaccion: Int): Result<Unit> =
        try {
            transaccionesApi.eliminar(idTransaccion)
            Result.success(Unit)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }
}
