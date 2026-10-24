package com.finanzap.features.carteras.ui.dashboard

import com.finanzap.features.carteras.model.Cartera
import com.finanzap.features.carteras.model.TipoCartera

enum class Segmento {
    MIS,
    COMPARTIDAS
}

data class CarterasUiState(
    val cargando: Boolean = true,
    val error: String? = null,
    val segmento: Segmento = Segmento.MIS,
    val tipo: TipoCartera? = null,
    val busqueda: String = "",
    val carteras: List<Cartera> = emptyList(),
    val totalMis: Int = 0,
    val totalCompartidas: Int = 0
)
