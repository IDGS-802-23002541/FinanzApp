package com.finanzap.features.auth.ui.recuperar

sealed interface RecuperarEvento {
    data object RecuperacionCompletada : RecuperarEvento
}
