package com.finanzap.core.navigation

data class MainUiState(
    val cargando: Boolean = true,
    val haySesion: Boolean = false,
    val temaOscuro: Boolean? = null
)

/** Acciones de una sola vez que resuelve la navegación raíz. */
sealed interface MainEvento {
    data object IrALogin : MainEvento
}
