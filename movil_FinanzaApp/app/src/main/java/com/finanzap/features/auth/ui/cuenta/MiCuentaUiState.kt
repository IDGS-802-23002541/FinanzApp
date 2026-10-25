package com.finanzap.features.auth.ui.cuenta

enum class AccionCuenta {
    NINGUNA,
    DESACTIVAR,
    ELIMINAR
}

data class MiCuentaUiState(
    val accion: AccionCuenta = AccionCuenta.NINGUNA,
    val contrasena: String = "",
    val procesando: Boolean = false,
    val cuentaCerrada: Boolean = false,
    val errorContrasena: String? = null,
    val errorGeneral: String? = null
)
