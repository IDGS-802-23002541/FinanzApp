package com.finanzap.core.util

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import retrofit2.HttpException
import java.io.IOException

private val json = Json { ignoreUnknownKeys = true }

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
            runCatching { json.decodeFromString<ErrorApi>(it).mensaje }.getOrNull()
        }
        mensaje?.takeIf { it.isNotBlank() } ?: porDefecto
    }

    is IOException -> "No se pudo conectar. Revisa tu conexión."
    else -> porDefecto
}
