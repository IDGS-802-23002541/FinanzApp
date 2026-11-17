package com.finanzap.features.reportes.data

import kotlinx.serialization.Serializable

// Contrato de /reportes (ver Backend_FinanzaApp/app/services/reporte_service.py).

@Serializable
data class RespuestaVistaPrevia(
    val data: Reporte = Reporte()
)

@Serializable
data class Reporte(
    val hayDatos: Boolean = false,
    val filtros: FiltrosReporte = FiltrosReporte(),
    val carteras: List<CarteraReporte> = emptyList(),
    val indicadores: IndicadoresReporte = IndicadoresReporte(),
    val graficas: GraficasReporte = GraficasReporte()
)

/** Filtros de la consulta; la API los devuelve en la respuesta con el rango ya aplicado. */
@Serializable
data class FiltrosReporte(
    val carteraId: Int? = null,
    val tipo: String? = null,
    val periodoId: Int? = null,
    val fechaInicio: String? = null,
    val fechaFin: String? = null,
    val cantidad: Int = 0
)

@Serializable
data class CarteraReporte(
    val id: Int = 0,
    val nombre: String = "",
    val tipo: String = ""
)

@Serializable
data class IndicadoresReporte(
    val totalIngresos: Double = 0.0,
    val totalGastos: Double = 0.0,
    val ahorro: Double = 0.0,
    val totalAportes: Double = 0.0,
    val movimientos: Int = 0
)

@Serializable
data class GraficasReporte(
    val gastosPorCategoria: List<GastoPorCategoria> = emptyList(),
    val ingresosVsEgresos: List<SerieMensual> = emptyList()
)

@Serializable
data class GastoPorCategoria(
    val categoria: String = "",
    val monto: Double = 0.0,
    val porcentaje: Double = 0.0
)

@Serializable
data class SerieMensual(
    val periodo: String = "",
    val ingresos: Double = 0.0,
    val gastos: Double = 0.0
)
