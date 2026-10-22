package com.finanzap

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
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.core.navigation.FinanzAppNavHost
import com.finanzap.core.navigation.MainViewModel
import com.finanzap.core.ui.theme.FinanzAppTheme
import dagger.hilt.android.AndroidEntryPoint

// Única actividad de la app: aquí vive la navegación.
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val viewModel: MainViewModel = hiltViewModel()
            val haySesion by viewModel.haySesion.collectAsStateWithLifecycle()
            val temaGuardado by viewModel.temaOscuro.collectAsStateWithLifecycle()

            // Sin preferencia guardada se respeta el theme del sistema.
            val oscuro = temaGuardado ?: isSystemInDarkTheme()

            // Los iconos de las barras del sistema deben contrastar con el tema elegido.
            SideEffect {
                WindowCompat.getInsetsController(window, window.decorView).apply {
                    isAppearanceLightStatusBars = !oscuro
                    isAppearanceLightNavigationBars = !oscuro
                }
            }

            FinanzAppTheme(darkTheme = oscuro) {
                when (val sesion = haySesion) {
                    null -> PantallaCargando()
                    else -> FinanzAppNavHost(
                        haySesionInicial = sesion,
                        irALogin = viewModel.irALogin,
                        onCerrarSesion = viewModel::cerrarSesion,
                        temaOscuro = oscuro,
                        onAlternarTema = { viewModel.guardarTemaOscuro(!oscuro) }
                    )
                }
            }
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
