package com.finanzap.features.auth.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.notificaciones.notificacionesPermitidas
import com.finanzap.core.ui.BannerError
import com.finanzap.core.ui.Dimensiones
import com.finanzap.core.ui.PantallaFormulario

@Composable
fun MiCuentaScreen(
    onVolver: () -> Unit,
    onEditarCuenta: () -> Unit,
    onPreferenciasNotificacion: () -> Unit,
    onCambiarContrasena: () -> Unit,
    onCuentaCerrada: () -> Unit,
    viewModel: MiCuentaViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    var notificacionesActivas by remember { mutableStateOf(notificacionesPermitidas(context)) }

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        notificacionesActivas = notificacionesPermitidas(context)
    }

    LaunchedEffect(Unit) {
        viewModel.eventos.collect { evento ->
            when (evento) {
                MiCuentaEvento.CuentaCerrada -> onCuentaCerrada()
            }
        }
    }

    MiCuentaContenido(
        state = state,
        notificacionesActivas = notificacionesActivas,
        onVolver = onVolver,
        onEditarCuenta = onEditarCuenta,
        onPreferenciasNotificacion = onPreferenciasNotificacion,
        onCambiarContrasena = onCambiarContrasena,
        onPedirAccion = viewModel::onPedirAccion,
        onContrasenaChange = viewModel::onContrasenaChange,
        onCancelarAccion = viewModel::onCancelarAccion,
        onConfirmarAccion = viewModel::confirmarAccion
    )
}

@Composable
fun MiCuentaContenido(
    state: MiCuentaUiState,
    onVolver: () -> Unit,
    onEditarCuenta: () -> Unit,
    onPreferenciasNotificacion: () -> Unit,
    onCambiarContrasena: () -> Unit,
    onPedirAccion: (AccionCuenta) -> Unit,
    onContrasenaChange: (String) -> Unit,
    onCancelarAccion: () -> Unit,
    onConfirmarAccion: () -> Unit,
    notificacionesActivas: Boolean = true
) {
    PantallaFormulario(
        titulo = stringResource(R.string.mi_cuenta_titulo),
        onVolver = onVolver,
        descripcionVolver = stringResource(R.string.comun_volver),
        mostrarVolver = false
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        PerfilResumen(notificacionesActivas = notificacionesActivas)

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = stringResource(R.string.mi_cuenta_seguridad),
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(8.dp))

        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.large,
            color = MaterialTheme.colorScheme.surface,
            shadowElevation = 1.dp
        ) {
            Column {
                FilaAccion(
                    icono = Icons.Default.Edit,
                    titulo = stringResource(R.string.cuenta_editar_datos),
                    detalle = stringResource(R.string.mi_cuenta_editar_detalle),
                    onClick = onEditarCuenta
                )
                HorizontalDivider(color = MaterialTheme.colorScheme.outline)
                FilaAccion(
                    icono = Icons.Default.Notifications,
                    titulo = stringResource(R.string.preferencias_titulo),
                    detalle = if (notificacionesActivas) {
                        stringResource(R.string.preferencias_permiso_concedido)
                    } else {
                        stringResource(R.string.preferencias_permiso_denegado)
                    },
                    onClick = onPreferenciasNotificacion
                )
                HorizontalDivider(color = MaterialTheme.colorScheme.outline)
                FilaAccion(
                    icono = Icons.Default.Lock,
                    titulo = stringResource(R.string.mi_cuenta_cambiar_contrasena),
                    detalle = null,
                    onClick = onCambiarContrasena
                )
            }
        }

        val errorGeneral = state.errorGeneral
        if (errorGeneral != null) {
            Spacer(modifier = Modifier.height(12.dp))
            BannerError(mensaje = errorGeneral)
        }

        Spacer(modifier = Modifier.height(28.dp))

        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.large,
            color = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.22f),
            border = BorderStroke(
                1.dp,
                MaterialTheme.colorScheme.error.copy(alpha = 0.45f)
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = stringResource(R.string.mi_cuenta_zona_riesgo),
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.error
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = stringResource(R.string.mi_cuenta_zona_riesgo_aviso),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(4.dp))

                AccionRiesgo(
                    texto = stringResource(R.string.mi_cuenta_desactivar),
                    onClick = { onPedirAccion(AccionCuenta.DESACTIVAR) }
                )
                AccionRiesgo(
                    texto = stringResource(R.string.mi_cuenta_eliminar),
                    onClick = { onPedirAccion(AccionCuenta.ELIMINAR) }
                )
            }
        }
    }

    if (state.accion != AccionCuenta.NINGUNA) {
        DialogoConfirmacion(
            accion = state.accion,
            contrasena = state.contrasena,
            onContrasenaChange = onContrasenaChange,
            errorContrasena = state.errorContrasena,
            procesando = state.procesando,
            onCancelar = onCancelarAccion,
            onConfirmar = onConfirmarAccion
        )
    }
}

@Composable
private fun PerfilResumen(notificacionesActivas: Boolean) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.primary
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                color = MaterialTheme.colorScheme.tertiary,
                modifier = Modifier.size(56.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onTertiary,
                        modifier = Modifier.size(30.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = stringResource(R.string.mi_cuenta_titulo),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = if (notificacionesActivas) {
                        stringResource(R.string.preferencias_permiso_concedido)
                    } else {
                        stringResource(R.string.preferencias_permiso_denegado)
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.85f)
                )
            }
        }
    }
}

@Composable
private fun FilaAccion(
    icono: ImageVector,
    titulo: String,
    detalle: String?,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        color = MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                color = MaterialTheme.colorScheme.surfaceVariant,
                modifier = Modifier.size(38.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = icono,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = titulo,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface
                )
                if (detalle != null) {
                    Text(
                        text = detalle,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun AccionRiesgo(texto: String, onClick: () -> Unit) {
    TextButton(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Start
        ) {
            Icon(
                imageVector = Icons.Default.Delete,
                contentDescription = null,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(texto)
        }
    }
}

@Composable
private fun DialogoConfirmacion(
    accion: AccionCuenta,
    contrasena: String,
    onContrasenaChange: (String) -> Unit,
    errorContrasena: String?,
    procesando: Boolean,
    onCancelar: () -> Unit,
    onConfirmar: () -> Unit
) {
    val esEliminar = accion == AccionCuenta.ELIMINAR
    AlertDialog(
        onDismissRequest = { if (!procesando) onCancelar() },
        title = {
            Text(
                stringResource(
                    if (esEliminar) R.string.mi_cuenta_eliminar_titulo
                    else R.string.mi_cuenta_desactivar_titulo
                )
            )
        },
        text = {
            Column {
                Text(
                    stringResource(
                        if (esEliminar) R.string.mi_cuenta_eliminar_aviso
                        else R.string.mi_cuenta_desactivar_aviso
                    ),
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = contrasena,
                    onValueChange = onContrasenaChange,
                    label = { Text(stringResource(R.string.comun_contrasena)) },
                    isError = errorContrasena != null,
                    supportingText = errorContrasena?.let { { Text(it) } },
                    singleLine = true,
                    enabled = !procesando,
                    shape = RoundedCornerShape(Dimensiones.RadioCampo),
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Password,
                        imeAction = ImeAction.Done
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onConfirmar, enabled = !procesando) {
                if (procesando) {
                    CircularProgressIndicator(
                        modifier = Modifier.height(18.dp),
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        stringResource(
                            if (esEliminar) R.string.mi_cuenta_eliminar_confirmar
                            else R.string.mi_cuenta_desactivar_confirmar
                        ),
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onCancelar, enabled = !procesando) {
                Text(stringResource(R.string.comun_cancelar))
            }
        }
    )
}
