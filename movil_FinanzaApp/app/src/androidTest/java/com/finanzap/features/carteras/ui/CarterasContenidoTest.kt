package com.finanzap.features.carteras.ui

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.finanzap.core.ui.FinanzAppTheme
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class CarterasContenidoTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun muestraErrorYPermiteReintentar() {
        var reintentado = false
        composeRule.setContent {
            FinanzAppTheme {
                CarterasContenido(
                    state = CarterasUiState(
                        cargando = false,
                        error = "No se pudieron cargar tus carteras."
                    ),
                    acciones = CarterasAcciones(
                        onNuevaCartera = {},
                        onRegistrarGasto = {},
                        onSegmentoChange = {},
                        onTipoChange = {},
                        onBusquedaChange = {},
                        onReintentar = { reintentado = true }
                    )
                )
            }
        }

        composeRule.onNodeWithText("No se pudieron cargar tus carteras.").assertIsDisplayed()
        composeRule.onNodeWithText("Reintentar").performClick()

        assertTrue(reintentado)
    }

    @Test
    fun estadoVacioInvitaACrearCartera() {
        var creada = false
        composeRule.setContent {
            FinanzAppTheme {
                CarterasContenido(
                    state = CarterasUiState(cargando = false),
                    acciones = CarterasAcciones(
                        onNuevaCartera = { creada = true },
                        onRegistrarGasto = {},
                        onSegmentoChange = {},
                        onTipoChange = {},
                        onBusquedaChange = {},
                        onReintentar = {}
                    )
                )
            }
        }

        composeRule.onNodeWithText("Añade tu primera cartera").assertIsDisplayed()
        composeRule.onNodeWithText("Nueva cartera").performClick()

        assertTrue(creada)
    }
}
