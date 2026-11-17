package com.finanzap.features.reportes.data

/**
 * Contrato del módulo de reportes consumido por los ViewModel.
 * La implementación real está en [ReportesRepositoryImpl]; en las pruebas se sustituye por un doble.
 */
interface ReportesRepository {

    suspend fun vistaPrevia(filtros: FiltrosReporte): Result<Reporte>

    /** Descarga el reporte y devuelve la ruta del archivo guardado en el dispositivo. */
    suspend fun exportar(filtros: FiltrosReporte, formato: FormatoReporte): Result<String>
}

enum class FormatoReporte(val valor: String) {
    CSV("csv"),
    PDF("pdf")
}
