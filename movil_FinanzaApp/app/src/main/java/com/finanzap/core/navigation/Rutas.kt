package com.finanzap.core.navigation

import android.net.Uri

object Rutas {
    const val Login = "login"
    const val RecuperarContrasena = "recuperar"
    const val Carteras = "carteras"
    const val NuevaCartera = "carteras/nueva"
    const val NuevaTransaccion = "transacciones/nueva/{carteraId}?nombre={nombre}"
    const val MiCuenta = "cuenta"
    const val CambiarContrasena = "cuenta/contrasena"
    const val Reportes = "reportes"
    const val Soporte = "soporte"

    fun nuevaTransaccion(carteraId: Int, nombre: String): String =
        "transacciones/nueva/$carteraId?nombre=${Uri.encode(nombre)}"
}
