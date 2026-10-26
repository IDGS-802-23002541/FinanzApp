package com.finanzap.features.auth.ui.cuenta

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.ui.components.BannerError

@Composable
fun MiCuentaScreen(
    onVolver: () -> Unit,
    onCambiarContrasena: () -> Unit,
    onCuentaCerrada: () -> Unit,
    viewModel: MiCuentaViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(state.cuentaCerrada) {
        if (state.cuentaCerrada) onCuentaCerrada()
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background
    ) { margen ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(margen)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onVolver) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = stringResource(R.string.mi_cuenta_volver)
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = stringResource(R.string.mi_cuenta_titulo),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = stringResource(R.string.mi_cuenta_descripcion),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(24.dp))

            OutlinedButton(
                onClick = onCambiarContrasena,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(stringResource(R.string.mi_cuenta_cambiar_contrasena))
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedButton(
                onClick = { viewModel.onPedirAccion(AccionCuenta.DESACTIVAR) },
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = MaterialTheme.colorScheme.error
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(stringResource(R.string.mi_cuenta_desactivar))
            }

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = { viewModel.onPedirAccion(AccionCuenta.ELIMINAR) },
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(stringResource(R.string.mi_cuenta_eliminar))
            }

            val errorGeneral = state.errorGeneral
            if (errorGeneral != null) {
                Spacer(modifier = Modifier.height(12.dp))
                BannerError(mensaje = errorGeneral)
            }
        }
    }

    if (state.accion != AccionCuenta.NINGUNA) {
        DialogoConfirmacion(
            accion = state.accion,
            contrasena = state.contrasena,
            onContrasenaChange = viewModel::onContrasenaChange,
            errorContrasena = state.errorContrasena,
            procesando = state.procesando,
            onCancelar = viewModel::onCancelarAccion,
            onConfirmar = viewModel::confirmarAccion
        )
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
                    label = { Text(stringResource(R.string.mi_cuenta_contrasena)) },
                    isError = errorContrasena != null,
                    supportingText = errorContrasena?.let { { Text(it) } },
                    singleLine = true,
                    enabled = !procesando,
                    shape = RoundedCornerShape(10.dp),
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
