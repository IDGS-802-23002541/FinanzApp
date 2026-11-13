package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.data.CarteraDto
import com.finanzap.features.carteras.TipoCartera
import com.finanzap.features.carteras.data.CrearCarteraRequest
import com.finanzap.features.carteras.data.RespuestaCartera
import com.finanzap.features.carteras.data.RespuestaListaCarteras
import com.finanzap.features.carteras.data.RespuestaPeriodos
import com.finanzap.features.carteras.data.PeriodoDto
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
    fun `periodos mapea el dto al dominio`() = runTest {
        val repo = CarterasRepositoryImpl(ApiFalsa())

        val resultado = repo.periodos(1)

        assertTrue(resultado.isSuccess)
        assertEquals("Semana 1", resultado.getOrThrow().first().nombre)
    }

    @Test
    fun `fallo de red se propaga`() = runTest {
        val api = ApiFalsa(falla = RuntimeException("sin red"))
        val repo = CarterasRepositoryImpl(api)

        val resultado = repo.carteras()

        assertTrue(resultado.isFailure)
    }

    @Test
    fun `editar manda los datos normalizados`() = runTest {
        val api = ApiFalsa()
        val repo = CarterasRepositoryImpl(api)

        val resultado = repo.editar(
            idCartera = 3,
            nombre = "  Casa  ",
            tipo = TipoCartera.VIAJE,
            descripcion = "   ",
            presupuestoInicial = 1500.0,
            fechaInicio = null,
            fechaFin = null
        )

        assertTrue(resultado.isSuccess)
        assertEquals("Casa", api.ultimoEditado?.nombre)
        assertEquals("VIAJE", api.ultimoEditado?.tipo)
        assertEquals(null, api.ultimoEditado?.descripcion)
    }

    @Test
    fun `inactivar devuelve la cartera archivada`() = runTest {
        val repo = CarterasRepositoryImpl(ApiFalsa())

        val resultado = repo.inactivar(3)

        assertTrue(resultado.isSuccess)
        assertEquals("ARCHIVADA", resultado.getOrThrow().estado)
    }

    private class ApiFalsa(val falla: Exception? = null) : CarterasApi {
        var ultimoEstado: String? = "sin asignar"
        var ultimaBusqueda: String? = "sin asignar"
        var ultimoEditado: CrearCarteraRequest? = null

        override suspend fun crear(peticion: CrearCarteraRequest): RespuestaCartera =
            throw UnsupportedOperationException()

        override suspend fun detalle(idCartera: Int, periodoId: Int?): RespuestaCartera {
            falla?.let { throw it }
            return RespuestaCartera(
                data = CarteraDto(id = idCartera, nombre = "Casa", tipo = "HOGAR")
            )
        }

        override suspend fun periodos(idCartera: Int): RespuestaPeriodos {
            falla?.let { throw it }
            return RespuestaPeriodos(
                data = listOf(
                    PeriodoDto(idPeriodo = 1, nombre = "Semana 1")
                )
            )
        }

        override suspend fun salir(idCartera: Int): RespuestaSalidaCartera {
            falla?.let { throw it }
            return RespuestaSalidaCartera()
        }

        override suspend fun editar(
            idCartera: Int,
            peticion: CrearCarteraRequest
        ): RespuestaCartera {
            falla?.let { throw it }
            ultimoEditado = peticion
            return RespuestaCartera(
                data = CarteraDto(
                    id = idCartera,
                    nombre = peticion.nombre,
                    tipo = peticion.tipo
                )
            )
        }

        override suspend fun inactivar(idCartera: Int): RespuestaCartera {
            falla?.let { throw it }
            return RespuestaCartera(
                data = CarteraDto(
                    id = idCartera,
                    nombre = "Casa",
                    tipo = "HOGAR",
                    estado = "ARCHIVADA"
                )
            )
        }

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
