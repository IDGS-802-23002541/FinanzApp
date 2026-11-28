package com.finanzap.features.pagos.data

import kotlinx.serialization.Serializable

// Contrato de /pagos-recurrentes (ver Backend_FinanzaApp/app/services/pago_service.py).

/** Frecuencias que acepta la API de pagos recurrentes. */
val FRECUENCIAS_PAGO = listOf("DIARIO", "SEMANAL", "MENSUAL", "ANUAL")

@Serializable
data class CrearPagoRequest(
    val carteraId: Int,
    val nombre: String,
    val monto: Double,
    val frecuencia: String,
    val fechaInicio: String,
    val descripcion: String?,
    val fechaFin: String?,
    val categoriaId: Int? = null
)

@Serializable
data class EditarPagoRequest(
    val nombre: String,
    val monto: Double,
    val frecuencia: String,
    val fechaInicio: String,
    val descripcion: String?,
    val fechaFin: String?,
    val categoriaId: Int? = null
)

@Serializable
data class MarcarHechoRequest(
    val fechaProgramada: String? = null
)

@Serializable
data class RespuestaPago(
    val data: DatosPago = DatosPago()
)

@Serializable
data class DatosPago(
    val pago: PagoDto = PagoDto()
)

@Serializable
data class RespuestaPagos(
    val data: DatosPagos = DatosPagos()
)

@Serializable
data class DatosPagos(
    val pagos: List<PagoDto> = emptyList(),
    val paginacion: PaginacionPagosDto = PaginacionPagosDto()
)

@Serializable
data class PaginacionPagosDto(
    val pagina: Int = 1,
    val porPagina: Int = 20,
    val total: Int = 0,
    val totalPaginas: Int = 0
)

@Serializable
data class PagoDto(
    val idPagoRecurrente: Int = 0,
    val carteraId: Int = 0,
    val categoriaId: Int? = null,
    val nombre: String = "",
    val descripcion: String? = null,
    val monto: Double = 0.0,
    val frecuencia: String = "MENSUAL",
    val fechaInicio: String? = null,
    val fechaFin: String? = null,
    val proximaEjecucion: String? = null,
    val ultimaEjecucion: EjecucionDto? = null,
    val estado: String = "ACTIVO"
)

@Serializable
data class RespuestaHecho(
    val data: DatosEjecucion = DatosEjecucion()
)

@Serializable
data class DatosEjecucion(
    val ejecucion: EjecucionDto = EjecucionDto()
)

@Serializable
data class EjecucionDto(
    val idEjecucion: Int = 0,
    val pagoRecurrenteId: Int = 0,
    val transaccionId: Int? = null,
    val fechaProgramada: String = "",
    val monto: Double = 0.0,
    val estado: String = ""
)

/** Pago recurrente tal como lo muestra la pantalla. */
data class PagoRecurrente(
    val id: Int,
    val carteraId: Int,
    val categoriaId: Int?,
    val nombre: String,
    val descripcion: String?,
    val monto: Double,
    val frecuencia: String,
    val fechaInicio: String?,
    val fechaFin: String?,
    val proximaEjecucion: String?,
    val ultimaEjecucion: String?,
    val estado: String
)

data class ListadoPagos(
    val pagos: List<PagoRecurrente>,
    val pagina: Int,
    val totalPaginas: Int
)

fun PagoDto.aPagoRecurrente(): PagoRecurrente = PagoRecurrente(
    id = idPagoRecurrente,
    carteraId = carteraId,
    categoriaId = categoriaId,
    nombre = nombre,
    descripcion = descripcion,
    monto = monto,
    frecuencia = frecuencia,
    fechaInicio = fechaInicio,
    fechaFin = fechaFin,
    proximaEjecucion = proximaEjecucion,
    ultimaEjecucion = ultimaEjecucion?.fechaProgramada,
    estado = estado
)
