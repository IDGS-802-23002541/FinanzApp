package com.finanzap.core.navigation

import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.finanzap.R
import com.finanzap.core.ui.LocalAbrirMenu
import com.finanzap.core.ui.MenuLateral
import com.finanzap.core.ui.PantallaPendiente
import com.finanzap.core.ui.SeccionMenu
import com.finanzap.features.auth.ui.CambiarContrasenaScreen
import com.finanzap.features.auth.ui.LoginScreen
import com.finanzap.features.auth.ui.MiCuentaScreen
import com.finanzap.features.auth.ui.RecuperarContrasenaScreen
import com.finanzap.features.carteras.ui.CarteraDetalleScreen
import com.finanzap.features.carteras.ui.CarterasScreen
import com.finanzap.features.carteras.ui.FormularioCarteraScreen
import com.finanzap.features.carteras.ui.UnirseCarteraScreen
import com.finanzap.features.transacciones.ui.RegistrarTransaccionScreen
import com.finanzap.features.transacciones.ui.TransaccionesScreen
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch

@Composable
fun FinanzAppNavHost(
    haySesionInicial: Boolean,
    eventos: Flow<MainEvento>,
    onCerrarSesion: () -> Unit,
    temaOscuro: Boolean,
    onAlternarTema: () -> Unit
) {
    val navController = rememberNavController()
    val entrada by navController.currentBackStackEntryAsState()
    val ruta = entrada?.destination?.route
    val autenticada = ruta != null &&
        ruta != Rutas.Login &&
        ruta != Rutas.RecuperarContrasena

    val estadoDrawer = rememberDrawerState(DrawerValue.Closed)
    val alcance = rememberCoroutineScope()
    val abrirMenu: (() -> Unit)? = if (autenticada) {
        { alcance.launch { estadoDrawer.open() } }
    } else {
        null
    }

    // Al salir de una sección autenticada el menú no debe quedar abierto.
    LaunchedEffect(autenticada) {
        if (!autenticada) estadoDrawer.close()
    }

    // Logout o refresh rechazado: se limpia toda la pila y se vuelve al login.
    LaunchedEffect(Unit) {
        eventos.collect { evento ->
            when (evento) {
                MainEvento.IrALogin -> navController.navigate(Rutas.Login) {
                    popUpTo(0) { inclusive = true }
                    launchSingleTop = true
                }
            }
        }
    }

    CompositionLocalProvider(LocalAbrirMenu provides abrirMenu) {
        ModalNavigationDrawer(
            drawerState = estadoDrawer,
            gesturesEnabled = autenticada,
            drawerContent = {
                if (autenticada) {
                    MenuLateral(
                        temaOscuro = temaOscuro,
                        seccionActual = seccionDeRuta(ruta),
                        onSeccion = { seccion ->
                            alcance.launch { estadoDrawer.close() }
                            navController.navigate(rutaDeSeccion(seccion)) {
                                popUpTo(Rutas.Carteras) { inclusive = false }
                                launchSingleTop = true
                            }
                        },
                        onAlternarTema = {
                            alcance.launch { estadoDrawer.close() }
                            onAlternarTema()
                        },
                        onCerrarSesion = {
                            alcance.launch { estadoDrawer.close() }
                            onCerrarSesion()
                        }
                    )
                }
            }
        ) {
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
                        },
                        onRecuperarContrasena = {
                            navController.navigate(Rutas.RecuperarContrasena)
                        }
                    )
                }

                composable(Rutas.RecuperarContrasena) {
                    RecuperarContrasenaScreen(
                        onVolver = { navController.popBackStack() },
                        onCompletada = { navController.popBackStack() }
                    )
                }

                composable(Rutas.Carteras) {
                    CarterasScreen(
                        onNuevaCartera = { navController.navigate(Rutas.NuevaCartera) },
                        onAbrirCartera = { cartera ->
                            navController.navigate(Rutas.carteraDetalle(cartera.id))
                        },
                        onUnirseCartera = {
                            navController.navigate(Rutas.UnirseCartera)
                        },
                        onRegistrarGasto = { cartera ->
                            navController.navigate(
                                Rutas.nuevaTransaccion(cartera.id, cartera.nombre)
                            )
                        }
                    )
                }

                composable(
                    route = Rutas.CarteraDetalle,
                    arguments = listOf(
                        navArgument("carteraId") { type = NavType.IntType }
                    )
                ) { entrada ->
                    CarteraDetalleScreen(
                        carteraId = entrada.arguments?.getInt("carteraId") ?: 0,
                        onVolver = { navController.popBackStack() },
                        onRegistrarGasto = { id, nombre ->
                            navController.navigate(Rutas.nuevaTransaccion(id, nombre))
                        },
                        onVerTransacciones = { id, nombre, puedeEditar ->
                            navController.navigate(
                                Rutas.transacciones(id, nombre, puedeEditar)
                            )
                        },
                        onSalirDeCartera = { navController.popBackStack() },
                        onEditarCartera = { id ->
                            navController.navigate(Rutas.editarCartera(id))
                        },
                        onCarteraInactivada = { navController.popBackStack() }
                    )
                }

                composable(
                    route = Rutas.EditarCartera,
                    arguments = listOf(
                        navArgument("carteraId") { type = NavType.IntType }
                    )
                ) { entrada ->
                    FormularioCarteraScreen(
                        onVolver = { navController.popBackStack() },
                        onGuardada = { navController.popBackStack() },
                        carteraId = entrada.arguments?.getInt("carteraId") ?: 0
                    )
                }

                composable(
                    route = Rutas.Transacciones,
                    arguments = listOf(
                        navArgument("carteraId") { type = NavType.IntType },
                        navArgument("nombre") {
                            type = NavType.StringType
                            defaultValue = ""
                        },
                        navArgument("puedeEditar") {
                            type = NavType.BoolType
                            defaultValue = false
                        }
                    )
                ) { entrada ->
                    TransaccionesScreen(
                        carteraId = entrada.arguments?.getInt("carteraId") ?: 0,
                        carteraNombre = entrada.arguments?.getString("nombre").orEmpty(),
                        puedeEditar = entrada.arguments?.getBoolean("puedeEditar") ?: false,
                        onVolver = { navController.popBackStack() }
                    )
                }

                composable(Rutas.UnirseCartera) {
                    UnirseCarteraScreen(
                        onVolver = { navController.popBackStack() }
                    )
                }

                composable(Rutas.MiCuenta) {
                    MiCuentaScreen(
                        onVolver = { navController.popBackStack() },
                        onCambiarContrasena = { navController.navigate(Rutas.CambiarContrasena) },
                        onCuentaCerrada = {
                            navController.navigate(Rutas.Login) {
                                popUpTo(0) { inclusive = true }
                                launchSingleTop = true
                            }
                        }
                    )
                }

                composable(Rutas.CambiarContrasena) {
                    CambiarContrasenaScreen(
                        onVolver = { navController.popBackStack() },
                        onCambiada = { navController.popBackStack() }
                    )
                }

                composable(Rutas.NuevaCartera) {
                    FormularioCarteraScreen(
                        onVolver = { navController.popBackStack() },
                        onGuardada = { navController.popBackStack() }
                    )
                }

                composable(
                    route = Rutas.NuevaTransaccion,
                    arguments = listOf(
                        navArgument("carteraId") { type = NavType.IntType },
                        navArgument("nombre") {
                            type = NavType.StringType
                            defaultValue = ""
                        }
                    )
                ) { entrada ->
                    RegistrarTransaccionScreen(
                        carteraId = entrada.arguments?.getInt("carteraId") ?: 0,
                        carteraNombre = entrada.arguments?.getString("nombre").orEmpty(),
                        onVolver = { navController.popBackStack() }
                    )
                }

                composable(Rutas.Reportes) {
                    PantallaPendiente(
                        titulo = stringResource(R.string.reportes_titulo),
                        descripcionVolver = stringResource(R.string.comun_volver),
                        mensaje = stringResource(R.string.comun_pendiente_mensaje),
                        onVolver = { navController.popBackStack() }
                    )
                }

                composable(Rutas.Soporte) {
                    PantallaPendiente(
                        titulo = stringResource(R.string.soporte_titulo),
                        descripcionVolver = stringResource(R.string.comun_volver),
                        mensaje = stringResource(R.string.comun_pendiente_mensaje),
                        onVolver = { navController.popBackStack() }
                    )
                }
            }
        }
    }
}

private fun seccionDeRuta(ruta: String?): SeccionMenu? = when (ruta) {
    Rutas.Carteras,
    Rutas.NuevaCartera,
    Rutas.EditarCartera,
    Rutas.CarteraDetalle,
    Rutas.UnirseCartera,
    Rutas.Transacciones,
    Rutas.NuevaTransaccion -> SeccionMenu.CARTERAS

    Rutas.Reportes -> SeccionMenu.REPORTES
    Rutas.Soporte -> SeccionMenu.SOPORTE
    Rutas.MiCuenta,
    Rutas.CambiarContrasena -> SeccionMenu.MI_CUENTA

    else -> null
}

private fun rutaDeSeccion(seccion: SeccionMenu): String = when (seccion) {
    SeccionMenu.CARTERAS -> Rutas.Carteras
    SeccionMenu.REPORTES -> Rutas.Reportes
    SeccionMenu.SOPORTE -> Rutas.Soporte
    SeccionMenu.MI_CUENTA -> Rutas.MiCuenta
}
