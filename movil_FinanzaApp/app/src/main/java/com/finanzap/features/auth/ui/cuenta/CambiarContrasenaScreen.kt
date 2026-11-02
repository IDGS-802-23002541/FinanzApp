package com.finanzap.features.auth.ui.cuenta

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
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
import com.finanzap.core.ui.components.BannerError
import com.finanzap.core.ui.components.BotonPrincipal
import com.finanzap.core.ui.components.CampoContrasena
import com.finanzap.core.ui.components.PantallaFormulario

@Composable
fun CambiarContrasenaScreen(
    onVolver: () -> Unit,
    onCambiada: () -> Unit,
    viewModel: CambiarContrasenaViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.eventos.collect { evento ->
            when (evento) {
                CambiarContrasenaEvento.ContrasenaCambiada -> onCambiada()
            }
        }
    }

    CambiarContrasenaContenido(
        state = state,
        onVolver = onVolver,
        onActualChange = viewModel::onActualChange,
        onNuevaChange = viewModel::onNuevaChange,
        onConfirmarChange = viewModel::onConfirmarChange,
        onToggleVisibles = viewModel::onToggleVisibles,
        onGuardar = viewModel::guardar
    )
}

@Composable
fun CambiarContrasenaContenido(
    state: CambiarContrasenaUiState,
    onVolver: () -> Unit,
    onActualChange: (String) -> Unit,
    onNuevaChange: (String) -> Unit,
    onConfirmarChange: (String) -> Unit,
    onToggleVisibles: () -> Unit,
    onGuardar: () -> Unit
) {
    PantallaFormulario(
        titulo = stringResource(R.string.cambiar_contrasena_titulo),
        onVolver = onVolver,
        descripcionVolver = stringResource(R.string.cambiar_contrasena_volver)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        CampoContrasena(
            valor = state.actual,
            onValorChange = onActualChange,
            etiqueta = stringResource(R.string.cambiar_contrasena_actual),
            error = state.errorActual,
            visible = state.visibles,
            onToggleVisible = onToggleVisibles,
            habilitado = !state.guardando,
            imeAction = ImeAction.Next
        )

        Spacer(modifier = Modifier.height(12.dp))

        CampoContrasena(
            valor = state.nueva,
            onValorChange = onNuevaChange,
            etiqueta = stringResource(R.string.cambiar_contrasena_nueva),
            error = state.errorNueva,
            visible = state.visibles,
            onToggleVisible = onToggleVisibles,
            habilitado = !state.guardando,
            imeAction = ImeAction.Next
        )

        Spacer(modifier = Modifier.height(12.dp))

        CampoContrasena(
            valor = state.confirmar,
            onValorChange = onConfirmarChange,
            etiqueta = stringResource(R.string.cambiar_contrasena_confirmar),
            error = state.errorConfirmar,
            visible = state.visibles,
            onToggleVisible = onToggleVisibles,
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
            texto = stringResource(R.string.cambiar_contrasena_guardar),
            textoCargando = stringResource(R.string.cambiar_contrasena_guardando),
            cargando = state.guardando,
            onClick = onGuardar
        )
    }
}
