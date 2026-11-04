package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.Cartera
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

    override suspend fun detalle(idCartera: Int): Result<Cartera> =
        try {
            Result.success(carterasApi.detalle(idCartera).data.aCartera())
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
                CrearCarteraRequest(
                    nombre = nombre.trim(),
                    tipo = tipo.name,
                    descripcion = descripcion?.trim()?.ifBlank { null },
                    presupuestoInicial = presupuestoInicial,
                    fechaInicio = fechaInicio,
                    fechaFin = fechaFin
                )
            )
            val creada = respuesta.data.aCartera()
            Result.success(creada)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }
}
