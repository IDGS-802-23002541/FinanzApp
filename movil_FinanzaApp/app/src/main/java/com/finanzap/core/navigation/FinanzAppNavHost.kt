package com.finanzap.core.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.finanzap.features.auth.ui.login.LoginScreen
import com.finanzap.features.carteras.ui.home.HomeScreen
import kotlinx.coroutines.flow.SharedFlow

@Composable
fun FinanzAppNavHost(
    haySesionInicial: Boolean,
    irALogin: SharedFlow<Unit>,
    onCerrarSesion: () -> Unit
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
        startDestination = if (haySesionInicial) Rutas.Home else Rutas.Login
    ) {
        composable(Rutas.Login) {
            LoginScreen(
                onLoginExitoso = {
                    navController.navigate(Rutas.Home) {
                        popUpTo(Rutas.Login) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }

        composable(Rutas.Home) {
            HomeScreen(onCerrarSesion = onCerrarSesion)
        }
    }
}
