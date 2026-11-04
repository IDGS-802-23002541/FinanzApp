package com.finanzap.features.transacciones.data

import com.finanzap.features.transacciones.Categoria
import javax.inject.Inject
import kotlinx.coroutines.CancellationException

class CategoriasRepositoryImpl @Inject constructor(
    private val categoriasApi: CategoriasApi
) : CategoriasRepository {

    override suspend fun crear(idCartera: Int, nombre: String): Result<Categoria> =
        try {
            val respuesta = categoriasApi.crear(
                idCartera = idCartera,
                peticion = CrearCategoriaRequest(nombre = nombre.trim())
            )
            Result.success(respuesta.data.aCategoria())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }
}
