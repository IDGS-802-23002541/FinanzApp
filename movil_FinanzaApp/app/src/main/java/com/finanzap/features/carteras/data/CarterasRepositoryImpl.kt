package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.BalanceCierre
import com.finanzap.features.carteras.Cartera
import com.finanzap.features.carteras.CarteraDetalle
import com.finanzap.features.carteras.PeriodoCartera
import com.finanzap.features.carteras.TipoCartera
import javax.inject.Inject
import kotlinx.coroutines.CancellationException

/**
 * Lista y crea carteras contra la API. El listado se refresca cada vez
 * que el dashboard vuelve a primer plano.
 */
class CarterasRepositoryImpl @Inject constructor(
    private val carterasApi: CarterasApi
) : CarterasRepository {

    override suspend fun carteras(): Result<List<Cartera>> =
        carterasConFiltros()

    override suspend fun detalle(
        idCartera: Int,
        periodoId: Int?
    ): Result<CarteraDetalle> =
        try {
            Result.success(carterasApi.detalle(idCartera, periodoId).data.aCarteraDetalle())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun periodos(idCartera: Int): Result<List<PeriodoCartera>> =
        try {
            Result.success(carterasApi.periodos(idCartera).data.map { it.aPeriodo() })
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun carterasConFiltros(
        estado: String?,
        tipo: String?,
        rol: String?,
        busqueda: String?
    ): Result<List<Cartera>> =
        try {
            val respuesta = carterasApi.listar(estado, tipo, rol, busqueda)
            Result.success(respuesta.data.map { dto -> dto.aCartera() })
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun crear(
        nombre: String,
        tipo: TipoCartera,
        descripcion: String?,
        presupuestoInicial: Double,
        fechaInicio: String?,
        fechaFin: String?
    ): Result<Cartera> =
        try {
            val respuesta = carterasApi.crear(
                peticionCartera(
                    nombre, tipo, descripcion, presupuestoInicial, fechaInicio, fechaFin
                )
            )
            Result.success(respuesta.data.aCartera())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun editar(
        idCartera: Int,
        nombre: String,
        tipo: TipoCartera,
        descripcion: String?,
        presupuestoInicial: Double,
        fechaInicio: String?,
        fechaFin: String?
    ): Result<Cartera> =
        try {
            val respuesta = carterasApi.editar(
                idCartera,
                peticionCartera(
                    nombre, tipo, descripcion, presupuestoInicial, fechaInicio, fechaFin
                )
            )
            Result.success(respuesta.data.aCartera())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun inactivar(idCartera: Int): Result<Cartera> =
        try {
            Result.success(carterasApi.inactivar(idCartera).data.aCartera())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun salir(idCartera: Int): Result<Unit> =
        try {
            carterasApi.salir(idCartera)
            Result.success(Unit)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun finalizar(idCartera: Int): Result<BalanceCierre> =
        try {
            Result.success(carterasApi.finalizar(idCartera).data.balance.aBalance())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    private fun peticionCartera(
        nombre: String,
        tipo: TipoCartera,
        descripcion: String?,
        presupuestoInicial: Double,
        fechaInicio: String?,
        fechaFin: String?
    ) = CrearCarteraRequest(
        nombre = nombre.trim(),
        tipo = tipo.name,
        descripcion = descripcion?.trim()?.ifBlank { null },
        presupuestoInicial = presupuestoInicial,
        fechaInicio = fechaInicio,
        fechaFin = fechaFin
    )
}
