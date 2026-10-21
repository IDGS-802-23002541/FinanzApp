package com.finanzap.features.carteras.model

// Tipos de cartera de CK_CARTERA_tipo (docs/modelo-datos.md).
enum class TipoCartera(val etiqueta: String) {
    HOGAR("Hogar"),
    VIAJE("Viaje"),
    EVENTO("Evento"),
    OTRO("Otro")
}

enum class RolEnCartera {
    PROPIETARIO,
    COLABORADOR
}

/**
 * Cartera tal como la muestra el dashboard.
 * Los campos de dinero solo se usan cuando el usuario es colaborador.
 */
data class Cartera(
    val id: Int,
    val nombre: String,
    val tipo: TipoCartera,
    val rol: RolEnCartera,
    val descripcion: String? = null,
    val administrador: String? = null,
    val inicialesAdministrador: String? = null,
    val miPagado: Double = 0.0,
    val miCuota: Double = 0.0,
    val miSaldo: Double = 0.0,
    val avancePresupuesto: Int = 0,
    val fechaInicio: String? = null,
    val fechaFin: String? = null
)
