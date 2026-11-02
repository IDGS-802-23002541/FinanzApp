package com.finanzap.core.storage

/**
 * Contrato del almacenamiento local de la sesión.
 * La implementación cifrada está en [SesionLocalCifrada]; en las pruebas se sustituye por un doble.
 */
interface SesionLocal {

    fun guardarSesion(accessToken: String, refreshToken: String)

    /** El access token dura 15 minutos: se reemplaza cuando el backend lo renueva. */
    fun guardarAccessToken(accessToken: String)

    fun accessToken(): String?

    fun refreshToken(): String?

    fun haySesion(): Boolean

    fun limpiar()
}
