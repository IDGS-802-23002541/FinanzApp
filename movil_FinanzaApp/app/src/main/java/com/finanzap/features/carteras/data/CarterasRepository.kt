package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.model.Cartera
import com.finanzap.features.carteras.model.TipoCartera

/**
 * Contrato de carteras consumido por los ViewModel.
 * La implementación real está en [CarterasRepositoryImpl]; en las pruebas se sustituye por un doble.
 */
interface CarterasRepository {

    suspend fun carteras(): Result<List<Cartera>>

    suspend fun crear(
        nombre: String,
        tipo: TipoCartera,
        descripcion: String?,
        presupuestoInicial: Double,
        fechaInicio: String?,
        fechaFin: String?
    ): Result<Cartera>
}
