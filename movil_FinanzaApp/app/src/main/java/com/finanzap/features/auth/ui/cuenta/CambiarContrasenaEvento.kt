package com.finanzap.features.auth.ui.cuenta

/** Acciones de una sola vez que la pantalla de cambio de contraseña debe ejecutar. */
sealed interface CambiarContrasenaEvento {
    data object ContrasenaCambiada : CambiarContrasenaEvento
}
