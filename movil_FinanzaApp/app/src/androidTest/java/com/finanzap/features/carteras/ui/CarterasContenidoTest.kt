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
                    temaOscuro = false,
                    acciones = CarterasAcciones(
                        onAlternarTema = {},
                        onNuevaCartera = {},
                        onCuenta = {},
                        onCerrarSesion = {},
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
                    temaOscuro = false,
                    acciones = CarterasAcciones(
                        onAlternarTema = {},
                        onNuevaCartera = { creada = true },
                        onCuenta = {},
                        onCerrarSesion = {},
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
