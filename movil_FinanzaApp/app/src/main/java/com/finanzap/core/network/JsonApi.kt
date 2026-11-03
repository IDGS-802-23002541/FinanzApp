package com.finanzap.core.network

import kotlinx.serialization.json.Json

/**
 * Configuración única de kotlinx.serialization.
 * La comparten Retrofit y el lector de errores de la API.
 */
val jsonApi = Json {
    ignoreUnknownKeys = true
}
