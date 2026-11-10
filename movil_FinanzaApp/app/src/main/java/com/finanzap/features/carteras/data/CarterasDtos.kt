package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.Cartera
import com.finanzap.features.carteras.CarteraDetalle
import com.finanzap.features.carteras.ColaboradorCartera
import com.finanzap.features.carteras.PeriodoCartera
import com.finanzap.features.carteras.ResumenCartera
import com.finanzap.features.carteras.RolEnCartera
import com.finanzap.features.carteras.SerieCategoria
import com.finanzap.features.carteras.SeriePeriodo
import com.finanzap.features.carteras.SeriesCartera
import com.finanzap.features.carteras.TipoCartera
import kotlinx.serialization.Serializable

// Contrato de /carteras (ver Backend_FinanzaApp/openapi.yaml).
@Serializable
data class CrearCarteraRequest(
    val nombre: String,
    val tipo: String,
    val descripcion: String? = null,
    val presupuestoInicial: Double = 0.0,
    val fechaInicio: String? = null,
    val fechaFin: String? = null
)

@Serializable
data class RespuestaCartera(
    val data: CarteraDto
)

@Serializable
data class RespuestaListaCarteras(
    val data: List<CarteraDto> = emptyList()
)

@Serializable
data class RespuestaPeriodos(
    val data: List<PeriodoDto> = emptyList()
)

@Serializable
data class PeriodoDto(
    val idPeriodo: Int,
    val nombre: String = "",
    val fechaInicio: String? = null,
    val fechaFin: String? = null,
    val estado: String = "ABIERTO"
)

@Serializable
data class CarteraDto(
    val id: Int,
    val nombre: String,
    val tipo: String,
    val rol: String = "PROPIETARIO",
    val estado: String = "ACTIVA",
    val descripcion: String? = null,
    val administrador: String? = null,
    val inicialesAdministrador: String? = null,
    val presupuestoInicial: Double = 0.0,
    val miPagado: Double = 0.0,
    val miCuota: Double = 0.0,
    val miSaldo: Double = 0.0,
    val avancePresupuesto: Int = 0,
    val fechaInicio: String? = null,
    val fechaFin: String? = null,
    val resumen: ResumenCarteraDto? = null,
    val series: SeriesCarteraDto? = null,
    val colaboradores: List<ColaboradorDto> = emptyList()
)

@Serializable
data class ColaboradorDto(
    val idUsuario: Int = 0,
    val nombre: String = "",
    val iniciales: String = "",
    val rol: String = "COLABORADOR"
)

@Serializable
data class ResumenCarteraDto(
    val presupuestoInicial: Double = 0.0,
    val totalIngresos: Double = 0.0,
    val totalGastos: Double = 0.0,
    val saldo: Double = 0.0
)

@Serializable
data class SeriesCarteraDto(
    val ingresosVsEgresos: List<SeriePeriodoDto> = emptyList(),
    val gastosPorCategoria: List<SerieCategoriaDto> = emptyList()
)

@Serializable
data class SeriePeriodoDto(
    val periodoId: Int? = null,
    val nombre: String = "",
    val fechaInicio: String? = null,
    val fechaFin: String? = null,
    val ingresos: Double = 0.0,
    val gastos: Double = 0.0
)

@Serializable
data class SerieCategoriaDto(
    val categoriaId: Int? = null,
    val nombre: String = "",
    val total: Double = 0.0
)

fun PeriodoDto.aPeriodo(): PeriodoCartera = PeriodoCartera(
    id = idPeriodo,
    nombre = nombre,
    fechaInicio = fechaInicio,
    fechaFin = fechaFin,
    estado = estado
)

fun CarteraDto.aCartera(): Cartera = Cartera(
    id = id,
    nombre = nombre,
    tipo = TipoCartera.entries.firstOrNull { it.name == tipo } ?: TipoCartera.OTRO,
    rol = if (rol == "COLABORADOR") RolEnCartera.COLABORADOR else RolEnCartera.PROPIETARIO,
    estado = estado,
    descripcion = descripcion,
    administrador = administrador,
    inicialesAdministrador = inicialesAdministrador,
    presupuestoInicial = presupuestoInicial,
    miPagado = miPagado,
    miCuota = miCuota,
    miSaldo = miSaldo,
    avancePresupuesto = avancePresupuesto,
    fechaInicio = fechaInicio,
    fechaFin = fechaFin
)

fun CarteraDto.aCarteraDetalle(): CarteraDetalle {
    val resumenApi = resumen
    val seriesApi = series
    return CarteraDetalle(
        cartera = aCartera(),
        resumen = ResumenCartera(
            presupuestoInicial = resumenApi?.presupuestoInicial ?: presupuestoInicial,
            totalIngresos = resumenApi?.totalIngresos ?: 0.0,
            totalGastos = resumenApi?.totalGastos ?: 0.0,
            saldo = resumenApi?.saldo ?: 0.0
        ),
        series = SeriesCartera(
            ingresosVsEgresos = seriesApi?.ingresosVsEgresos.orEmpty().map {
                SeriePeriodo(
                    periodoId = it.periodoId,
                    nombre = it.nombre,
                    fechaInicio = it.fechaInicio,
                    fechaFin = it.fechaFin,
                    ingresos = it.ingresos,
                    gastos = it.gastos
                )
            },
            gastosPorCategoria = seriesApi?.gastosPorCategoria.orEmpty().map {
                SerieCategoria(
                    categoriaId = it.categoriaId,
                    nombre = it.nombre,
                    total = it.total
                )
            }
        ),
        colaboradores = colaboradores.map {
            ColaboradorCartera(
                idUsuario = it.idUsuario,
                nombre = it.nombre,
                iniciales = it.iniciales,
                rol = it.rol
            )
        }
    )
}