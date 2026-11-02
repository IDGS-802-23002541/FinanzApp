package com.finanzap.features.auth.ui.recuperar

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.ui.components.BannerError
import com.finanzap.core.ui.components.BotonPrincipal
import com.finanzap.core.ui.components.CampoContrasena
import com.finanzap.core.ui.components.CampoCorreo
import com.finanzap.core.ui.components.PantallaFormulario
import com.finanzap.core.ui.theme.Dimensiones

@Composable
fun RecuperarContrasenaScreen(
    onVolver: () -> Unit,
    onCompletada: () -> Unit,
    viewModel: RecuperarViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var mostrarExito by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModel.eventos.collect { evento ->
            when (evento) {
                RecuperarEvento.ContrasenaRestablecida -> mostrarExito = true
            }
        }
    }

    RecuperarContenido(
        state = state,
        mostrarExito = mostrarExito,
        onVolver = {
            if (state.paso == PasoRecuperacion.CODIGO) {
                viewModel.volverPaso()
            } else {
                onVolver()
            }
        },
        onCompletada = onCompletada,
        onCorreoChange = viewModel::onCorreoChange,
        onCodigoChange = viewModel::onCodigoChange,
        onContrasenaChange = viewModel::onContrasenaChange,
        onConfirmarChange = viewModel::onConfirmarChange,
        onToggleContrasena = viewModel::onToggleContrasena,
        onSolicitarCodigo = viewModel::solicitarCodigo,
        onRestablecer = viewModel::restablecer
    )
}

@Composable
fun RecuperarContenido(
    state: RecuperarUiState,
    mostrarExito: Boolean,
    onVolver: () -> Unit,
    onCompletada: () -> Unit,
    onCorreoChange: (String) -> Unit,
    onCodigoChange: (String) -> Unit,
    onContrasenaChange: (String) -> Unit,
    onConfirmarChange: (String) -> Unit,
    onToggleContrasena: () -> Unit,
    onSolicitarCodigo: () -> Unit,
    onRestablecer: () -> Unit
) {
    val enSolicitud = state.paso == PasoRecuperacion.SOLICITUD

    PantallaFormulario(
        titulo = stringResource(R.string.recuperar_titulo),
        onVolver = onVolver,
        descripcionVolver = stringResource(R.string.recuperar_volver)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = if (enSolicitud) {
                stringResource(R.string.recuperar_descripcion_solicitud)
            } else {
                stringResource(R.string.recuperar_descripcion_codigo, state.correo.trim())
            },
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(20.dp))

        if (enSolicitud) {
            CampoCorreo(
                valor = state.correo,
                onValorChange = onCorreoChange,
                etiqueta = stringResource(R.string.recuperar_correo),
                error = state.errorCorreo,
                habilitado = !state.cargando
            )
        } else {
            val codigoDesarrollo = state.codigoDesarrollo
            if (codigoDesarrollo != null) {
                Text(
                    text = stringResource(R.string.recuperar_codigo_desarrollo, codigoDesarrollo),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(12.dp))
            }

            OutlinedTextField(
                value = state.codigo,
                onValueChange = onCodigoChange,
                label = { Text(stringResource(R.string.recuperar_codigo)) },
                leadingIcon = {
                    Icon(imageVector = Icons.Default.Lock, contentDescription = null)
                },
                isError = state.errorCodigo != null,
                supportingText = if (state.errorCodigo != null) {
                    { Text(state.errorCodigo.orEmpty()) }
                } else {
                    null
                },
                singleLine = true,
                enabled = !state.cargando,
                shape = RoundedCornerShape(Dimensiones.RadioCampo),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.NumberPassword,
                    imeAction = ImeAction.Next
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            CampoContrasena(
                valor = state.contrasena,
                onValorChange = onContrasenaChange,
                etiqueta = stringResource(R.string.recuperar_contrasena_nueva),
                error = state.errorContrasena,
                visible = state.contrasenaVisible,
                onToggleVisible = onToggleContrasena,
                habilitado = !state.cargando,
                imeAction = ImeAction.Next
            )

            Spacer(modifier = Modifier.height(12.dp))

            CampoContrasena(
                valor = state.confirmarContrasena,
                onValorChange = onConfirmarChange,
                etiqueta = stringResource(R.string.recuperar_confirmar_contrasena),
                error = state.errorConfirmar,
                visible = state.contrasenaVisible,
                onToggleVisible = onToggleContrasena,
                habilitado = !state.cargando,
                imeAction = ImeAction.Done
            )
        }

        val errorGeneral = state.errorGeneral
        if (errorGeneral != null) {
            Spacer(modifier = Modifier.height(12.dp))
            BannerError(mensaje = errorGeneral)
        }

        Spacer(modifier = Modifier.height(24.dp))

        BotonPrincipal(
            texto = stringResource(
                if (enSolicitud) R.string.recuperar_enviar_codigo else R.string.recuperar_cambiar_contrasena
            ),
            textoCargando = stringResource(
                if (enSolicitud) R.string.recuperar_enviando else R.string.recuperar_guardando
            ),
            cargando = state.cargando,
            onClick = if (enSolicitud) onSolicitarCodigo else onRestablecer
        )

        if (!enSolicitud) {
            TextButton(
                onClick = onSolicitarCodigo,
                enabled = !state.cargando,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(stringResource(R.string.recuperar_reenviar_codigo))
            }
        }
    }

    if (mostrarExito) {
        AlertDialog(
            onDismissRequest = {},
            title = { Text(stringResource(R.string.recuperar_exito_titulo)) },
            text = { Text(stringResource(R.string.recuperar_exito_mensaje)) },
            confirmButton = {
                TextButton(onClick = onCompletada) {
                    Text(stringResource(R.string.recuperar_ir_login))
                }
            }
        )
    }
}
