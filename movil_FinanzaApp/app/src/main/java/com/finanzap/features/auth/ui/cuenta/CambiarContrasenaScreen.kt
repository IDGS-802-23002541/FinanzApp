package com.finanzap.features.auth.ui.cuenta

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
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
fun CambiarContrasenaScreen(
    onVolver: () -> Unit,
    onCambiada: () -> Unit,
    viewModel: CambiarContrasenaViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(state.cambioCompletado) {
        if (state.cambioCompletado) onCambiada()
    }

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
                IconButton(onClick = onVolver) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = stringResource(R.string.cambiar_contrasena_volver)
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = stringResource(R.string.cambiar_contrasena_titulo),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            CampoContrasena(
                valor = state.actual,
                onValorChange = viewModel::onActualChange,
                etiqueta = stringResource(R.string.cambiar_contrasena_actual),
                error = state.errorActual,
                visible = state.visibles,
                onToggleVisible = viewModel::onToggleVisibles,
                habilitado = !state.guardando,
                imeAction = ImeAction.Next
            )

            Spacer(modifier = Modifier.height(12.dp))

            CampoContrasena(
                valor = state.nueva,
                onValorChange = viewModel::onNuevaChange,
                etiqueta = stringResource(R.string.cambiar_contrasena_nueva),
                error = state.errorNueva,
                visible = state.visibles,
                onToggleVisible = viewModel::onToggleVisibles,
                habilitado = !state.guardando,
                imeAction = ImeAction.Next
            )

            Spacer(modifier = Modifier.height(12.dp))

            CampoContrasena(
                valor = state.confirmar,
                onValorChange = viewModel::onConfirmarChange,
                etiqueta = stringResource(R.string.cambiar_contrasena_confirmar),
                error = state.errorConfirmar,
                visible = state.visibles,
                onToggleVisible = viewModel::onToggleVisibles,
                habilitado = !state.guardando,
                imeAction = ImeAction.Done
            )

            val errorGeneral = state.errorGeneral
            if (errorGeneral != null) {
                Spacer(modifier = Modifier.height(12.dp))
                BannerError(mensaje = errorGeneral)
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = viewModel::guardar,
                enabled = !state.guardando,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                if (state.guardando) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(stringResource(R.string.cambiar_contrasena_guardando))
                } else {
                    Text(stringResource(R.string.cambiar_contrasena_guardar))
                }
            }
        }
    }
}

@Composable
private fun CampoContrasena(
    valor: String,
    onValorChange: (String) -> Unit,
    etiqueta: String,
    error: String?,
    visible: Boolean,
    onToggleVisible: () -> Unit,
    habilitado: Boolean,
    imeAction: ImeAction
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
