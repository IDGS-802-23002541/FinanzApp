package com.finanzap.features.auth.ui.login

// Estado de la pantalla de inicio de sesión.
data class LoginUiState(
    val correo: String = "",
    val contrasena: String = "",
    val cargando: Boolean = false,
    val error: String? = null
)
