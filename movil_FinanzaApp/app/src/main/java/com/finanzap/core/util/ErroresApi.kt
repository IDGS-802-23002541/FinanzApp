package com.finanzap.core.util

import com.finanzap.core.network.jsonApi
import kotlinx.serialization.Serializable
import retrofit2.HttpException
import java.io.IOException

@Serializable
private data class ErrorApi(val mensaje: String = "")

/**
 * Prefiere el mensaje que manda la API en las respuestas 4xx; si no se puede leer,
 * usa el texto genérico de la pantalla.
 */
fun mensajeErrorApi(error: Throwable, porDefecto: String): String = when (error) {
    is HttpException -> {
        val cuerpo = error.response()?.errorBody()?.string()
        val mensaje = cuerpo?.let {
            runCatching { jsonApi.decodeFromString<ErrorApi>(it).mensaje }.getOrNull()
        }
        mensaje?.takeIf { it.isNotBlank() } ?: porDefecto
    }

    is IOException -> "No se pudo conectar. Revisa tu conexión."
    else -> porDefecto
}
