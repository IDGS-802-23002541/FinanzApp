package com.finanzap.features.transacciones.ui

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
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
import androidx.compose.ui.graphics.Color
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
import com.finanzap.core.ui.EncabezadoVolver
import com.finanzap.core.ui.EstadoError
import com.finanzap.core.ui.EstadoVacio
import com.finanzap.core.util.fechaIsoDesdeMillis
import com.finanzap.core.util.formatearFechaCorta
import com.finanzap.core.util.formatearMoneda
import com.finanzap.features.transacciones.TipoTransaccion
import com.finanzap.features.transacciones.Transaccion

@Composable
fun TransaccionesScreen(
    carteraId: Int,
    carteraNombre: String,
    onVolver: () -> Unit,
    viewModel: TransaccionesViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var transaccionEditar by remember { mutableStateOf<Transaccion?>(null) }
    var transaccionEliminar by remember { mutableStateOf<Transaccion?>(null) }

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        viewModel.cargar(carteraId)
    }

    LaunchedEffect(Unit) {
        viewModel.eventos.collect { evento ->
            when (evento) {
                TransaccionesEvento.Actualizada -> transaccionEditar = null
                TransaccionesEvento.Eliminada -> transaccionEliminar = null
            }
        }
    }

    TransaccionesContenido(
        state = state,
        carteraNombre = carteraNombre,
        onVolver = onVolver,
        onReintentar = viewModel::reintentar,
        onAnterior = viewModel::anterior,
        onSiguiente = viewModel::siguiente,
        onEditar = { transaccionEditar = it },
        onEliminar = { transaccionEliminar = it }
    )

    transaccionEditar?.let { transaccion ->
        EditarTransaccionDialog(
            transaccion = transaccion,
            operando = state.operando,
            error = state.errorOperacion,
            onCancelar = { if (!state.operando) transaccionEditar = null },
            onGuardar = { tipo, monto, fecha, descripcion ->
                viewModel.actualizar(
                    idTransaccion = transaccion.id,
                    tipo = tipo,
                    monto = monto,
                    fecha = fecha,
                    categoriaId = transaccion.categoriaId,
                    descripcion = descripcion
                )
            }
        )
    }

    transaccionEliminar?.let { transaccion ->
        AlertDialog(
            onDismissRequest = { if (!state.operando) transaccionEliminar = null },
            title = { Text(stringResource(R.string.transacciones_eliminar_titulo)) },
            text = {
                Column {
                    Text(stringResource(R.string.transacciones_eliminar_mensaje))
                    state.errorOperacion?.let {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = it,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(
                    onClick = { viewModel.eliminar(transaccion.id) },
                    enabled = !state.operando
                ) {
                    if (state.operando) {
                        CircularProgressIndicator(
                            modifier = Modifier.height(18.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            text = stringResource(R.string.comun_eliminar),
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { transaccionEliminar = null },
                    enabled = !state.operando
                ) {
                    Text(stringResource(R.string.comun_cancelar))
                }
            }
        )
    }
}

@Composable
fun TransaccionesContenido(
    state: TransaccionesUiState,
    carteraNombre: String,
    onVolver: () -> Unit,
    onReintentar: () -> Unit,
    onAnterior: () -> Unit,
    onSiguiente: () -> Unit,
    onEditar: (Transaccion) -> Unit,
    onEliminar: (Transaccion) -> Unit
) {
    Scaffold(
        containerColor = MaterialTheme.colorScheme.background
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
                    titulo = stringResource(R.string.transacciones_titulo),
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

            when {
                state.cargando -> item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 48.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }

                state.error != null -> item {
                    EstadoError(
                        mensaje = state.error,
                        onReintentar = onReintentar
                    )
                }

                state.transacciones.isEmpty() -> item {
                    EstadoVacio(
                        icono = Icons.AutoMirrored.Filled.List,
                        titulo = stringResource(R.string.transacciones_vacio_titulo),
                        mensaje = stringResource(R.string.transacciones_vacio_mensaje)
                    )
                }

                else -> {
                    item {
                        ResumenTotales(state)
                    }
                    items(items = state.transacciones, key = { it.id }) { transaccion ->
                        FilaTransaccion(
                            transaccion = transaccion,
                            onEditar = onEditar,
                            onEliminar = onEliminar
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
private fun ResumenTotales(state: TransaccionesUiState) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Row(modifier = Modifier.padding(vertical = 14.dp, horizontal = 10.dp)) {
            Metrica(
                etiqueta = stringResource(R.string.transacciones_ingresos),
                valor = formatearMoneda(state.totalIngresos),
                colorValor = MaterialTheme.colorScheme.primary,
                modifier = Modifier.weight(1f)
            )
            Metrica(
                etiqueta = stringResource(R.string.transacciones_gastos),
                valor = formatearMoneda(state.totalGastos),
                colorValor = MaterialTheme.colorScheme.error,
                modifier = Modifier.weight(1f)
            )
            Metrica(
                etiqueta = stringResource(R.string.transacciones_balance),
                valor = formatearMoneda(state.balance),
                colorValor = if (state.balance < 0) {
                    MaterialTheme.colorScheme.error
                } else {
                    MaterialTheme.colorScheme.primary
                },
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun FilaTransaccion(
    transaccion: Transaccion,
    onEditar: (Transaccion) -> Unit,
    onEliminar: (Transaccion) -> Unit
) {
    val esIngreso = transaccion.tipo == TipoTransaccion.INGRESO
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 1.dp
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = transaccion.descripcion
                        ?: transaccion.categoria
                        ?: stringResource(R.string.transacciones_titulo),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                if (transaccion.categoria != null && transaccion.descripcion != null) {
                    Text(
                        text = transaccion.categoria,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                val detalle = listOfNotNull(
                    transaccion.fecha?.let { formatearFechaCorta(it) },
                    transaccion.autor
                ).joinToString(" · ")
                if (detalle.isNotBlank()) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = detalle,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = (if (esIngreso) "+" else "-") + formatearMoneda(transaccion.monto),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = if (esIngreso) {
                        MaterialTheme.colorScheme.primary
                    } else {
                        MaterialTheme.colorScheme.error
                    }
                )
                Row {
                    IconButton(onClick = { onEditar(transaccion) }) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = stringResource(R.string.comun_editar)
                        )
                    }
                    IconButton(onClick = { onEliminar(transaccion) }) {
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
            text = stringResource(R.string.transacciones_pagina, pagina, totalPaginas),
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
private fun Metrica(
    etiqueta: String,
    valor: String,
    colorValor: Color,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = etiqueta,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = valor,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = colorValor,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun EditarTransaccionDialog(
    transaccion: Transaccion,
    operando: Boolean,
    error: String?,
    onCancelar: () -> Unit,
    onGuardar: (TipoTransaccion, Double, String, String?) -> Unit
) {
    var tipo by remember(transaccion.id) { mutableStateOf(transaccion.tipo) }
    var monto by remember(transaccion.id) { mutableStateOf(transaccion.monto.toString()) }
    var fecha by remember(transaccion.id) {
        mutableStateOf(transaccion.fecha ?: fechaIsoDesdeMillis(System.currentTimeMillis()))
    }
    var descripcion by remember(transaccion.id) {
        mutableStateOf(transaccion.descripcion.orEmpty())
    }
    var errorMonto by remember { mutableStateOf<String?>(null) }
    var fechaEnEdicion by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = { if (!operando) onCancelar() },
        title = { Text(stringResource(R.string.transacciones_editar_titulo)) },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(
                        selected = tipo == TipoTransaccion.INGRESO,
                        onClick = { tipo = TipoTransaccion.INGRESO },
                        label = { Text(stringResource(R.string.transaccion_ingreso)) },
                        enabled = !operando
                    )
                    FilterChip(
                        selected = tipo == TipoTransaccion.GASTO,
                        onClick = { tipo = TipoTransaccion.GASTO },
                        label = { Text(stringResource(R.string.transaccion_gasto)) },
                        enabled = !operando
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = monto,
                    onValueChange = { monto = it; errorMonto = null },
                    label = { Text(stringResource(R.string.transaccion_monto)) },
                    prefix = { Text("$") },
                    singleLine = true,
                    isError = errorMonto != null,
                    supportingText = errorMonto?.let { { Text(it) } },
                    enabled = !operando,
                    shape = RoundedCornerShape(10.dp),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = stringResource(
                        R.string.transacciones_categoria_actual,
                        transaccion.categoria ?: stringResource(R.string.transacciones_sin_categoria)
                    ),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedButton(
                    onClick = { fechaEnEdicion = true },
                    enabled = !operando,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = stringResource(R.string.transaccion_fecha),
                        modifier = Modifier.weight(1f)
                    )
                    Text(formatearFechaCorta(fecha))
                }
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = descripcion,
                    onValueChange = { descripcion = it },
                    label = { Text(stringResource(R.string.transaccion_descripcion)) },
                    minLines = 2,
                    maxLines = 3,
                    enabled = !operando,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                if (error != null) {
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
                onClick = {
                    val valor = monto.trim().replace(",", "").toDoubleOrNull()
                    if (valor == null || valor <= 0.0) {
                        errorMonto = "Ingresa un monto mayor a 0."
                    } else {
                        onGuardar(
                            tipo,
                            valor,
                            fecha,
                            descripcion.trim().ifBlank { null }
                        )
                    }
                },
                enabled = !operando
            ) {
                if (operando) {
                    CircularProgressIndicator(
                        modifier = Modifier.height(18.dp),
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(stringResource(R.string.comun_guardar))
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onCancelar, enabled = !operando) {
                Text(stringResource(R.string.comun_cancelar))
            }
        }
    )

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
                        selector.selectedDateMillis?.let { fecha = fechaIsoDesdeMillis(it) }
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