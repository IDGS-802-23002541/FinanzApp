package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.model.Cartera
import com.finanzap.features.carteras.model.RolEnCartera
import com.finanzap.features.carteras.model.TipoCartera
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Datos de ejemplo mientras el backend no expone GET /carteras (HU #46 / #47).
 * Al existir el endpoint solo se reemplaza el cuerpo: la firma y la pantalla no cambian.
 */
@Singleton
class CarterasRepository @Inject constructor() {

    suspend fun carteras(): Result<List<Cartera>> = Result.success(
        listOf(
            Cartera(
                id = 1,
                nombre = "Casa Borja",
                tipo = TipoCartera.HOGAR,
                rol = RolEnCartera.PROPIETARIO,
                descripcion = "Gastos del hogar: despensa, servicios y mantenimiento."
            ),
            Cartera(
                id = 2,
                nombre = "Viaje a Cancún",
                tipo = TipoCartera.VIAJE,
                rol = RolEnCartera.PROPIETARIO,
                descripcion = "Anticipos de vuelos, hospedaje y gastos del viaje de fin de semestre.",
                fechaInicio = "2026-11-10",
                fechaFin = "2026-11-17"
            ),
            Cartera(
                id = 3,
                nombre = "Boda Ana & Luis",
                tipo = TipoCartera.EVENTO,
                rol = RolEnCartera.COLABORADOR,
                administrador = "Aideé Vanessa C.",
                inicialesAdministrador = "AC",
                miPagado = 8860.0,
                miCuota = 22673.0,
                miSaldo = -13813.0,
                avancePresupuesto = 80
            ),
            Cartera(
                id = 4,
                nombre = "Casa de la Abuela",
                tipo = TipoCartera.HOGAR,
                rol = RolEnCartera.COLABORADOR,
                administrador = "Vanessa Yassmin R.",
                inicialesAdministrador = "VR",
                miPagado = 20960.0,
                miCuota = 14000.0,
                miSaldo = 6960.0,
                avancePresupuesto = 80
            ),
            Cartera(
                id = 5,
                nombre = "Posada Equipo IDGS",
                tipo = TipoCartera.EVENTO,
                rol = RolEnCartera.COLABORADOR,
                administrador = "Ricardo Alonso M.",
                inicialesAdministrador = "RM",
                miPagado = 2690.0,
                miCuota = 3954.0,
                miSaldo = -1264.0,
                avancePresupuesto = 82
            )
        )
    )
}
