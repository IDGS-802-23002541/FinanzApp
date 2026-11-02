package com.finanzap.features.auth.ui

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
class LoginContenidoTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun muestraErroresDeValidacion() {
        composeRule.setContent {
            FinanzAppTheme {
                LoginContenido(
                    state = LoginUiState(
                        correo = "sin-arroba",
                        errorCorreo = "Ingresa un correo válido.",
                        errorContrasena = "Ingresa tu contraseña."
                    ),
                    temaOscuro = false,
                    onAlternarTema = {},
                    onCorreoChange = {},
                    onContrasenaChange = {},
                    onToggleContrasena = {},
                    onIniciarSesion = {},
                    onRecuperarContrasena = {}
                )
            }
        }

        composeRule.onNodeWithText("Ingresa un correo válido.").assertIsDisplayed()
        composeRule.onNodeWithText("Ingresa tu contraseña.").assertIsDisplayed()
    }

    @Test
    fun botonInvocaInicioDeSesion() {
        var iniciado = false
        composeRule.setContent {
            FinanzAppTheme {
                LoginContenido(
                    state = LoginUiState(correo = "diego@correo.com", contrasena = "Segura123"),
                    temaOscuro = false,
                    onAlternarTema = {},
                    onCorreoChange = {},
                    onContrasenaChange = {},
                    onToggleContrasena = {},
                    onIniciarSesion = { iniciado = true },
                    onRecuperarContrasena = {}
                )
            }
        }

        composeRule.onNodeWithText("Iniciar sesión").performClick()

        assertTrue(iniciado)
    }
}
