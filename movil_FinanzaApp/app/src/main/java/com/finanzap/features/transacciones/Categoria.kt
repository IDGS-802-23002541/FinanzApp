package com.finanzap.features.transacciones

data class Categoria(
    val id: Int,
    val carteraId: Int?,
    val nombre: String,
    val tipo: String,
    val orden: Int,
    val estado: String
)
