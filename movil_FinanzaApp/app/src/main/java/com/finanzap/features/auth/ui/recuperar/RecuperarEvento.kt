package com.finanzap.features.auth.ui.recuperar

/** Acciones de una sola vez que la pantalla de recuperación debe ejecutar. */
sealed interface RecuperarEvento {
    data object ContrasenaRestablecida : RecuperarEvento
}
