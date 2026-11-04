package com.finanzap.features.transacciones.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SelectableDates
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.ui.BannerError
import com.finanzap.core.ui.BotonPrincipal
import com.finanzap.core.ui.Dimensiones
import com.finanzap.core.ui.ErrorCampo
import com.finanzap.core.ui.PantallaFormulario
import com.finanzap.core.util.fechaIsoDesdeMillis
import com.finanzap.core.util.formatearFechaCorta
import com.finanzap.features.transacciones.Categoria
import com.finanzap.features.transacciones.TipoTransaccion

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegistrarTransaccionScreen(
    carteraId: Int,
    carteraNombre: String,
    onVolver: () -> Unit,
    viewModel: RegistrarTransaccionViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(carteraId) {
        viewModel.iniciar(carteraId)
    }

    LaunchedEffect(Unit) {
        viewModel.eventos.collect { evento ->
            when (evento) {
                TransaccionEvento.Guardada -> onVolver()
            }
        }
    }

    RegistrarTransaccionContenido(
        state = state,
        carteraNombre = carteraNombre,
        onVolver = onVolver,
        onTipoChange = viewModel::onTipoChange,
        onMontoChange = viewModel::onMontoChange,
        onCategoriaChange = viewModel::onCategoriaChange,
        onCrearCategoria = viewModel::crearCategoria,
        onFechaChange = viewModel::onFechaChange,
        onDescripcionChange = viewModel::onDescripcionChange,
        onGuardar = viewModel::guardar
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegistrarTransaccionContenido(
    state: RegistrarTransaccionUiState,
    carteraNombre: String,
    onVolver: () -> Unit,
    onTipoChange: (TipoTransaccion) -> Unit,
    onMontoChange: (String) -> Unit,
    onCategoriaChange: (Categoria) -> Unit,
    onCrearCategoria: (String) -> Unit,
    onFechaChange: (String) -> Unit,
    onDescripcionChange: (String) -> Unit,
    onGuardar: () -> Unit
) {
    var fechaEnEdicion by remember { mutableStateOf(false) }

    PantallaFormulario(
        titulo = stringResource(R.string.transaccion_titulo),
        onVolver = onVolver,
        descripcionVolver = stringResource(R.string.comun_volver)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Surface(
            shape = RoundedCornerShape(Dimensiones.RadioCampo),
            color = MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
                Text(
                    text = stringResource(R.string.carteras_titulo),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = carteraNombre.ifBlank { "#${state.idCartera}" },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = stringResource(R.string.transaccion_tipo),
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(
                selected = state.tipo == TipoTransaccion.INGRESO,
                onClick = { onTipoChange(TipoTransaccion.INGRESO) },
                label = { Text(stringResource(R.string.transaccion_ingreso)) }
            )
            FilterChip(
                selected = state.tipo == TipoTransaccion.GASTO,
                onClick = { onTipoChange(TipoTransaccion.GASTO) },
                label = { Text(stringResource(R.string.transaccion_gasto)) }
            )
        }
        state.errorTipo?.let {
            Spacer(modifier = Modifier.height(4.dp))
            ErrorCampo(mensaje = it)
        }

        Spacer(modifier = Modifier.height(14.dp))

        OutlinedTextField(
            value = state.monto,
            onValueChange = onMontoChange,
            label = { Text(stringResource(R.string.transaccion_monto)) },
            prefix = { Text("$") },
            singleLine = true,
            isError = state.errorMonto != null,
            supportingText = state.errorMonto?.let { { Text(it) } },
            shape = RoundedCornerShape(Dimensiones.RadioCampo),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        SelectorCategoria(
            categorias = state.categorias,
            seleccionada = state.categoria,
            onSeleccionar = onCategoriaChange,
            onCrear = onCrearCategoria,
            creando = state.creandoCategoria,
            error = state.errorCategoria ?: state.errorCategorias
        )

        Spacer(modifier = Modifier.height(12.dp))

        CampoFechaTransaccion(
            valor = formatearFechaCorta(state.fecha),
            onClick = { fechaEnEdicion = true }
        )
        state.errorFecha?.let {
            Spacer(modifier = Modifier.height(4.dp))
            ErrorCampo(mensaje = it)
        }

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = state.descripcion,
            onValueChange = onDescripcionChange,
            label = { Text(stringResource(R.string.transaccion_descripcion)) },
            isError = state.errorDescripcion != null,
            supportingText = state.errorDescripcion?.let { { Text(it) } },
            minLines = 3,
            maxLines = 5,
            shape = RoundedCornerShape(Dimensiones.RadioCampo),
            modifier = Modifier.fillMaxWidth()
        )

        val errorGeneral = state.errorGeneral
        if (errorGeneral != null) {
            Spacer(modifier = Modifier.height(12.dp))
            BannerError(mensaje = errorGeneral)
        }

        Spacer(modifier = Modifier.height(24.dp))

        BotonPrincipal(
            texto = stringResource(R.string.transaccion_guardar),
            textoCargando = stringResource(R.string.comun_guardando),
            cargando = state.guardando,
            onClick = onGuardar
        )
    }

    if (fechaEnEdicion) {
        val selector = rememberDatePickerState(
            selectableDates = object : SelectableDates {
                override fun isSelectableDate(utcTimeMillis: Long): Boolean =
                    utcTimeMillis <= System.currentTimeMillis()
            }
        )
        DatePickerDialog(
            onDismissRequest = { fechaEnEdicion = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        selector.selectedDateMillis?.let { onFechaChange(fechaIsoDesdeMillis(it)) }
                        fechaEnEdicion = false
                    }
                ) {
                    Text(stringResource(R.string.comun_aceptar))
                }
            },
            dismissButton = {
                TextButton(onClick = { fechaEnEdicion = false }) {
                    Text(stringResource(R.string.comun_cancelar))
                }
            }
        ) {
            DatePicker(state = selector)
        }
    }
}

@Composable
private fun CampoFechaTransaccion(
    valor: String?,
    onClick: () -> Unit
) {
    OutlinedButton(
        onClick = onClick,
        shape = RoundedCornerShape(Dimensiones.RadioCampo),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 18.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = stringResource(R.string.transaccion_fecha),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Start,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = valor ?: stringResource(R.string.nueva_cartera_sin_fecha),
            style = MaterialTheme.typography.bodyMedium,
            color = if (valor == null) {
                MaterialTheme.colorScheme.onSurfaceVariant
            } else {
                MaterialTheme.colorScheme.onSurface
            }
        )
        Spacer(modifier = Modifier.width(8.dp))
        Icon(
            imageVector = Icons.Default.DateRange,
            contentDescription = null,
            modifier = Modifier.size(18.dp)
        )
    }
}
