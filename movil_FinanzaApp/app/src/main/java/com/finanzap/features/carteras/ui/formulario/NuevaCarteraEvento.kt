package com.finanzap.features.carteras.ui.formulario

/** Acciones de una sola vez que la pantalla de nueva cartera debe ejecutar. */
sealed interface NuevaCarteraEvento {
    data object CarteraCreada : NuevaCarteraEvento
}
