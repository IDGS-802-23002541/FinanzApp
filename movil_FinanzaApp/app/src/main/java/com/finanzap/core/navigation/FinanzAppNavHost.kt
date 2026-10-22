package com.finanzap.core.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.finanzap.features.auth.ui.login.LoginScreen
import com.finanzap.features.carteras.ui.dashboard.CarterasScreen
import kotlinx.coroutines.flow.SharedFlow

@Composable
fun FinanzAppNavHost(
    haySesionInicial: Boolean,
    irALogin: SharedFlow<Unit>,
    onCerrarSesion: () -> Unit,
    temaOscuro: Boolean,
    onAlternarTema: () -> Unit
) {
    val navController = rememberNavController()

    // Logout o refresh rechazado: se limpia toda la pila y se vuelve al login.
    LaunchedEffect(Unit) {
        irALogin.collect {
            navController.navigate(Rutas.Login) {
                popUpTo(0) { inclusive = true }
                launchSingleTop = true
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = if (haySesionInicial) Rutas.Carteras else Rutas.Login
    ) {
        composable(Rutas.Login) {
            LoginScreen(
                temaOscuro = temaOscuro,
                onAlternarTema = onAlternarTema,
                onLoginExitoso = {
                    navController.navigate(Rutas.Carteras) {
                        popUpTo(Rutas.Login) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }

        composable(Rutas.Carteras) {
            CarterasScreen(
                temaOscuro = temaOscuro,
                onAlternarTema = onAlternarTema,
                onCerrarSesion = onCerrarSesion
            )
        }
    }
}
