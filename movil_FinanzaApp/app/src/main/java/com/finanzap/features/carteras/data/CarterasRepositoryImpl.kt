package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.data.dto.CrearCarteraRequest
import com.finanzap.features.carteras.data.dto.aCartera
import com.finanzap.features.carteras.model.Cartera
import com.finanzap.features.carteras.model.TipoCartera
import javax.inject.Inject
import kotlinx.coroutines.CancellationException

/**
 * Lista desde GET /carteras; lo creado en sesión se conserva en memoria
 * para HU-03.1 CA3 mientras el backend lo devuelve.
 */
class CarterasRepositoryImpl @Inject constructor(
    private val carterasApi: CarterasApi
) : CarterasRepository {

    private val creadas = mutableListOf<Cartera>()

    override suspend fun carteras(): Result<List<Cartera>> =
        carterasConFiltros()

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
            creadas.add(0, creada)
            Result.success(creada)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }
}
