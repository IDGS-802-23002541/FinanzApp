package com.finanzap.features.transacciones.data

import com.finanzap.features.transacciones.Categoria

interface CategoriasRepository {

    suspend fun listar(idCartera: Int, tipo: String? = null): Result<List<Categoria>>

    suspend fun crear(idCartera: Int, nombre: String): Result<Categoria>
}
