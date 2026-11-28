package com.finanzap.core.navigation

import android.net.Uri

object Rutas {
    const val Login = "login"
    const val RecuperarContrasena = "recuperar"
    const val Carteras = "carteras"
    const val NuevaCartera = "carteras/nueva"
    const val EditarCartera = "carteras/detalle/{carteraId}/editar"
    const val CarteraDetalle = "carteras/detalle/{carteraId}"
    const val UnirseCartera = "carteras/unirse"
    const val Transacciones =
        "carteras/detalle/{carteraId}/transacciones?nombre={nombre}&puedeEditar={puedeEditar}"
    const val NuevaTransaccion = "transacciones/nueva/{carteraId}?nombre={nombre}"
    const val Pagos =
        "carteras/detalle/{carteraId}/pagos?nombre={nombre}&puedeEditar={puedeEditar}&puedeMarcar={puedeMarcar}"
    const val MiCuenta = "cuenta"
    const val EditarCuenta = "cuenta/editar"
    const val PreferenciasNotificacion = "cuenta/preferencias"
    const val CambiarContrasena = "cuenta/contrasena"
    const val Reportes = "reportes"
    const val Soporte = "soporte"
    const val Notificaciones = "notificaciones"

    fun nuevaTransaccion(carteraId: Int, nombre: String): String =
        "transacciones/nueva/$carteraId?nombre=${Uri.encode(nombre)}"

    fun carteraDetalle(carteraId: Int): String = "carteras/detalle/$carteraId"

    fun editarCartera(carteraId: Int): String = "carteras/detalle/$carteraId/editar"

    fun transacciones(carteraId: Int, nombre: String, puedeEditar: Boolean): String =
        "carteras/detalle/$carteraId/transacciones" +
            "?nombre=${Uri.encode(nombre)}&puedeEditar=$puedeEditar"

    fun pagos(
        carteraId: Int,
        nombre: String,
        puedeEditar: Boolean,
        puedeMarcar: Boolean
    ): String =
        "carteras/detalle/$carteraId/pagos" +
            "?nombre=${Uri.encode(nombre)}&puedeEditar=$puedeEditar" +
            "&puedeMarcar=$puedeMarcar"
}
