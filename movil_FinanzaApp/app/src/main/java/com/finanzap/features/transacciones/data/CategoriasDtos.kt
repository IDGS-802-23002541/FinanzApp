package com.finanzap.features.transacciones.data

import com.finanzap.features.transacciones.Categoria
import kotlinx.serialization.Serializable

@Serializable
data class CrearCategoriaRequest(
    val nombre: String,
    val tipo: String = "AMBOS"
)

@Serializable
data class RespuestaCategoria(
    val data: CategoriaDto
)

@Serializable
data class RespuestaCategorias(
    val data: List<CategoriaDto> = emptyList()
)

@Serializable
data class CategoriaDto(
    val idCategoria: Int,
    val carteraId: Int? = null,
    val nombre: String,
    val tipo: String = "AMBOS",
    val orden: Int = 0,
    val estado: String = "ACTIVA"
)

fun CategoriaDto.aCategoria(): Categoria = Categoria(
    id = idCategoria,
    carteraId = carteraId,
    nombre = nombre,
    tipo = tipo,
    orden = orden,
    estado = estado
)
