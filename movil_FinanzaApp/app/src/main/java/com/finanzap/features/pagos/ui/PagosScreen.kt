package com.finanzap.features.pagos.ui

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
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
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.ui.BannerError
import com.finanzap.core.ui.BotonPrincipal
import com.finanzap.core.ui.Dimensiones
import com.finanzap.core.ui.EncabezadoVolver
import com.finanzap.core.ui.EstadoError
import com.finanzap.core.ui.EstadoVacio
import com.finanzap.core.util.fechaIsoDesdeMillis
import com.finanzap.core.util.formatearFechaCorta
import com.finanzap.core.util.formatearMoneda
import com.finanzap.features.pagos.data.FRECUENCIAS_PAGO
import com.finanzap.features.pagos.data.PagoRecurrente

private enum class CampoFecha { INICIO, FIN }

@Composable
fun PagosScreen(
    carteraId: Int,
    carteraNombre: String,
    puedeEditar: Boolean,
    onVolver: () -> Unit,
    viewModel: PagosViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var pagoACancelar by remember { mutableStateOf<PagoRecurrente?>(null) }
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current

    // La primera carga no depende de ON_RESUME: al navegar, ese evento ya ocurrió.
    LaunchedEffect(carteraId) {
        viewModel.cargar(carteraId)
    }

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        viewModel.cargar(carteraId)
    }

    LaunchedEffect(Unit) {
        viewModel.eventos.collect { evento ->
            when (evento) {
                PagosEvento.Cancelado -> pagoACancelar = null
                PagosEvento.MarcadoHecho -> snackbar.showSnackbar(
                    context.getString(R.string.pagos_marcado_hecho)
                )
            }
        }
    }

    PagosContenido(
        state = state,
        carteraNombre = carteraNombre,
        puedeEditar = puedeEditar,
        snackbar = snackbar,
        onVolver = onVolver,
        onReintentar = viewModel::reintentar,
        onAnterior = viewModel::anterior,
        onSiguiente = viewModel::siguiente,
        onAbrirFormulario = viewModel::abrirFormulario,
        onEditar = viewModel::abrirEdicion,
        onCancelar = { pagoACancelar = it },
        onMarcarHecho = viewModel::marcarHecho,
        onNombreChange = viewModel::onNombreChange,
        onMontoChange = viewModel::onMontoChange,
        onFrecuenciaChange = viewModel::onFrecuenciaChange,
        onFechaInicioChange = viewModel::onFechaInicioChange,
        onFechaFinChange = viewModel::onFechaFinChange,
        onDescripcionChange = viewModel::onDescripcionChange,
        onGuardar = viewModel::guardar,
        onCerrarFormulario = viewModel::cerrarFormulario
    )

    pagoACancelar?.let { pago ->
        AlertDialog(
            onDismissRequest = { if (!state.cancelando) pagoACancelar = null },
            title = { Text(stringResource(R.string.pagos_cancelar_titulo)) },
            text = {
                Column {
                    Text(stringResource(R.string.pagos_cancelar_mensaje))
                    state.errorCancelar?.let { error ->
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = error,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(
                    onClick = { viewModel.cancelar(pago.id) },
                    enabled = !state.cancelando
                ) {
                    if (state.cancelando) {
                        CircularProgressIndicator(
                            modifier = Modifier.height(18.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            text = stringResource(R.string.pagos_cancelar_confirmar),
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { pagoACancelar = null },
                    enabled = !state.cancelando
                ) {
                    Text(stringResource(R.string.comun_cancelar))
                }
            }
        )
    }
}

@Composable
fun PagosContenido(
    state: PagosUiState,
    carteraNombre: String,
    puedeEditar: Boolean,
    snackbar: SnackbarHostState,
    onVolver: () -> Unit,
    onReintentar: () -> Unit,
    onAnterior: () -> Unit,
    onSiguiente: () -> Unit,
    onAbrirFormulario: () -> Unit,
    onEditar: (PagoRecurrente) -> Unit,
    onCancelar: (PagoRecurrente) -> Unit,
    onMarcarHecho: (PagoRecurrente) -> Unit,
    onNombreChange: (String) -> Unit,
    onMontoChange: (String) -> Unit,
    onFrecuenciaChange: (String) -> Unit,
    onFechaInicioChange: (String) -> Unit,
    onFechaFinChange: (String) -> Unit,
    onDescripcionChange: (String) -> Unit,
    onGuardar: () -> Unit,
    onCerrarFormulario: () -> Unit
) {
    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        snackbarHost = { SnackbarHost(snackbar) }
    ) { margen ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(margen),
            contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 16.dp, bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                EncabezadoVolver(
                    titulo = stringResource(R.string.pagos_titulo),
                    onVolver = onVolver,
                    descripcionVolver = stringResource(R.string.comun_volver)
                )
            }

            if (carteraNombre.isNotBlank()) {
                item {
                    Text(
                        text = carteraNombre,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                }
            }

            item {
                Text(
                    text = stringResource(R.string.pagos_descripcion),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (puedeEditar) {
                item {
                    BotonPrincipal(
                        texto = stringResource(R.string.pagos_nuevo),
                        onClick = onAbrirFormulario,
                        iconoFinal = Icons.Default.Add
                    )
                }
            } else {
                item {
                    Text(
                        text = stringResource(R.string.pagos_aviso_miembro),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            if (state.formularioAbierto) {
                item {
                    FormularioPago(
                        state = state,
                        onNombreChange = onNombreChange,
                        onMontoChange = onMontoChange,
                        onFrecuenciaChange = onFrecuenciaChange,
                        onFechaInicioChange = onFechaInicioChange,
                        onFechaFinChange = onFechaFinChange,
                        onDescripcionChange = onDescripcionChange,
                        onGuardar = onGuardar,
                        onCancelar = onCerrarFormulario
                    )
                }
            }

            state.errorMarcarHecho?.let { mensaje ->
                item { BannerError(mensaje = mensaje) }
            }

            when {
                state.cargando -> item { CargandoPagos() }

                state.error != null -> item {
                    EstadoError(mensaje = state.error, onReintentar = onReintentar)
                }

                state.pagos.isEmpty() && !state.formularioAbierto -> item {
                    EstadoVacio(
                        icono = Icons.AutoMirrored.Filled.List,
                        titulo = stringResource(R.string.pagos_vacio_titulo),
                        mensaje = stringResource(R.string.pagos_vacio_mensaje)
                    )
                }

                else -> {
                    items(items = state.pagos, key = { it.id }) { pago ->
                        TarjetaPago(
                            pago = pago,
                            puedeEditar = puedeEditar,
                            marcandoHecho = state.marcandoHechoId == pago.id,
                            onEditar = onEditar,
                            onCancelar = onCancelar,
                            onMarcarHecho = onMarcarHecho
                        )
                    }
                    item {
                        Paginacion(
                            pagina = state.pagina,
                            totalPaginas = state.totalPaginas,
                            onAnterior = onAnterior,
                            onSiguiente = onSiguiente
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun FormularioPago(
    state: PagosUiState,
    onNombreChange: (String) -> Unit,
    onMontoChange: (String) -> Unit,
    onFrecuenciaChange: (String) -> Unit,
    onFechaInicioChange: (String) -> Unit,
    onFechaFinChange: (String) -> Unit,
    onDescripcionChange: (String) -> Unit,
    onGuardar: () -> Unit,
    onCancelar: () -> Unit
) {
    var campoFecha by remember { mutableStateOf<CampoFecha?>(null) }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(Dimensiones.RadioCampo),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(
                    if (state.pagoEnEdicionId == null) {
                        R.string.pagos_formulario_nuevo_titulo
                    } else {
                        R.string.pagos_formulario_editar_titulo
                    }
                ),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = state.nombre,
                onValueChange = onNombreChange,
                label = { Text(stringResource(R.string.pagos_nombre)) },
                isError = state.errorNombre != null,
                supportingText = state.errorNombre?.let { { Text(stringResource(it)) } },
                singleLine = true,
                enabled = !state.guardando,
                shape = RoundedCornerShape(Dimensiones.RadioCampo),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedTextField(
                value = state.monto,
                onValueChange = onMontoChange,
                label = { Text(stringResource(R.string.pagos_monto)) },
                prefix = { Text("$") },
                isError = state.errorMonto != null,
                supportingText = state.errorMonto?.let { { Text(stringResource(it)) } },
                singleLine = true,
                enabled = !state.guardando,
                shape = RoundedCornerShape(Dimensiones.RadioCampo),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = stringResource(R.string.pagos_frecuencia),
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.horizontalScroll(rememberScrollState())
            ) {
                FRECUENCIAS_PAGO.forEach { frecuencia ->
                    FilterChip(
                        selected = state.frecuencia == frecuencia,
                        onClick = { onFrecuenciaChange(frecuencia) },
                        enabled = !state.guardando,
                        label = { Text(etiquetaFrecuencia(frecuencia)) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            OutlinedButton(
                onClick = { campoFecha = CampoFecha.INICIO },
                enabled = !state.guardando,
                shape = RoundedCornerShape(Dimensiones.RadioCampo),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = stringResource(R.string.pagos_fecha_inicio),
                    modifier = Modifier.weight(1f)
                )
                Text(formatearFechaCorta(state.fechaInicio))
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedButton(
                    onClick = { campoFecha = CampoFecha.FIN },
                    enabled = !state.guardando,
                    shape = RoundedCornerShape(Dimensiones.RadioCampo),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = stringResource(R.string.pagos_fecha_fin),
                        modifier = Modifier.weight(1f)
                    )
                    Text(
                        text = if (state.fechaFin.isBlank()) {
                            stringResource(R.string.pagos_sin_fecha)
                        } else {
                            formatearFechaCorta(state.fechaFin)
                        }
                    )
                }
                if (state.fechaFin.isNotBlank()) {
                    IconButton(onClick = { onFechaFinChange("") }) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = stringResource(R.string.pagos_quitar_fecha)
                        )
                    }
                }
            }

            state.errorFechas?.let { error ->
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = stringResource(error),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            OutlinedTextField(
                value = state.descripcion,
                onValueChange = onDescripcionChange,
                label = { Text(stringResource(R.string.pagos_descripcion_campo)) },
                minLines = 2,
                maxLines = 3,
                enabled = !state.guardando,
                shape = RoundedCornerShape(Dimensiones.RadioCampo),
                modifier = Modifier.fillMaxWidth()
            )

            state.errorFormulario?.let { mensaje ->
                Spacer(modifier = Modifier.height(12.dp))
                BannerError(mensaje = mensaje)
            }

            Spacer(modifier = Modifier.height(18.dp))

            BotonPrincipal(
                texto = stringResource(R.string.pagos_guardar),
                textoCargando = stringResource(R.string.comun_guardando),
                cargando = state.guardando,
                onClick = onGuardar
            )

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = onCancelar,
                enabled = !state.guardando,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(stringResource(R.string.comun_cancelar))
            }
        }
    }

    campoFecha?.let { campo ->
        SelectorFechaPago(
            onAceptar = { nueva ->
                if (campo == CampoFecha.INICIO) {
                    onFechaInicioChange(nueva)
                } else {
                    onFechaFinChange(nueva)
                }
            },
            onCerrar = { campoFecha = null }
        )
    }
}

@Composable
private fun TarjetaPago(
    pago: PagoRecurrente,
    puedeEditar: Boolean,
    marcandoHecho: Boolean,
    onEditar: (PagoRecurrente) -> Unit,
    onCancelar: (PagoRecurrente) -> Unit,
    onMarcarHecho: (PagoRecurrente) -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 1.dp
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = pago.nombre,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = stringResource(
                            R.string.pagos_frecuencia_texto,
                            etiquetaFrecuencia(pago.frecuencia)
                        ),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    text = formatearMoneda(pago.monto),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            pago.descripcion?.takeIf { it.isNotBlank() }?.let { descripcion ->
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = descripcion,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                ChipEstado(pago.estado)
                pago.proximaEjecucion?.let { proxima ->
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = stringResource(
                            R.string.pagos_proxima_ejecucion,
                            formatearFechaCorta(proxima)
                        ),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            if (pago.estado != "CANCELADO") {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    OutlinedButton(
                        onClick = { onMarcarHecho(pago) },
                        enabled = !marcandoHecho,
                        shape = RoundedCornerShape(Dimensiones.RadioCampo),
                        modifier = Modifier.weight(1f)
                    ) {
                        if (marcandoHecho) {
                            CircularProgressIndicator(
                                modifier = Modifier.height(18.dp),
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(stringResource(R.string.pagos_marcando))
                        } else {
                            Text(stringResource(R.string.pagos_marcar_hecho))
                        }
                    }
                    if (puedeEditar) {
                        IconButton(onClick = { onEditar(pago) }) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = stringResource(R.string.comun_editar)
                            )
                        }
                        IconButton(onClick = { onCancelar(pago) }) {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = stringResource(R.string.comun_eliminar)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ChipEstado(estado: String) {
    Surface(
        shape = RoundedCornerShape(percent = 50),
        color = MaterialTheme.colorScheme.secondaryContainer
    ) {
        Text(
            text = etiquetaEstado(estado),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSecondaryContainer,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        )
    }
}

@Composable
private fun Paginacion(
    pagina: Int,
    totalPaginas: Int,
    onAnterior: () -> Unit,
    onSiguiente: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        TextButton(onClick = onAnterior, enabled = pagina > 1) {
            Text(stringResource(R.string.comun_anterior))
        }
        Text(
            text = stringResource(R.string.pagos_pagina, pagina, totalPaginas),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.weight(1f)
        )
        TextButton(onClick = onSiguiente, enabled = pagina < totalPaginas) {
            Text(stringResource(R.string.comun_siguiente))
        }
    }
}

@Composable
private fun CargandoPagos() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 48.dp),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SelectorFechaPago(
    onAceptar: (String) -> Unit,
    onCerrar: () -> Unit
) {
    val selector = rememberDatePickerState()

    DatePickerDialog(
        onDismissRequest = onCerrar,
        confirmButton = {
            TextButton(
                onClick = {
                    selector.selectedDateMillis?.let { onAceptar(fechaIsoDesdeMillis(it)) }
                    onCerrar()
                },
                enabled = selector.selectedDateMillis != null
            ) {
                Text(stringResource(R.string.comun_aceptar))
            }
        },
        dismissButton = {
            TextButton(onClick = onCerrar) {
                Text(stringResource(R.string.comun_cancelar))
            }
        }
    ) {
        DatePicker(state = selector)
    }
}

@Composable
private fun etiquetaFrecuencia(frecuencia: String): String = when (frecuencia) {
    "DIARIO" -> stringResource(R.string.pagos_frecuencia_diaria)
    "SEMANAL" -> stringResource(R.string.pagos_frecuencia_semanal)
    "ANUAL" -> stringResource(R.string.pagos_frecuencia_anual)
    else -> stringResource(R.string.pagos_frecuencia_mensual)
}

@Composable
private fun etiquetaEstado(estado: String): String = when (estado) {
    "PAUSADO" -> stringResource(R.string.pagos_estado_pausado)
    "CANCELADO" -> stringResource(R.string.pagos_estado_cancelado)
    else -> stringResource(R.string.pagos_estado_activo)
}
