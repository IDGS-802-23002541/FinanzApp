package com.finanzap.features.soporte.ui

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
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
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
import com.finanzap.core.util.formatearFechaHoraCorta
import com.finanzap.features.soporte.data.CATEGORIAS_SOPORTE
import com.finanzap.features.soporte.data.PRIORIDADES_SOPORTE
import com.finanzap.features.soporte.data.Ticket

@Composable
fun SoporteScreen(
    onVolver: () -> Unit,
    viewModel: SoporteViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        viewModel.cargar()
    }

    SoporteContenido(
        state = state,
        onVolver = onVolver,
        onReintentar = viewModel::cargar,
        onAnterior = viewModel::anterior,
        onSiguiente = viewModel::siguiente,
        onAbrirFormulario = viewModel::abrirFormulario,
        onCerrarFormulario = viewModel::cerrarFormulario,
        onAsuntoChange = viewModel::onAsuntoChange,
        onDescripcionChange = viewModel::onDescripcionChange,
        onCategoriaChange = viewModel::onCategoriaChange,
        onPrioridadChange = viewModel::onPrioridadChange,
        onCrearTicket = viewModel::crearTicket,
        onAbrirRespuesta = viewModel::abrirRespuesta,
        onCerrarRespuesta = viewModel::cerrarRespuesta,
        onMensajeRespuestaChange = viewModel::onMensajeRespuestaChange,
        onEnviarRespuesta = viewModel::enviarRespuesta
    )
}

@Composable
fun SoporteContenido(
    state: SoporteUiState,
    onVolver: () -> Unit,
    onReintentar: () -> Unit,
    onAnterior: () -> Unit,
    onSiguiente: () -> Unit,
    onAbrirFormulario: () -> Unit,
    onCerrarFormulario: () -> Unit,
    onAsuntoChange: (String) -> Unit,
    onDescripcionChange: (String) -> Unit,
    onCategoriaChange: (String) -> Unit,
    onPrioridadChange: (String) -> Unit,
    onCrearTicket: () -> Unit,
    onAbrirRespuesta: (Int) -> Unit,
    onCerrarRespuesta: () -> Unit,
    onMensajeRespuestaChange: (String) -> Unit,
    onEnviarRespuesta: () -> Unit
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
                    titulo = stringResource(R.string.soporte_titulo),
                    onVolver = onVolver,
                    descripcionVolver = stringResource(R.string.comun_volver)
                )
            }

            if (state.formularioAbierto) {
                item {
                    FormularioReporte(
                        state = state,
                        onAsuntoChange = onAsuntoChange,
                        onDescripcionChange = onDescripcionChange,
                        onCategoriaChange = onCategoriaChange,
                        onPrioridadChange = onPrioridadChange,
                        onGuardar = onCrearTicket,
                        onCancelar = onCerrarFormulario
                    )
                }
            } else {
                item {
                    Text(
                        text = stringResource(R.string.soporte_descripcion),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                item {
                    BotonPrincipal(
                        texto = stringResource(R.string.soporte_nuevo_reporte),
                        onClick = onAbrirFormulario,
                        iconoFinal = Icons.Default.Add
                    )
                }

                when {
                    state.cargando -> item { CargandoSoporte() }

                    state.error != null -> {
                        val mensaje = state.error
                        item { EstadoError(mensaje = mensaje, onReintentar = onReintentar) }
                    }

                    state.tickets.isEmpty() -> item {
                        EstadoVacio(
                            icono = Icons.AutoMirrored.Filled.List,
                            titulo = stringResource(R.string.soporte_vacio_titulo),
                            mensaje = stringResource(R.string.soporte_vacio_mensaje)
                        )
                    }

                    else -> {
                        items(items = state.tickets, key = { it.idTicket }) { ticket ->
                            TarjetaTicket(
                                ticket = ticket,
                                respondiendo = state.ticketRespondiendoId == ticket.idTicket,
                                mensajeRespuesta = state.mensajeRespuesta,
                                errorRespuesta = state.errorRespuesta,
                                enviando = state.respondiendo,
                                onAbrirRespuesta = { onAbrirRespuesta(ticket.idTicket) },
                                onCerrarRespuesta = onCerrarRespuesta,
                                onMensajeChange = onMensajeRespuestaChange,
                                onEnviar = onEnviarRespuesta
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
}

@Composable
private fun FormularioReporte(
    state: SoporteUiState,
    onAsuntoChange: (String) -> Unit,
    onDescripcionChange: (String) -> Unit,
    onCategoriaChange: (String) -> Unit,
    onPrioridadChange: (String) -> Unit,
    onGuardar: () -> Unit,
    onCancelar: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(Dimensiones.RadioCampo),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.soporte_formulario_titulo),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = state.asunto,
                onValueChange = onAsuntoChange,
                label = { Text(stringResource(R.string.soporte_asunto)) },
                isError = state.errorAsunto != null,
                supportingText = state.errorAsunto?.let { { Text(it) } },
                singleLine = true,
                enabled = !state.guardando,
                shape = RoundedCornerShape(Dimensiones.RadioCampo),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedTextField(
                value = state.descripcion,
                onValueChange = onDescripcionChange,
                label = { Text(stringResource(R.string.soporte_descripcion_campo)) },
                isError = state.errorDescripcion != null,
                supportingText = state.errorDescripcion?.let { { Text(it) } },
                minLines = 3,
                maxLines = 6,
                enabled = !state.guardando,
                shape = RoundedCornerShape(Dimensiones.RadioCampo),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = stringResource(R.string.soporte_categoria),
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.horizontalScroll(rememberScrollState())
            ) {
                CATEGORIAS_SOPORTE.forEach { categoria ->
                    FilterChip(
                        selected = state.categoria == categoria,
                        onClick = { onCategoriaChange(categoria) },
                        enabled = !state.guardando,
                        label = { Text(etiquetaCategoria(categoria)) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = stringResource(R.string.soporte_prioridad),
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.horizontalScroll(rememberScrollState())
            ) {
                PRIORIDADES_SOPORTE.forEach { prioridad ->
                    FilterChip(
                        selected = state.prioridad == prioridad,
                        onClick = { onPrioridadChange(prioridad) },
                        enabled = !state.guardando,
                        label = { Text(etiquetaPrioridad(prioridad)) }
                    )
                }
            }

            state.errorFormulario?.let { mensaje ->
                Spacer(modifier = Modifier.height(12.dp))
                BannerError(mensaje = mensaje)
            }

            Spacer(modifier = Modifier.height(18.dp))

            BotonPrincipal(
                texto = stringResource(R.string.soporte_enviar_reporte),
                textoCargando = stringResource(R.string.soporte_enviando_reporte),
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
}

@Composable
private fun TarjetaTicket(
    ticket: Ticket,
    respondiendo: Boolean,
    mensajeRespuesta: String,
    errorRespuesta: String?,
    enviando: Boolean,
    onAbrirRespuesta: () -> Unit,
    onCerrarRespuesta: () -> Unit,
    onMensajeChange: (String) -> Unit,
    onEnviar: () -> Unit
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
                        text = ticket.asunto,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = formatearFechaHoraCorta(ticket.fechaCreacion),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                ChipEstado(ticket.estado)
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = ticket.descripcion,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    text = etiquetaCategoria(ticket.categoria),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = etiquetaPrioridad(ticket.prioridad),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (ticket.asignacionActual != null) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = stringResource(R.string.soporte_asignado),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (ticket.respuestas.isNotEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = stringResource(R.string.soporte_respuestas),
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                ticket.respuestas.forEach { respuesta ->
                    Spacer(modifier = Modifier.height(6.dp))
                    Surface(
                        shape = RoundedCornerShape(Dimensiones.RadioCampo),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text(
                                text = respuesta.mensaje,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = formatearFechaHoraCorta(respuesta.fechaCreacion),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            if (respondiendo) {
                OutlinedTextField(
                    value = mensajeRespuesta,
                    onValueChange = onMensajeChange,
                    label = { Text(stringResource(R.string.soporte_respuesta_mensaje)) },
                    isError = errorRespuesta != null,
                    supportingText = errorRespuesta?.let { { Text(it) } },
                    minLines = 2,
                    maxLines = 4,
                    enabled = !enviando,
                    shape = RoundedCornerShape(Dimensiones.RadioCampo),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = onCerrarRespuesta, enabled = !enviando) {
                        Text(stringResource(R.string.comun_cancelar))
                    }
                    Button(onClick = onEnviar, enabled = !enviando) {
                        Text(stringResource(R.string.soporte_enviar_respuesta))
                    }
                }
            } else {
                OutlinedButton(
                    onClick = onAbrirRespuesta,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(stringResource(R.string.soporte_responder))
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
            text = stringResource(R.string.soporte_pagina, pagina, totalPaginas),
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
private fun CargandoSoporte() {
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
private fun etiquetaCategoria(categoria: String): String = when (categoria) {
    "CUENTA" -> stringResource(R.string.soporte_categoria_cuenta)
    "CARTERA" -> stringResource(R.string.soporte_categoria_cartera)
    "PAGOS" -> stringResource(R.string.soporte_categoria_pagos)
    "ERROR" -> stringResource(R.string.soporte_categoria_error)
    "OTRO" -> stringResource(R.string.soporte_categoria_otro)
    else -> stringResource(R.string.soporte_categoria_general)
}

@Composable
private fun etiquetaPrioridad(prioridad: String): String = when (prioridad) {
    "BAJA" -> stringResource(R.string.soporte_prioridad_baja)
    "ALTA" -> stringResource(R.string.soporte_prioridad_alta)
    "URGENTE" -> stringResource(R.string.soporte_prioridad_urgente)
    else -> stringResource(R.string.soporte_prioridad_media)
}

@Composable
private fun etiquetaEstado(estado: String): String = when (estado) {
    "EN_PROCESO" -> stringResource(R.string.soporte_estado_en_proceso)
    "ESPERA" -> stringResource(R.string.soporte_estado_espera)
    "RESUELTO" -> stringResource(R.string.soporte_estado_resuelto)
    "CERRADO" -> stringResource(R.string.soporte_estado_cerrado)
    else -> stringResource(R.string.soporte_estado_abierto)
}
