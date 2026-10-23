package com.finanzap.features.auth.ui.login

// Estado de la pantalla de inicio de sesión.
data class LoginUiState(
    val correo: String = "",
    val contrasena: String = "",
    val contrasenaVisible: Boolean = false,
    val cargando: Boolean = false,
    val errorCorreo: String? = null,
    val errorContrasena: String? = null,
    val error: String? = null,
    val loginExitoso: Boolean = false
)
