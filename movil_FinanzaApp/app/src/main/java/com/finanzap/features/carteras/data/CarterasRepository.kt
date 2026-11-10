package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.Cartera
import com.finanzap.features.carteras.CarteraDetalle
import com.finanzap.features.carteras.PeriodoCartera
import com.finanzap.features.carteras.TipoCartera

/**
 * Contrato de carteras consumido por los ViewModel.
 * La implementación real está en [CarterasRepositoryImpl]; en las pruebas se sustituye por un doble.
 */
interface CarterasRepository {

    suspend fun carteras(): Result<List<Cartera>>

    suspend fun detalle(idCartera: Int, periodoId: Int? = null): Result<CarteraDetalle>

    suspend fun periodos(idCartera: Int): Result<List<PeriodoCartera>>

    suspend fun carterasConFiltros(
        estado: String? = null,
        tipo: String? = null,
        rol: String? = null,
        busqueda: String? = null
    ): Result<List<Cartera>>

    suspend fun crear(
        nombre: String,
        tipo: TipoCartera,
        descripcion: String?,
        presupuestoInicial: Double,
        fechaInicio: String?,
        fechaFin: String?
    ): Result<Cartera>
}
