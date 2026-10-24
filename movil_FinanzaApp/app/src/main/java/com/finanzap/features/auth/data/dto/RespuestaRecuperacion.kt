package com.finanzap.features.auth.data.dto

import kotlinx.serialization.Serializable

// Respuesta de POST /auth/recuperar (contrato en Backend_FinanzaApp/openapi.yaml).
@Serializable
data class RespuestaRecuperacion(
    val ok: Boolean = true,
    val data: DatosRecuperacion? = null,
    val mensaje: String = ""
)

// En modo debug el backend devuelve el código para probar sin correo (tarea #219).
@Serializable
data class DatosRecuperacion(
    val codigo: String? = null
)

@Serializable
data class RespuestaMensaje(
    val ok: Boolean = true,
    val mensaje: String = ""
)
