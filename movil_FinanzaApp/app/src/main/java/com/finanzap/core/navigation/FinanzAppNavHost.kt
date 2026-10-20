package com.finanzap.core.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.finanzap.features.auth.ui.login.LoginScreen
import com.finanzap.features.carteras.ui.home.HomeScreen

@Composable
fun FinanzAppNavHost(
    haySesionInicial: Boolean,
    onCerrarSesion: () -> Unit
) {
    val navController = rememberNavController()

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
            HomeScreen(
                onCerrarSesion = {
                    onCerrarSesion()
                    navController.navigate(Rutas.Login) {
                        popUpTo(Rutas.Home) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }
    }
}
