package com.finanzap.features.carteras

data class CarteraDetalle(
    val cartera: Cartera,
    val resumen: ResumenCartera,
    val series: SeriesCartera,
    val colaboradores: List<ColaboradorCartera> = emptyList()
)

data class ColaboradorCartera(
    val idUsuario: Int,
    val nombre: String,
    val iniciales: String,
    val rol: String
)

data class ResumenCartera(
    val presupuestoInicial: Double = 0.0,
    val totalIngresos: Double = 0.0,
    val totalGastos: Double = 0.0,
    val saldo: Double = 0.0
)

data class PeriodoCartera(
    val id: Int,
    val nombre: String,
    val fechaInicio: String?,
    val fechaFin: String?,
    val estado: String
)

data class SeriesCartera(
    val ingresosVsEgresos: List<SeriePeriodo> = emptyList(),
    val gastosPorCategoria: List<SerieCategoria> = emptyList()
)

data class SeriePeriodo(
    val periodoId: Int?,
    val nombre: String,
    val fechaInicio: String?,
    val fechaFin: String?,
    val ingresos: Double,
    val gastos: Double
)

data class SerieCategoria(
    val categoriaId: Int?,
    val nombre: String,
    val total: Double
)
