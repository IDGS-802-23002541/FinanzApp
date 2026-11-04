package com.finanzap.features.transacciones

enum class TipoTransaccion {
    INGRESO,
    GASTO
}

data class Transaccion(
    val id: Int,
    val carteraId: Int,
    val tipo: TipoTransaccion,
    val monto: Double,
    val descripcion: String?,
    val categoria: String?,
    val autor: String?,
    val fecha: String?,
    val metodoPago: String?
)

data class PaginaTransacciones(
    val items: List<Transaccion>,
    val pagina: Int,
    val totalPaginas: Int,
    val total: Int,
    val totalIngresos: Double,
    val totalGastos: Double,
    val balance: Double
)
