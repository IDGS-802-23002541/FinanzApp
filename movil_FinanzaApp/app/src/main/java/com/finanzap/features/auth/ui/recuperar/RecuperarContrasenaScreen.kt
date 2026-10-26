package com.finanzap.features.auth.ui.recuperar

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.ui.components.BannerError

@Composable
fun RecuperarContrasenaScreen(
    onVolver: () -> Unit,
    onCompletada: () -> Unit,
    viewModel: RecuperarViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background
    ) { margen ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(margen)
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(
                    onClick = {
                        if (state.paso == PasoRecuperacion.CODIGO) {
                            viewModel.volverPaso()
                        } else {
                            onVolver()
                        }
                    }
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = stringResource(R.string.recuperar_volver)
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = stringResource(R.string.recuperar_titulo),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = if (state.paso == PasoRecuperacion.SOLICITUD) {
                    stringResource(R.string.recuperar_descripcion_solicitud)
                } else {
                    stringResource(R.string.recuperar_descripcion_codigo, state.correo.trim())
                },
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(20.dp))

            if (state.paso == PasoRecuperacion.SOLICITUD) {
                CampoCorreo(
                    valor = state.correo,
                    error = state.errorCorreo,
                    habilitado = !state.cargando,
                    onValorChange = viewModel::onCorreoChange
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
                    onValueChange = viewModel::onCodigoChange,
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
                    shape = RoundedCornerShape(10.dp),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.NumberPassword,
                        imeAction = ImeAction.Next
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                CampoContrasena(
                    valor = state.contrasena,
                    etiqueta = stringResource(R.string.recuperar_contrasena_nueva),
                    error = state.errorContrasena,
                    visible = state.contrasenaVisible,
                    habilitado = !state.cargando,
                    imeAction = ImeAction.Next,
                    onValorChange = viewModel::onContrasenaChange,
                    onToggleVisible = viewModel::onToggleContrasena
                )

                Spacer(modifier = Modifier.height(12.dp))

                CampoContrasena(
                    valor = state.confirmarContrasena,
                    etiqueta = stringResource(R.string.recuperar_confirmar_contrasena),
                    error = state.errorConfirmar,
                    visible = state.contrasenaVisible,
                    habilitado = !state.cargando,
                    imeAction = ImeAction.Done,
                    onValorChange = viewModel::onConfirmarChange,
                    onToggleVisible = viewModel::onToggleContrasena
                )
            }

            val errorGeneral = state.errorGeneral
            if (errorGeneral != null) {
                Spacer(modifier = Modifier.height(12.dp))
                BannerError(mensaje = errorGeneral)
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = if (state.paso == PasoRecuperacion.SOLICITUD) {
                    viewModel::solicitarCodigo
                } else {
                    viewModel::restablecer
                },
                enabled = !state.cargando,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                if (state.cargando) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        stringResource(
                            if (state.paso == PasoRecuperacion.SOLICITUD) {
                                R.string.recuperar_enviando
                            } else {
                                R.string.recuperar_guardando
                            }
                        )
                    )
                } else {
                    Text(
                        stringResource(
                            if (state.paso == PasoRecuperacion.SOLICITUD) {
                                R.string.recuperar_enviar_codigo
                            } else {
                                R.string.recuperar_cambiar_contrasena
                            }
                        )
                    )
                }
            }

            if (state.paso == PasoRecuperacion.CODIGO) {
                TextButton(
                    onClick = viewModel::solicitarCodigo,
                    enabled = !state.cargando,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(stringResource(R.string.recuperar_reenviar_codigo))
                }
            }
        }
    }

    if (state.recuperacionCompletada) {
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

@Composable
private fun CampoCorreo(
    valor: String,
    error: String?,
    habilitado: Boolean,
    onValorChange: (String) -> Unit
) {
    OutlinedTextField(
        value = valor,
        onValueChange = onValorChange,
        label = { Text(stringResource(R.string.recuperar_correo)) },
        leadingIcon = {
            Icon(imageVector = Icons.Default.Email, contentDescription = null)
        },
        isError = error != null,
        supportingText = if (error != null) {
            { Text(error) }
        } else {
            null
        },
        singleLine = true,
        enabled = habilitado,
        shape = RoundedCornerShape(10.dp),
        keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Email,
            imeAction = ImeAction.Next
        ),
        modifier = Modifier.fillMaxWidth()
    )
}

@Composable
private fun CampoContrasena(
    valor: String,
    etiqueta: String,
    error: String?,
    visible: Boolean,
    habilitado: Boolean,
    imeAction: ImeAction,
    onValorChange: (String) -> Unit,
    onToggleVisible: () -> Unit
) {
    OutlinedTextField(
        value = valor,
        onValueChange = onValorChange,
        label = { Text(etiqueta) },
        leadingIcon = {
            Icon(imageVector = Icons.Default.Lock, contentDescription = null)
        },
        trailingIcon = {
            IconButton(onClick = onToggleVisible, enabled = habilitado) {
                Icon(
                    painter = painterResource(
                        if (visible) R.drawable.ic_visibilidad_oculto else R.drawable.ic_visibilidad
                    ),
                    contentDescription = stringResource(
                        if (visible) {
                            R.string.login_ocultar_contrasena
                        } else {
                            R.string.login_mostrar_contrasena
                        }
                    )
                )
            }
        },
        isError = error != null,
        supportingText = if (error != null) {
            { Text(error) }
        } else {
            null
        },
        singleLine = true,
        enabled = habilitado,
        shape = RoundedCornerShape(10.dp),
        visualTransformation = if (visible) {
            VisualTransformation.None
        } else {
            PasswordVisualTransformation()
        },
        keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Password,
            imeAction = imeAction
        ),
        modifier = Modifier.fillMaxWidth()
    )
}
