package com.finanzap.features.auth.ui

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.notificaciones.crearCanalNotificaciones
import com.finanzap.core.notificaciones.mostrarNotificacion
import com.finanzap.core.notificaciones.notificacionesPermitidas
import com.finanzap.core.ui.BannerError
import com.finanzap.core.ui.BotonPrincipal
import com.finanzap.core.ui.EstadoError
import com.finanzap.core.ui.PantallaFormulario

@Composable
fun PreferenciasNotificacionScreen(
    onVolver: () -> Unit,
    onVerNotificaciones: () -> Unit = {},
    viewModel: PreferenciasNotificacionViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    var guardado by remember { mutableStateOf(false) }
    var permisoDenegado by remember { mutableStateOf(false) }
    var sinPreferenciasActivas by remember { mutableStateOf(false) }

    val launcherPermiso = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { concedido ->
        permisoDenegado = !concedido
        if (concedido) enviarPrueba(context)
    }

    LaunchedEffect(Unit) {
        viewModel.cargar()
        crearCanalNotificaciones(context)
        viewModel.eventos.collect { evento ->
            when (evento) {
                PreferenciasNotificacionEvento.PreferenciasGuardadas -> guardado = true
            }
        }
    }

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        viewModel.cargar()
    }

    PreferenciasNotificacionContenido(
        state = state,
        guardado = guardado,
        permisoDenegado = permisoDenegado,
        sinPreferenciasActivas = sinPreferenciasActivas,
        onVolver = onVolver,
        onMovimientosChange = viewModel::onMovimientosChange,
        onSistemaChange = viewModel::onSistemaChange,
        onPagosChange = viewModel::onPagosChange,
        onGuardar = viewModel::guardar,
        onReintentar = viewModel::cargar,
        onVerNotificaciones = onVerNotificaciones,
        onProbarNotificacion = {
            val hayAvisos = state.movimientos || state.sistema || state.pagos
            sinPreferenciasActivas = !hayAvisos
            if (!hayAvisos) {
                // La prueba respeta las preferencias guardadas en el servidor.
            } else if (notificacionesPermitidas(context)) {
                permisoDenegado = false
                enviarPrueba(context)
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                launcherPermiso.launch(Manifest.permission.POST_NOTIFICATIONS)
            } else {
                permisoDenegado = true
            }
        }
    )
}

private fun enviarPrueba(context: android.content.Context) {
    mostrarNotificacion(
        context = context,
        id = 1001,
        titulo = context.getString(R.string.notificaciones_prueba_titulo),
        texto = context.getString(R.string.notificaciones_prueba_texto)
    )
}

@Composable
fun PreferenciasNotificacionContenido(
    state: PreferenciasNotificacionUiState,
    guardado: Boolean,
    onVolver: () -> Unit,
    onMovimientosChange: (Boolean) -> Unit,
    onSistemaChange: (Boolean) -> Unit,
    onPagosChange: (Boolean) -> Unit,
    onGuardar: () -> Unit,
    onReintentar: () -> Unit,
    permisoDenegado: Boolean = false,
    sinPreferenciasActivas: Boolean = false,
    onVerNotificaciones: () -> Unit = {},
    onProbarNotificacion: () -> Unit = {}
) {
    PantallaFormulario(
        titulo = stringResource(R.string.preferencias_titulo),
        onVolver = onVolver,
        descripcionVolver = stringResource(R.string.comun_volver)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = stringResource(R.string.preferencias_descripcion),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (state.cargando) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
            return@PantallaFormulario
        }

        val errorCarga = state.errorCarga
        if (errorCarga != null) {
            EstadoError(mensaje = errorCarga, onReintentar = onReintentar)
            return@PantallaFormulario
        }

        FilaPreferencia(
            texto = stringResource(R.string.preferencias_movimientos),
            activo = state.movimientos,
            habilitado = !state.guardando,
            onChange = onMovimientosChange
        )

        FilaPreferencia(
            texto = stringResource(R.string.preferencias_sistema),
            activo = state.sistema,
            habilitado = !state.guardando,
            onChange = onSistemaChange
        )

        FilaPreferencia(
            texto = stringResource(R.string.preferencias_pagos),
            activo = state.pagos,
            habilitado = !state.guardando,
            onChange = onPagosChange
        )

        if (guardado) {
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = stringResource(R.string.preferencias_guardadas),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary
            )
        }

        val errorGuardado = state.errorGuardado
        if (errorGuardado != null) {
            Spacer(modifier = Modifier.height(12.dp))
            BannerError(mensaje = errorGuardado)
        }

        Spacer(modifier = Modifier.height(20.dp))

        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surfaceVariant
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = stringResource(R.string.preferencias_prueba_titulo),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = stringResource(R.string.preferencias_prueba_detalle),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedButton(
                    onClick = onProbarNotificacion,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(stringResource(R.string.preferencias_prueba_boton))
                }
                if (permisoDenegado) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = stringResource(R.string.preferencias_permiso_denegado),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
                if (sinPreferenciasActivas) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = stringResource(R.string.preferencias_sin_avisos),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        BotonPrincipal(
            texto = stringResource(R.string.preferencias_guardar),
            textoCargando = stringResource(R.string.comun_guardando),
            cargando = state.guardando,
            onClick = onGuardar
        )

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedButton(
            onClick = onVerNotificaciones,
            modifier = Modifier.fillMaxWidth(),
            shape = androidx.compose.foundation.shape.RoundedCornerShape(10.dp)
        ) {
            Text(stringResource(R.string.notificaciones_ver_historial))
        }
    }
}

@Composable
private fun FilaPreferencia(
    texto: String,
    activo: Boolean,
    habilitado: Boolean,
    onChange: (Boolean) -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Text(
            text = texto,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.weight(1f)
        )
        Switch(
            checked = activo,
            onCheckedChange = onChange,
            enabled = habilitado
        )
    }
}
