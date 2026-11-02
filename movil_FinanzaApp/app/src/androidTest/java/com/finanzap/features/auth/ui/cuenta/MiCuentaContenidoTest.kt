package com.finanzap.features.auth.ui.cuenta

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
class MiCuentaContenidoTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun muestraConfirmacionYErrorDeContrasena() {
        composeRule.setContent {
            FinanzAppTheme {
                MiCuentaContenido(
                    state = MiCuentaUiState(
                        accion = AccionCuenta.DESACTIVAR,
                        errorContrasena = "Ingresa tu contraseña para confirmar."
                    ),
                    onVolver = {},
                    onCambiarContrasena = {},
                    onPedirAccion = {},
                    onContrasenaChange = {},
                    onCancelarAccion = {},
                    onConfirmarAccion = {}
                )
            }
        }

        composeRule.onNodeWithText("Sí, desactivar").assertIsDisplayed()
        composeRule.onNodeWithText("Ingresa tu contraseña para confirmar.").assertIsDisplayed()
    }

    @Test
    fun confirmarInvocaLaAccion() {
        var confirmado = false
        composeRule.setContent {
            FinanzAppTheme {
                MiCuentaContenido(
                    state = MiCuentaUiState(accion = AccionCuenta.ELIMINAR),
                    onVolver = {},
                    onCambiarContrasena = {},
                    onPedirAccion = {},
                    onContrasenaChange = {},
                    onCancelarAccion = {},
                    onConfirmarAccion = { confirmado = true }
                )
            }
        }

        composeRule.onNodeWithText("Sí, eliminar").performClick()

        assertTrue(confirmado)
    }
}
