package com.finanzap.features.transacciones.data

import com.finanzap.features.transacciones.PaginaTransacciones
import com.finanzap.features.transacciones.TipoTransaccion
import com.finanzap.features.transacciones.Transaccion
import kotlinx.serialization.Serializable

@Serializable
data class RespuestaTransacciones(
    val data: DatosTransacciones = DatosTransacciones()
)

@Serializable
data class DatosTransacciones(
    val items: List<TransaccionDto> = emptyList(),
    val paginacion: PaginacionTransaccionesDto = PaginacionTransaccionesDto(),
    val totales: TotalesPeriodoDto = TotalesPeriodoDto()
)

@Serializable
data class PaginacionTransaccionesDto(
    val pagina: Int = 1,
    val porPagina: Int = 20,
    val total: Int = 0,
    val totalPaginas: Int = 0
)

@Serializable
data class TotalesPeriodoDto(
    val totalIngresos: Double = 0.0,
    val totalGastos: Double = 0.0,
    val balance: Double = 0.0
)

@Serializable
data class TransaccionDto(
    val idTransaccion: Int,
    val carteraId: Int,
    val usuarioId: Int,
    val categoriaId: Int? = null,
    val tipo: String,
    val monto: Double,
    val descripcion: String? = null,
    val metodoPago: String? = null,
    val comprobanteUrl: String? = null,
    val estado: String = "ACTIVO",
    val fecha: String? = null,
    val categoria: CategoriaResumenDto? = null,
    val autor: AutorTransaccionDto? = null
)

@Serializable
data class CategoriaResumenDto(
    val idCategoria: Int,
    val nombre: String
)

@Serializable
data class AutorTransaccionDto(
    val idUsuario: Int,
    val nombre: String
)

@Serializable
data class CrearTransaccionRequest(
    val tipo: String,
    val monto: Double,
    val fecha: String? = null,
    val categoriaId: Int? = null,
    val descripcion: String? = null
)

@Serializable
data class RespuestaTransaccionCreada(
    val data: DatosTransaccionCreada
)

@Serializable
data class DatosTransaccionCreada(
    val transaccion: TransaccionDto,
    val resumen: ResumenTransaccionesDto = ResumenTransaccionesDto()
)

@Serializable
data class ResumenTransaccionesDto(
    val totalIngresos: Double = 0.0,
    val totalGastos: Double = 0.0,
    val saldo: Double = 0.0
)

@Serializable
data class RespuestaTransaccionEliminada(
    val data: DatosTransaccionEliminada
)

@Serializable
data class DatosTransaccionEliminada(
    val idTransaccion: Int,
    val estado: String,
    val resumen: ResumenTransaccionesDto = ResumenTransaccionesDto()
)

fun TransaccionDto.aTransaccion(): Transaccion = Transaccion(
    id = idTransaccion,
    carteraId = carteraId,
    tipo = if (tipo == "INGRESO") TipoTransaccion.INGRESO else TipoTransaccion.GASTO,
    monto = monto,
    descripcion = descripcion,
    categoriaId = categoriaId,
    categoria = categoria?.nombre,
    autor = autor?.nombre,
    fecha = fecha,
    metodoPago = metodoPago
)

fun DatosTransacciones.aPagina(): PaginaTransacciones = PaginaTransacciones(
    items = items.map { it.aTransaccion() },
    pagina = paginacion.pagina,
    totalPaginas = paginacion.totalPaginas,
    total = paginacion.total,
    totalIngresos = totales.totalIngresos,
    totalGastos = totales.totalGastos,
    balance = totales.balance
)
