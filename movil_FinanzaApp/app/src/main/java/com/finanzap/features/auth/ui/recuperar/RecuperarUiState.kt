package com.finanzap.features.auth.ui.recuperar

enum class PasoRecuperacion {
    SOLICITUD,
    CODIGO
}

data class RecuperarUiState(
    val paso: PasoRecuperacion = PasoRecuperacion.SOLICITUD,
    val correo: String = "",
    val codigo: String = "",
    val contrasena: String = "",
    val confirmarContrasena: String = "",
    val contrasenaVisible: Boolean = false,
    val cargando: Boolean = false,
    val recuperacionCompletada: Boolean = false,
    // Solo llega cuando el backend corre en debug (el correo aún no se envía, tarea #219).
    val codigoDesarrollo: String? = null,
    val errorCorreo: String? = null,
    val errorCodigo: String? = null,
    val errorContrasena: String? = null,
    val errorConfirmar: String? = null,
    val errorGeneral: String? = null
)
