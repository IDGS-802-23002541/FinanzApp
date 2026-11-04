package com.finanzap.features.transacciones.data

import com.finanzap.features.transacciones.Categoria

interface CategoriasRepository {

    suspend fun crear(idCartera: Int, nombre: String): Result<Categoria>
}
