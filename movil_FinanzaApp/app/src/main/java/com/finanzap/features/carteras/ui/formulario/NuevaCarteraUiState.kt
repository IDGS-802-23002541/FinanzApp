package com.finanzap.features.carteras.ui.formulario

import com.finanzap.features.carteras.model.TipoCartera

data class NuevaCarteraUiState(
    val nombre: String = "",
    val tipo: TipoCartera? = null,
    val descripcion: String = "",
    val presupuesto: String = "",
    val fechaInicio: String? = null,
    val fechaFin: String? = null,
    val guardando: Boolean = false,
    val creada: Boolean = false,
    val errorNombre: String? = null,
    val errorTipo: String? = null,
    val errorDescripcion: String? = null,
    val errorPresupuesto: String? = null,
    val errorFechas: String? = null,
    val errorGeneral: String? = null
)
