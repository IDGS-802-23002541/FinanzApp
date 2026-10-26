package com.finanzap.features.auth.ui.cuenta

data class CambiarContrasenaUiState(
    val actual: String = "",
    val nueva: String = "",
    val confirmar: String = "",
    val visibles: Boolean = false,
    val guardando: Boolean = false,
    val cambioCompletado: Boolean = false,
    val errorActual: String? = null,
    val errorNueva: String? = null,
    val errorConfirmar: String? = null,
    val errorGeneral: String? = null
)
