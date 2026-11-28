package com.finanzap.features.notificaciones.ui

import androidx.compose.foundation.background
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
import com.finanzap.core.ui.Dimensiones
import com.finanzap.core.ui.EncabezadoVolver
import com.finanzap.core.ui.EstadoError
import com.finanzap.core.ui.EstadoVacio
import com.finanzap.core.util.formatearFechaHoraCorta
import com.finanzap.features.notificaciones.data.Notificacion

@Composable
fun NotificacionesScreen(
    onVolver: () -> Unit,
    viewModel: NotificacionesViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.cargar()
    }

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        viewModel.cargar()
    }

    NotificacionesContenido(
        state = state,
        onVolver = onVolver,
        onReintentar = viewModel::cargar,
        onAnterior = viewModel::anterior,
        onSiguiente = viewModel::siguiente,
        onMarcarTodas = viewModel::marcarTodasLeidas,
        onMarcarLeida = viewModel::marcarLeida
    )
}

@Composable
fun NotificacionesContenido(
    state: NotificacionesUiState,
    onVolver: () -> Unit,
    onReintentar: () -> Unit,
    onAnterior: () -> Unit,
    onSiguiente: () -> Unit,
    onMarcarTodas: () -> Unit,
    onMarcarLeida: (Notificacion) -> Unit
) {
    Scaffold(containerColor = MaterialTheme.colorScheme.background) { margen ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(margen),
            contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 16.dp, bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                EncabezadoVolver(
                    titulo = stringResource(R.string.notificaciones_centro_titulo),
                    onVolver = onVolver,
                    descripcionVolver = stringResource(R.string.comun_volver),
                    mostrarVolver = false
                )
            }

            item {
                Text(
                    text = stringResource(R.string.notificaciones_descripcion),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (state.noLeidas > 0) {
                item {
                    OutlinedButton(
                        onClick = onMarcarTodas,
                        enabled = !state.operando,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(Dimensiones.RadioCampo)
                    ) {
                        Text(stringResource(R.string.notificaciones_marcar_todas))
                    }
                }
            }

            when {
                state.cargando -> item { CargandoNotificaciones() }

                state.error != null -> item {
                    EstadoError(mensaje = state.error, onReintentar = onReintentar)
                }

                state.notificaciones.isEmpty() -> item {
                    EstadoVacio(
                        icono = Icons.AutoMirrored.Filled.List,
                        titulo = stringResource(R.string.notificaciones_vacio_titulo),
                        mensaje = stringResource(R.string.notificaciones_vacio_mensaje)
                    )
                }

                else -> {
                    items(items = state.notificaciones, key = { it.id }) { notificacion ->
                        TarjetaNotificacion(
                            notificacion = notificacion,
                            onClick = { onMarcarLeida(notificacion) }
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
private fun TarjetaNotificacion(
    notificacion: Notificacion,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        color = if (notificacion.leida) {
            MaterialTheme.colorScheme.surface
        } else {
            MaterialTheme.colorScheme.surfaceVariant
        },
        shadowElevation = if (notificacion.leida) 0.dp else 1.dp
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .padding(top = 4.dp)
                    .size(9.dp)
                    .background(
                        color = if (notificacion.leida) {
                            MaterialTheme.colorScheme.outline
                        } else {
                            MaterialTheme.colorScheme.tertiary
                        },
                        shape = CircleShape
                    )
            )
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = notificacion.titulo,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = if (notificacion.leida) FontWeight.Normal else FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    notificacion.tipo?.let { tipo ->
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = etiquetaTipo(tipo),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = notificacion.mensaje,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                notificacion.fechaCreacion?.let { fecha ->
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = formatearFechaHoraCorta(fecha),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
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
    Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        TextButton(onClick = onAnterior, enabled = pagina > 1) {
            Text(stringResource(R.string.comun_anterior))
        }
        Text(
            text = stringResource(R.string.notificaciones_pagina, pagina, totalPaginas),
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
private fun CargandoNotificaciones() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 48.dp),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator()
    }
}

@Composable
private fun etiquetaTipo(tipo: String): String = when (tipo) {
    "MOVIMIENTO" -> stringResource(R.string.notificaciones_tipo_movimiento)
    "PAGOS" -> stringResource(R.string.notificaciones_tipo_pagos)
    "SISTEMA" -> stringResource(R.string.notificaciones_tipo_sistema)
    else -> tipo
}
