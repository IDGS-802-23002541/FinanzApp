package com.finanzap.features.carteras.data.dto

import com.finanzap.features.carteras.model.Cartera
import com.finanzap.features.carteras.model.RolEnCartera
import com.finanzap.features.carteras.model.TipoCartera
import kotlinx.serialization.Serializable

// Contrato de POST /carteras (ver Backend_FinanzaApp/openapi.yaml).
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
    val ok: Boolean = true,
    val data: CarteraDto,
    val mensaje: String = ""
)

@Serializable
data class RespuestaListaCarteras(
    val ok: Boolean = true,
    val data: List<CarteraDto> = emptyList(),
    val mensaje: String = ""
)

@Serializable
data class CarteraDto(
    val id: Int,
    val nombre: String,
    val tipo: String,
    val rol: String = "PROPIETARIO",
    val descripcion: String? = null,
    val administrador: String? = null,
    val inicialesAdministrador: String? = null,
    val miPagado: Double = 0.0,
    val miCuota: Double = 0.0,
    val miSaldo: Double = 0.0,
    val avancePresupuesto: Int = 0,
    val fechaInicio: String? = null,
    val fechaFin: String? = null
)

fun CarteraDto.aCartera(): Cartera = Cartera(
    id = id,
    nombre = nombre,
    tipo = TipoCartera.entries.firstOrNull { it.name == tipo } ?: TipoCartera.OTRO,
    rol = if (rol == "COLABORADOR") RolEnCartera.COLABORADOR else RolEnCartera.PROPIETARIO,
    descripcion = descripcion,
    administrador = administrador,
    inicialesAdministrador = inicialesAdministrador,
    miPagado = miPagado,
    miCuota = miCuota,
    miSaldo = miSaldo,
    avancePresupuesto = avancePresupuesto,
    fechaInicio = fechaInicio,
    fechaFin = fechaFin
)
