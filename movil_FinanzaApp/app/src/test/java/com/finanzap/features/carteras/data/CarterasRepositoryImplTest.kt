package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.data.dto.CarteraDto
import com.finanzap.features.carteras.data.dto.CrearCarteraRequest
import com.finanzap.features.carteras.data.dto.RespuestaCartera
import com.finanzap.features.carteras.data.dto.RespuestaListaCarteras
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class CarterasRepositoryImplTest {

    @Test
    fun `carteras usa GET y mapea dto`() = runTest {
        val api = ApiFalsa()
        val repo = CarterasRepositoryImpl(api)

        val resultado = repo.carterasConFiltros(estado = "ACTIVA", busqueda = "Casa")

        assertTrue(resultado.isSuccess)
        assertEquals(1, resultado.getOrThrow().size)
        assertEquals("ACTIVA", api.ultimoEstado)
        assertEquals("Casa", api.ultimaBusqueda)
    }

    @Test
    fun `fallo de red se propaga`() = runTest {
        val api = ApiFalsa(falla = RuntimeException("sin red"))
        val repo = CarterasRepositoryImpl(api)

        val resultado = repo.carteras()

        assertTrue(resultado.isFailure)
    }

    private class ApiFalsa(val falla: Exception? = null) : CarterasApi {
        var ultimoEstado: String? = "sin asignar"
        var ultimaBusqueda: String? = "sin asignar"

        override suspend fun crear(peticion: CrearCarteraRequest): RespuestaCartera =
            throw UnsupportedOperationException()

        override suspend fun listar(
            estado: String?,
            tipo: String?,
            rol: String?,
            busqueda: String?
        ): RespuestaListaCarteras {
            falla?.let { throw it }
            ultimoEstado = estado
            ultimaBusqueda = busqueda
            return RespuestaListaCarteras(
                data = listOf(
                    CarteraDto(id = 1, nombre = "Casa", tipo = "HOGAR")
                )
            )
        }
    }
}
