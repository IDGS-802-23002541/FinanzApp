package com.finanzap.features.transacciones.data

import com.finanzap.features.transacciones.PaginaTransacciones
import com.finanzap.features.transacciones.TipoTransaccion
import com.finanzap.features.transacciones.Transaccion

interface TransaccionesRepository {

    suspend fun listar(
        idCartera: Int,
        pagina: Int = 1,
        porPagina: Int = 20,
        periodoId: Int? = null
    ): Result<PaginaTransacciones>

    suspend fun crear(
        idCartera: Int,
        tipo: TipoTransaccion,
        monto: Double,
        fecha: String,
        categoriaId: Int?,
        descripcion: String?
    ): Result<Transaccion>

    suspend fun actualizar(
        idTransaccion: Int,
        tipo: TipoTransaccion,
        monto: Double,
        fecha: String,
        categoriaId: Int?,
        descripcion: String?
    ): Result<Transaccion>

    suspend fun eliminar(idTransaccion: Int): Result<Unit>
}
