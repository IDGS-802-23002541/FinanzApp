package com.finanzap.features.carteras.ui.formulario

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
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
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
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
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.ui.components.BannerError
import com.finanzap.core.util.fechaIsoDesdeMillis
import com.finanzap.core.util.formatearFechaCorta
import com.finanzap.features.carteras.model.TipoCartera

private enum class CampoFecha { INICIO, FIN }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NuevaCarteraScreen(
    onVolver: () -> Unit,
    onCreada: () -> Unit,
    viewModel: NuevaCarteraViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var fechaEnEdicion by remember { mutableStateOf<CampoFecha?>(null) }

    LaunchedEffect(state.creada) {
        if (state.creada) onCreada()
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
                        contentDescription = stringResource(R.string.nueva_cartera_volver)
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = stringResource(R.string.nueva_cartera_titulo),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = state.nombre,
                onValueChange = viewModel::onNombreChange,
                label = { Text(stringResource(R.string.nueva_cartera_nombre)) },
                isError = state.errorNombre != null,
                supportingText = state.errorNombre?.let { { Text(it) } },
                singleLine = true,
                enabled = !state.guardando,
                shape = RoundedCornerShape(10.dp),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(18.dp))

            Text(
                text = stringResource(R.string.nueva_cartera_tipo),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onBackground
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.horizontalScroll(rememberScrollState())
            ) {
                TipoCartera.entries.forEach { tipo ->
                    FilterChip(
                        selected = state.tipo == tipo,
                        onClick = { viewModel.onTipoChange(tipo) },
                        enabled = !state.guardando,
                        label = { Text(tipo.etiqueta) }
                    )
                }
            }

            val errorTipo = state.errorTipo
            if (errorTipo != null) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = errorTipo,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            OutlinedTextField(
                value = state.descripcion,
                onValueChange = viewModel::onDescripcionChange,
                label = { Text(stringResource(R.string.nueva_cartera_descripcion)) },
                isError = state.errorDescripcion != null,
                supportingText = state.errorDescripcion?.let { { Text(it) } },
                enabled = !state.guardando,
                minLines = 3,
                maxLines = 5,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = state.presupuesto,
                onValueChange = viewModel::onPresupuestoChange,
                label = { Text(stringResource(R.string.nueva_cartera_presupuesto)) },
                isError = state.errorPresupuesto != null,
                supportingText = state.errorPresupuesto?.let { { Text(it) } },
                singleLine = true,
                enabled = !state.guardando,
                shape = RoundedCornerShape(10.dp),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Decimal,
                    imeAction = ImeAction.Next
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(12.dp))

            CampoFecha(
                etiqueta = stringResource(R.string.nueva_cartera_fecha_inicio),
                valor = state.fechaInicio?.let { formatearFechaCorta(it) },
                habilitado = !state.guardando,
                onClick = { fechaEnEdicion = CampoFecha.INICIO }
            )

            Spacer(modifier = Modifier.height(12.dp))

            CampoFecha(
                etiqueta = stringResource(R.string.nueva_cartera_fecha_fin),
                valor = state.fechaFin?.let { formatearFechaCorta(it) },
                habilitado = !state.guardando,
                onClick = { fechaEnEdicion = CampoFecha.FIN }
            )

            val errorFechas = state.errorFechas
            if (errorFechas != null) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = errorFechas,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error
                )
            }

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
                    Text(stringResource(R.string.nueva_cartera_guardando))
                } else {
                    Text(stringResource(R.string.nueva_cartera_guardar))
                }
            }
        }
    }

    fechaEnEdicion?.let { campo ->
        val selector = rememberDatePickerState()
        DatePickerDialog(
            onDismissRequest = { fechaEnEdicion = null },
            confirmButton = {
                TextButton(
                    onClick = {
                        selector.selectedDateMillis?.let { millis ->
                            val iso = fechaIsoDesdeMillis(millis)
                            when (campo) {
                                CampoFecha.INICIO -> viewModel.onFechaInicioChange(iso)
                                CampoFecha.FIN -> viewModel.onFechaFinChange(iso)
                            }
                        }
                        fechaEnEdicion = null
                    }
                ) {
                    Text(stringResource(R.string.comun_aceptar))
                }
            },
            dismissButton = {
                TextButton(onClick = { fechaEnEdicion = null }) {
                    Text(stringResource(R.string.comun_cancelar))
                }
            }
        ) {
            DatePicker(state = selector)
        }
    }
}

@Composable
private fun CampoFecha(
    etiqueta: String,
    valor: String?,
    habilitado: Boolean,
    onClick: () -> Unit
) {
    OutlinedButton(
        onClick = onClick,
        enabled = habilitado,
        shape = RoundedCornerShape(10.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 18.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = etiqueta,
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
