package com.finanzap.features.carteras.ui.formulario

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.finanzap.core.ui.theme.FinanzAppTheme
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class NuevaCarteraContenidoTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun muestraErroresDeNombreYTipo() {
        composeRule.setContent {
            FinanzAppTheme {
                NuevaCarteraContenido(
                    state = NuevaCarteraUiState(
                        errorNombre = "El nombre es obligatorio.",
                        errorTipo = "Elige el tipo de cartera."
                    ),
                    onVolver = {},
                    onNombreChange = {},
                    onTipoChange = {},
                    onDescripcionChange = {},
                    onPresupuestoChange = {},
                    onFechaInicioChange = {},
                    onFechaFinChange = {},
                    onGuardar = {}
                )
            }
        }

        composeRule.onNodeWithText("El nombre es obligatorio.").assertIsDisplayed()
        composeRule.onNodeWithText("Elige el tipo de cartera.").assertIsDisplayed()
    }

    @Test
    fun botonInvocaGuardar() {
        var guardado = false
        composeRule.setContent {
            FinanzAppTheme {
                NuevaCarteraContenido(
                    state = NuevaCarteraUiState(nombre = "Casa Borja"),
                    onVolver = {},
                    onNombreChange = {},
                    onTipoChange = {},
                    onDescripcionChange = {},
                    onPresupuestoChange = {},
                    onFechaInicioChange = {},
                    onFechaFinChange = {},
                    onGuardar = { guardado = true }
                )
            }
        }

        composeRule.onNodeWithText("Crear cartera").performClick()

        assertTrue(guardado)
    }
}
