package com.finanzap.features.auth.ui

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.ui.BannerError
import com.finanzap.core.ui.BotonPrincipal
import com.finanzap.core.ui.CampoCorreo
import com.finanzap.core.ui.Dimensiones
import com.finanzap.core.ui.PantallaFormulario

@Composable
fun CuentaEditarScreen(
    onVolver: () -> Unit,
    onGuardada: () -> Unit,
    viewModel: CuentaEditarViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.eventos.collect { evento ->
            when (evento) {
                CuentaEditarEvento.CuentaActualizada -> onGuardada()
            }
        }
    }

    CuentaEditarContenido(
        state = state,
        onVolver = onVolver,
        onNombreChange = viewModel::onNombreChange,
        onApaternoChange = viewModel::onApaternoChange,
        onAmaternoChange = viewModel::onAmaternoChange,
        onCorreoChange = viewModel::onCorreoChange,
        onGuardar = viewModel::guardar
    )
}

@Composable
fun CuentaEditarContenido(
    state: CuentaEditarUiState,
    onVolver: () -> Unit,
    onNombreChange: (String) -> Unit,
    onApaternoChange: (String) -> Unit,
    onAmaternoChange: (String) -> Unit,
    onCorreoChange: (String) -> Unit,
    onGuardar: () -> Unit
) {
    PantallaFormulario(
        titulo = stringResource(R.string.cuenta_editar_titulo),
        onVolver = onVolver,
        descripcionVolver = stringResource(R.string.comun_volver)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = stringResource(R.string.cuenta_editar_descripcion),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = state.nombre,
            onValueChange = onNombreChange,
            label = { Text(stringResource(R.string.cuenta_editar_nombre)) },
            isError = state.errorNombre != null,
            supportingText = state.errorNombre?.let { { Text(it) } },
            singleLine = true,
            enabled = !state.guardando,
            shape = RoundedCornerShape(Dimensiones.RadioCampo),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = state.apaterno,
            onValueChange = onApaternoChange,
            label = { Text(stringResource(R.string.cuenta_editar_apaterno)) },
            singleLine = true,
            enabled = !state.guardando,
            shape = RoundedCornerShape(Dimensiones.RadioCampo),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = state.amaterno,
            onValueChange = onAmaternoChange,
            label = { Text(stringResource(R.string.cuenta_editar_amaterno)) },
            singleLine = true,
            enabled = !state.guardando,
            shape = RoundedCornerShape(Dimensiones.RadioCampo),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        CampoCorreo(
            valor = state.correo,
            onValorChange = onCorreoChange,
            etiqueta = stringResource(R.string.comun_correo),
            error = null,
            habilitado = !state.guardando,
            imeAction = ImeAction.Done
        )

        val errorGeneral = state.errorGeneral
        if (errorGeneral != null) {
            Spacer(modifier = Modifier.height(12.dp))
            BannerError(mensaje = errorGeneral)
        }

        Spacer(modifier = Modifier.height(24.dp))

        BotonPrincipal(
            texto = stringResource(R.string.cuenta_editar_guardar),
            textoCargando = stringResource(R.string.comun_guardando),
            cargando = state.guardando,
            onClick = onGuardar
        )
    }
}
