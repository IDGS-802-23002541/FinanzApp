package com.finanzap

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.core.view.WindowCompat
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.core.navigation.FinanzAppNavHost
import com.finanzap.core.navigation.MainViewModel
import com.finanzap.core.notificaciones.EXTRA_ABRIR_NOTIFICACIONES
import com.finanzap.core.ui.FinanzAppTheme
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.MutableStateFlow

// Única actividad de la app: aquí vive la navegación.
@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val abrirNotificaciones = MutableStateFlow(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        leerIntento(intent)
        setContent {
            val viewModel: MainViewModel = hiltViewModel()
            val state by viewModel.state.collectAsStateWithLifecycle()
            val pedirNotificaciones by abrirNotificaciones.collectAsStateWithLifecycle()

            // Sin preferencia guardada se respeta el theme del sistema.
            val oscuro = state.temaOscuro ?: isSystemInDarkTheme()

            LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
                if (state.haySesion) viewModel.sincronizarNotificaciones()
            }

            // Los iconos de las barras del sistema deben contrastar con el tema elegido.
            SideEffect {
                WindowCompat.getInsetsController(window, window.decorView).apply {
                    isAppearanceLightStatusBars = !oscuro
                    isAppearanceLightNavigationBars = !oscuro
                }
            }

            FinanzAppTheme(darkTheme = oscuro) {
                if (state.cargando) {
                    PantallaCargando()
                } else {
                    FinanzAppNavHost(
                        haySesionInicial = state.haySesion,
                        eventos = viewModel.eventos,
                        onCerrarSesion = viewModel::cerrarSesion,
                        temaOscuro = oscuro,
                        onAlternarTema = { viewModel.guardarTemaOscuro(!oscuro) },
                        abrirNotificaciones = pedirNotificaciones,
                        onNotificacionesAbiertas = { abrirNotificaciones.value = false },
                        onSincronizarNotificaciones = viewModel::sincronizarNotificaciones
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        leerIntento(intent)
    }

    private fun leerIntento(intent: Intent?) {
        if (intent?.getBooleanExtra(EXTRA_ABRIR_NOTIFICACIONES, false) == true) {
            abrirNotificaciones.value = true
        }
    }
}

@Composable
private fun PantallaCargando() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator()
    }
}
