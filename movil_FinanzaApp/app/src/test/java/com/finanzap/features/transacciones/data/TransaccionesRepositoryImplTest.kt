package com.finanzap.features.transacciones.data

import com.finanzap.features.transacciones.TipoTransaccion
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class TransaccionesRepositoryImplTest {

    @Test
    fun `listar mapea items paginacion y totales`() = runTest {
        val repositorio = TransaccionesRepositoryImpl(ApiFalsa())

        val resultado = repositorio.listar(idCartera = 7, pagina = 2, porPagina = 20)

        assertTrue(resultado.isSuccess)
        val pagina = resultado.getOrThrow()
        assertEquals(2, pagina.pagina)
        assertEquals(3, pagina.totalPaginas)
        assertEquals(1, pagina.items.size)
        assertEquals(TipoTransaccion.GASTO, pagina.items.first().tipo)
        assertEquals("Alimentos", pagina.items.first().categoria)
        assertEquals(100.0, pagina.totalIngresos, 0.0)
        assertEquals(50.0, pagina.totalGastos, 0.0)
        assertEquals(50.0, pagina.balance, 0.0)
    }

    @Test
    fun `fallo de red se propaga`() = runTest {
        val repositorio = TransaccionesRepositoryImpl(ApiFalsa(falla = RuntimeException("sin red")))

        assertTrue(repositorio.listar(idCartera = 7).isFailure)
    }

    @Test
    fun `actualizar mapea la transaccion editada`() = runTest {
        val repositorio = TransaccionesRepositoryImpl(ApiFalsa())

        val resultado = repositorio.actualizar(
            idTransaccion = 1,
            tipo = TipoTransaccion.GASTO,
            monto = 300.0,
            fecha = "2026-11-04",
            categoriaId = 1,
            descripcion = "Editada"
        )

        assertTrue(resultado.isSuccess)
        assertEquals(300.0, resultado.getOrThrow().monto, 0.0)
    }

    @Test
    fun `eliminar devuelve exito`() = runTest {
        val repositorio = TransaccionesRepositoryImpl(ApiFalsa())

        assertTrue(repositorio.eliminar(1).isSuccess)
    }

    private class ApiFalsa(val falla: Exception? = null) : TransaccionesApi {

        override suspend fun listar(
            idCartera: Int,
            pagina: Int,
            porPagina: Int,
            periodoId: Int?
        ): RespuestaTransacciones {
            falla?.let { throw it }
            return RespuestaTransacciones(
                data = DatosTransacciones(
                    items = listOf(
                        TransaccionDto(
                            idTransaccion = 1,
                            carteraId = idCartera,
                            usuarioId = 2,
                            tipo = "GASTO",
                            monto = 50.0,
                            fecha = "2026-11-03",
                            categoria = CategoriaResumenDto(idCategoria = 1, nombre = "Alimentos"),
                            autor = AutorTransaccionDto(idUsuario = 2, nombre = "Aideé")
                        )
                    ),
                    paginacion = PaginacionTransaccionesDto(
                        pagina = pagina,
                        porPagina = porPagina,
                        total = 3,
                        totalPaginas = 3
                    ),
                    totales = TotalesPeriodoDto(
                        totalIngresos = 100.0,
                        totalGastos = 50.0,
                        balance = 50.0
                    )
                )
            )
        }

        override suspend fun crear(
            idCartera: Int,
            peticion: CrearTransaccionRequest
        ): RespuestaTransaccionCreada {
            falla?.let { throw it }
            return RespuestaTransaccionCreada(
                data = DatosTransaccionCreada(
                    transaccion = TransaccionDto(
                        idTransaccion = 1,
                        carteraId = idCartera,
                        usuarioId = 2,
                        tipo = peticion.tipo,
                        monto = peticion.monto,
                        fecha = peticion.fecha,
                        descripcion = peticion.descripcion
                    )
                )
            )
        }

        override suspend fun actualizar(
            idTransaccion: Int,
            peticion: CrearTransaccionRequest
        ): RespuestaTransaccionCreada {
            falla?.let { throw it }
            return RespuestaTransaccionCreada(
                data = DatosTransaccionCreada(
                    transaccion = TransaccionDto(
                        idTransaccion = idTransaccion,
                        carteraId = 7,
                        usuarioId = 2,
                        tipo = peticion.tipo,
                        monto = peticion.monto,
                        fecha = peticion.fecha,
                        descripcion = peticion.descripcion
                    )
                )
            )
        }

        override suspend fun eliminar(idTransaccion: Int): RespuestaTransaccionEliminada {
            falla?.let { throw it }
            return RespuestaTransaccionEliminada(
                data = DatosTransaccionEliminada(
                    idTransaccion = idTransaccion,
                    estado = "ELIMINADO"
                )
            )
        }
    }
}
