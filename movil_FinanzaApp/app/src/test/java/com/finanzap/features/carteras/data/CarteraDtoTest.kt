package com.finanzap.features.carteras.data

import com.finanzap.features.carteras.RolEnCartera
import com.finanzap.features.carteras.TipoCartera
import org.junit.Assert.assertEquals
import org.junit.Test

class CarteraDtoTest {

    @Test
    fun `mapea tipo y rol conocidos`() {
        val cartera = CarteraDto(id = 7, nombre = "Casa", tipo = "HOGAR").aCartera()

        assertEquals(7, cartera.id)
        assertEquals("Casa", cartera.nombre)
        assertEquals(TipoCartera.HOGAR, cartera.tipo)
        assertEquals(RolEnCartera.PROPIETARIO, cartera.rol)
    }

    @Test
    fun `tipo desconocido cae en otro y rol colaborador se conserva`() {
        val cartera = CarteraDto(
            id = 8,
            nombre = "Fiesta",
            tipo = "DESCONOCIDO",
            rol = "COLABORADOR"
        ).aCartera()

        assertEquals(TipoCartera.OTRO, cartera.tipo)
        assertEquals(RolEnCartera.COLABORADOR, cartera.rol)
    }
}
