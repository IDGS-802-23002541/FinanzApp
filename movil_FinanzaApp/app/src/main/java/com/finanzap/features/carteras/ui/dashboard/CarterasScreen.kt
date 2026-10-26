package com.finanzap.features.carteras.ui.dashboard

import androidx.compose.foundation.background
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.ui.components.EstadoError
import com.finanzap.core.ui.components.EstadoVacio
import com.finanzap.core.util.formatearRangoFechas
import com.finanzap.core.util.formatearMoneda
import com.finanzap.features.carteras.model.Cartera
import com.finanzap.features.carteras.model.RolEnCartera
import com.finanzap.features.carteras.model.TipoCartera
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import kotlinx.coroutines.launch

@Composable
fun CarterasScreen(
    temaOscuro: Boolean,
    onAlternarTema: () -> Unit,
    onNuevaCartera: () -> Unit,
    onCuenta: () -> Unit,
    onCerrarSesion: () -> Unit,
    viewModel: CarterasViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val alcance = rememberCoroutineScope()

    // Al volver de crear una cartera la pantalla se recompone: se recarga el listado.
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        viewModel.cargar()
    }

    val avisar: (String) -> Unit = { mensaje ->
        alcance.launch { snackbarHostState.showSnackbar(mensaje) }
    }

    val mensajeDetalle = stringResource(R.string.carteras_pendiente_detalle)
    val mensajeGasto = stringResource(R.string.carteras_pendiente_gasto)

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { margen ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(margen),
            contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 20.dp, bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Encabezado(
                    compartidas = state.segmento == Segmento.COMPARTIDAS,
                    totalCompartidas = state.totalCompartidas,
                    temaOscuro = temaOscuro,
                    onAlternarTema = onAlternarTema,
                    onNuevaCartera = onNuevaCartera,
                    onCuenta = onCuenta,
                    onCerrarSesion = onCerrarSesion
                )
            }

            val error = state.error
            if (!state.cargando && error == null) {
                item {
                    SelectorSegmento(
                        segmento = state.segmento,
                        totalMis = state.totalMis,
                        totalCompartidas = state.totalCompartidas,
                        onSegmentoChange = viewModel::onSegmentoChange
                    )
                }

                item {
                    FiltrosTipo(
                        seleccionado = state.tipo,
                        onTipoChange = viewModel::onTipoChange
                    )
                }

                item {
                    Buscador(
                        busqueda = state.busqueda,
                        onBusquedaChange = viewModel::onBusquedaChange
                    )
                }
            }

            when {
                state.cargando -> item { CargandoCarteras() }

                error != null -> item {
                    EstadoError(
                        mensaje = error,
                        onReintentar = viewModel::cargar
                    )
                }

                state.carteras.isEmpty() -> item {
                    if (state.busqueda.isNotBlank() || state.tipo != null) {
                        EstadoVacio(
                            icono = Icons.Default.Search,
                            titulo = stringResource(R.string.carteras_sin_resultados_titulo),
                            mensaje = stringResource(R.string.carteras_sin_resultados_mensaje)
                        )
                    } else if (state.segmento == Segmento.COMPARTIDAS) {
                        EstadoVacio(
                            icono = Icons.Default.List,
                            titulo = stringResource(R.string.carteras_vacio_compartidas_titulo),
                            mensaje = stringResource(R.string.carteras_vacio_compartidas_mensaje)
                        )
                    } else {
                        EstadoVacio(
                            icono = Icons.Default.Add,
                            titulo = stringResource(R.string.carteras_vacio_titulo),
                            mensaje = stringResource(R.string.carteras_vacio_mensaje),
                            textoBoton = stringResource(R.string.carteras_nueva),
                            onBoton = onNuevaCartera
                        )
                    }
                }

                else -> items(items = state.carteras, key = { it.id }) { cartera ->
                    if (cartera.rol == RolEnCartera.PROPIETARIO) {
                        TarjetaPropia(cartera = cartera, onAbrir = { avisar(mensajeDetalle) })
                    } else {
                        TarjetaCompartida(
                            cartera = cartera,
                            onRegistrarGasto = { avisar(mensajeGasto) },
                            onVerCartera = { avisar(mensajeDetalle) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun Encabezado(
    compartidas: Boolean,
    totalCompartidas: Int,
    temaOscuro: Boolean,
    onAlternarTema: () -> Unit,
    onNuevaCartera: () -> Unit,
    onCuenta: () -> Unit,
    onCerrarSesion: () -> Unit
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = stringResource(R.string.carteras_titulo),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = if (compartidas) {
                    stringResource(R.string.carteras_descripcion_compartidas, totalCompartidas)
                } else {
                    stringResource(R.string.carteras_descripcion)
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        TextButton(onClick = onAlternarTema) {
            Text(
                text = stringResource(
                    if (temaOscuro) R.string.tema_claro else R.string.tema_oscuro
                ),
                style = MaterialTheme.typography.labelLarge
            )
        }

        Spacer(modifier = Modifier.width(4.dp))

        FilledIconButton(onClick = onNuevaCartera) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = stringResource(R.string.carteras_nueva)
            )
        }

        IconButton(onClick = onCuenta) {
            Icon(
                imageVector = Icons.Default.Person,
                contentDescription = stringResource(R.string.carteras_mi_cuenta),
                tint = MaterialTheme.colorScheme.primary
            )
        }

        IconButton(onClick = onCerrarSesion) {
            Icon(
                imageVector = Icons.Default.ExitToApp,
                contentDescription = stringResource(R.string.carteras_cerrar_sesion),
                tint = MaterialTheme.colorScheme.primary
            )
        }
    }
}

@Composable
private fun SelectorSegmento(
    segmento: Segmento,
    totalMis: Int,
    totalCompartidas: Int,
    onSegmentoChange: (Segmento) -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(percent = 50),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Row(modifier = Modifier.padding(4.dp)) {
            OpcionSegmento(
                texto = stringResource(R.string.carteras_mis),
                total = totalMis,
                activo = segmento == Segmento.MIS,
                modifier = Modifier.weight(1f),
                onClick = { onSegmentoChange(Segmento.MIS) }
            )
            OpcionSegmento(
                texto = stringResource(R.string.carteras_compartidas),
                total = totalCompartidas,
                activo = segmento == Segmento.COMPARTIDAS,
                modifier = Modifier.weight(1f),
                onClick = { onSegmentoChange(Segmento.COMPARTIDAS) }
            )
        }
    }
}

@Composable
private fun OpcionSegmento(
    texto: String,
    total: Int,
    activo: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(percent = 50),
        color = if (activo) MaterialTheme.colorScheme.surface else Color.Transparent,
        shadowElevation = if (activo) 1.dp else 0.dp,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.padding(vertical = 10.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = texto,
                style = MaterialTheme.typography.labelLarge,
                fontWeight = if (activo) FontWeight.Bold else FontWeight.Normal,
                color = if (activo) {
                    MaterialTheme.colorScheme.onSurface
                } else {
                    MaterialTheme.colorScheme.onSurfaceVariant
                }
            )
            Spacer(modifier = Modifier.width(8.dp))
            Surface(
                shape = CircleShape,
                color = if (activo) {
                    MaterialTheme.colorScheme.tertiary
                } else {
                    MaterialTheme.colorScheme.surface
                }
            ) {
                Text(
                    text = total.toString(),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.dp)
                )
            }
        }
    }
}

@Composable
private fun FiltrosTipo(
    seleccionado: TipoCartera?,
    onTipoChange: (TipoCartera?) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        FilterChip(
            selected = seleccionado == null,
            onClick = { onTipoChange(null) },
            label = { Text(stringResource(R.string.carteras_todas)) },
            shape = RoundedCornerShape(percent = 50),
            colors = FilterChipDefaults.filterChipColors(
                selectedContainerColor = MaterialTheme.colorScheme.primary,
                selectedLabelColor = MaterialTheme.colorScheme.onPrimary
            ),
            border = FilterChipDefaults.filterChipBorder(
                enabled = true,
                selected = seleccionado == null,
                borderColor = MaterialTheme.colorScheme.outline
            )
        )

        TipoCartera.entries.forEach { tipo ->
            FilterChip(
                selected = seleccionado == tipo,
                onClick = { onTipoChange(tipo) },
                label = { Text(tipo.etiqueta) },
                shape = RoundedCornerShape(percent = 50),
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primary,
                    selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                ),
                border = FilterChipDefaults.filterChipBorder(
                    enabled = true,
                    selected = seleccionado == tipo,
                    borderColor = MaterialTheme.colorScheme.outline
                )
            )
        }
    }
}

@Composable
private fun Buscador(busqueda: String, onBusquedaChange: (String) -> Unit) {
    OutlinedTextField(
        value = busqueda,
        onValueChange = onBusquedaChange,
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        shape = RoundedCornerShape(12.dp),
        placeholder = { Text(stringResource(R.string.carteras_buscar)) },
        leadingIcon = {
            Icon(Icons.Default.Search, contentDescription = null)
        },
        trailingIcon = if (busqueda.isNotEmpty()) {
            {
                IconButton(onClick = { onBusquedaChange("") }) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = stringResource(R.string.carteras_limpiar_busqueda)
                    )
                }
            }
        } else {
            null
        }
    )
}

@Composable
private fun TarjetaPropia(cartera: Cartera, onAbrir: () -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 1.dp
    ) {
        Column {
            // Franja superior de la tarjeta, como en el diseño.
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp)
                    .background(MaterialTheme.colorScheme.primary)
            )

            Column(modifier = Modifier.padding(18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    CirculoTipo(cartera.tipo, grande = true)

                    Column(modifier = Modifier
                        .weight(1f)
                        .padding(start = 12.dp)) {
                        Text(
                            text = cartera.nombre,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            EtiquetaTipo(cartera.tipo)

                            if (cartera.fechaInicio != null && cartera.fechaFin != null) {
                                Spacer(modifier = Modifier.width(8.dp))
                                Icon(
                                    imageVector = Icons.Default.DateRange,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = formatearRangoFechas(cartera.fechaInicio, cartera.fechaFin),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    maxLines = 1
                                )
                            }
                        }
                    }
                }

                if (cartera.descripcion != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = cartera.descripcion,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))
                HorizontalDivider(color = MaterialTheme.colorScheme.outline)
                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = onAbrir,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(percent = 50)
                ) {
                    Text(stringResource(R.string.carteras_abrir))
                }
            }
        }
    }
}

@Composable
private fun TarjetaCompartida(
    cartera: Cartera,
    onRegistrarGasto: () -> Unit,
    onVerCartera: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 1.dp
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                CirculoTipo(cartera.tipo, grande = true)

                Column(modifier = Modifier
                    .weight(1f)
                    .padding(start = 12.dp)) {
                    Text(
                        text = cartera.nombre,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    if (cartera.administrador != null) {
                        Text(
                            text = stringResource(R.string.carteras_administrada, cartera.administrador),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                if (cartera.inicialesAdministrador != null) {
                    Surface(
                        shape = CircleShape,
                        color = if (cartera.miSaldo < 0) {
                            MaterialTheme.colorScheme.secondary
                        } else {
                            MaterialTheme.colorScheme.primary
                        }
                    ) {
                        Text(
                            text = cartera.inicialesAdministrador,
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onPrimary,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            EtiquetaTipo(cartera.tipo)
            Spacer(modifier = Modifier.height(12.dp))

            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surfaceVariant
            ) {
                Row(modifier = Modifier.padding(vertical = 14.dp, horizontal = 10.dp)) {
                    Metrica(
                        etiqueta = stringResource(R.string.carteras_mi_pagado),
                        valor = formatearMoneda(cartera.miPagado),
                        modifier = Modifier.weight(1f)
                    )
                    Metrica(
                        etiqueta = stringResource(R.string.carteras_mi_cuota),
                        valor = formatearMoneda(cartera.miCuota),
                        modifier = Modifier.weight(1f)
                    )
                    Metrica(
                        etiqueta = stringResource(R.string.carteras_mi_saldo),
                        valor = formatearMoneda(cartera.miSaldo),
                        colorValor = if (cartera.miSaldo < 0) {
                            MaterialTheme.colorScheme.secondary
                        } else {
                            MaterialTheme.colorScheme.primary
                        },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Row(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = stringResource(R.string.carteras_avance),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = "${cartera.avancePresupuesto}%",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            LinearProgressIndicator(
                progress = { cartera.avancePresupuesto / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp),
                color = if (cartera.miSaldo < 0) {
                    MaterialTheme.colorScheme.secondary
                } else {
                    MaterialTheme.colorScheme.primary
                },
                trackColor = MaterialTheme.colorScheme.surfaceVariant,
                strokeCap = StrokeCap.Round,
                drawStopIndicator = {}
            )

            Spacer(modifier = Modifier.height(14.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = onRegistrarGasto,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(percent = 50),
                    contentPadding = PaddingValues(horizontal = 8.dp)
                ) {
                    Text(
                        text = stringResource(R.string.carteras_registrar_gasto),
                        maxLines = 1
                    )
                }
                OutlinedButton(
                    onClick = onVerCartera,
                    shape = RoundedCornerShape(percent = 50)
                ) {
                    Text(stringResource(R.string.carteras_ver))
                }
            }
        }
    }
}

@Composable
private fun Metrica(
    etiqueta: String,
    valor: String,
    colorValor: Color = Color.Unspecified,
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
            color = if (colorValor == Color.Unspecified) {
                MaterialTheme.colorScheme.onSurface
            } else {
                colorValor
            }
        )
    }
}

@Composable
private fun EtiquetaTipo(tipo: TipoCartera) {
    Surface(
        shape = RoundedCornerShape(percent = 50),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Text(
            text = tipo.etiqueta,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
        )
    }
}

@Composable
private fun CirculoTipo(tipo: TipoCartera, grande: Boolean) {
    val tamano = if (grande) 44.dp else 36.dp
    Surface(
        shape = CircleShape,
        color = colorDeTipo(tipo),
        modifier = Modifier.size(tamano)
    ) {
        Box(contentAlignment = Alignment.Center) {
            Icon(
                imageVector = iconoDeTipo(tipo),
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier.size(tamano / 2)
            )
        }
    }
}

@Composable
private fun colorDeTipo(tipo: TipoCartera): Color = when (tipo) {
    TipoCartera.HOGAR -> MaterialTheme.colorScheme.primary
    else -> MaterialTheme.colorScheme.secondary
}

private fun iconoDeTipo(tipo: TipoCartera): ImageVector = when (tipo) {
    TipoCartera.HOGAR -> Icons.Default.Home
    TipoCartera.VIAJE -> Icons.Default.Place
    TipoCartera.EVENTO -> Icons.Default.Star
    TipoCartera.OTRO -> Icons.Default.List
}

@Composable
private fun CargandoCarteras() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 48.dp),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator()
    }
}
