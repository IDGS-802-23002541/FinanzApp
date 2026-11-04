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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
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

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        viewModel.cargar(carteraId)
    }

    TransaccionesContenido(
        state = state,
        carteraNombre = carteraNombre,
        onVolver = onVolver,
        onReintentar = viewModel::reintentar,
        onAnterior = viewModel::anterior,
        onSiguiente = viewModel::siguiente
    )
}

@Composable
fun TransaccionesContenido(
    state: TransaccionesUiState,
    carteraNombre: String,
    onVolver: () -> Unit,
    onReintentar: () -> Unit,
    onAnterior: () -> Unit,
    onSiguiente: () -> Unit
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
                        FilaTransaccion(transaccion)
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
private fun FilaTransaccion(transaccion: Transaccion) {
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
