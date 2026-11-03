package com.finanzap.core.storage

/** Doble en memoria para pruebas de autenticación y red. */
class SesionLocalFalsa(
    var access: String? = null,
    var refresh: String? = null
) : SesionLocal {

    var limpiezas = 0

    override fun guardarSesion(accessToken: String, refreshToken: String) {
        access = accessToken
        refresh = refreshToken
    }

    override fun guardarAccessToken(accessToken: String) {
        access = accessToken
    }

    override fun accessToken(): String? = access

    override fun refreshToken(): String? = refresh

    override fun haySesion(): Boolean = !access.isNullOrBlank() && !refresh.isNullOrBlank()

    override fun limpiar() {
        access = null
        refresh = null
        limpiezas++
    }
}
