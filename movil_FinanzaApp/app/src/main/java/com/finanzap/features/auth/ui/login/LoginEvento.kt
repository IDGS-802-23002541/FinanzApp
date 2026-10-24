package com.finanzap.features.auth.ui.login

/** Acciones de una sola vez que la pantalla de login debe ejecutar. */
sealed interface LoginEvento {
    data object IrACarteras : LoginEvento
}
