package com.finanzap.features.pagos.data

/**
 * Contrato del módulo de pagos recurrentes consumido por el ViewModel.
 * La implementación real está en [PagosRepositoryImpl]; en las pruebas se sustituye por un doble.
 */
interface PagosRepository {

    suspend fun listar(
        carteraId: Int,
        pagina: Int = 1,
        porPagina: Int = 20
    ): Result<ListadoPagos>

    suspend fun crear(
        carteraId: Int,
        nombre: String,
        monto: Double,
        frecuencia: String,
        fechaInicio: String,
        fechaFin: String?,
        descripcion: String?
    ): Result<PagoRecurrente>

    suspend fun actualizar(
        idPago: Int,
        nombre: String,
        monto: Double,
        frecuencia: String,
        fechaInicio: String,
        fechaFin: String?,
        descripcion: String?
    ): Result<PagoRecurrente>

    suspend fun cancelar(idPago: Int): Result<PagoRecurrente>

    suspend fun marcarHecho(idPago: Int, fechaProgramada: String?): Result<Unit>
}
