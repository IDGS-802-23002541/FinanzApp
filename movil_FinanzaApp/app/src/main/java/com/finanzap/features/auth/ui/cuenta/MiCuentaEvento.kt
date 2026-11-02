package com.finanzap.features.auth.ui.cuenta

/** Acciones de una sola vez que la pantalla de cuenta debe ejecutar. */
sealed interface MiCuentaEvento {
    data object CuentaCerrada : MiCuentaEvento
}
