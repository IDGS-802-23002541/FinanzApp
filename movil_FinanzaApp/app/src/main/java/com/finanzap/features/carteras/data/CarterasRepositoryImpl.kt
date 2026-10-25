package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.data.dto.CrearCarteraRequest
import com.finanzap.features.carteras.data.dto.aCartera
import com.finanzap.features.carteras.model.Cartera
import com.finanzap.features.carteras.model.TipoCartera
import javax.inject.Inject
import kotlinx.coroutines.CancellationException

/**
 * Mientras el backend no expone GET /carteras (tarea #121), el listado muestra solo las
 * carteras creadas en esta sesión, como pide HU-03.1 CA3. Al existir el endpoint solo
 * cambia el cuerpo de [carteras]; la firma y las pantallas no.
 */
class CarterasRepositoryImpl @Inject constructor(
    private val carterasApi: CarterasApi
) : CarterasRepository {

    private val creadas = mutableListOf<Cartera>()

    override suspend fun carteras(): Result<List<Cartera>> = Result.success(creadas)

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
