package com.finanzap.features.auth.data.dto

import kotlinx.serialization.Serializable

// Confirmación con contraseña para desactivar o eliminar la cuenta.
// La API usa "contrasenia" (ver openapi.yaml); en el resto de la app se escribe "contrasena".
@Serializable
data class ConfirmacionCuentaRequest(
    val contrasenia: String
)
