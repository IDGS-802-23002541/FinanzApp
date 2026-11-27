package com.finanzap.features.reportes.ui

import android.content.Context
import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Button
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.ui.BannerError
import com.finanzap.core.ui.BotonPrincipal
import com.finanzap.core.ui.DatoDona
import com.finanzap.core.ui.Dimensiones
import com.finanzap.core.ui.EncabezadoVolver
import com.finanzap.core.ui.EstadoError
import com.finanzap.core.ui.EstadoVacio
import com.finanzap.core.ui.GraficaDona
import com.finanzap.core.util.fechaIsoDesdeMillis
import com.finanzap.core.util.formatearFechaCorta
import com.finanzap.core.util.formatearMoneda
import com.finanzap.features.carteras.TipoCartera
import com.finanzap.features.reportes.data.FormatoReporte
import com.finanzap.features.reportes.data.FiltrosReporte
import com.finanzap.features.reportes.data.GastoPorCategoria
import com.finanzap.features.reportes.data.IndicadoresReporte
import com.finanzap.features.reportes.data.SerieMensual
import java.io.File

@Composable
fun ReportesScreen(
    onVolver: () -> Unit,
    viewModel: ReportesViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        viewModel.cargar()
    }

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        viewModel.cargar()
    }

    ReportesContenido(
        state = state,
        onVolver = onVolver,
        onSeleccionarCartera = viewModel::seleccionarCartera,
        onSeleccionarTipo = viewModel::seleccionarTipo,
        onSeleccionarPeriodo = viewModel::seleccionarPeriodo,
        onElegirFechas = viewModel::elegirFechas,
        onActualizar = viewModel::cargar,
        onExportar = viewModel::exportar
    )
}

@Composable
fun ReportesContenido(
    state: ReportesUiState,
    onVolver: () -> Unit,
    onSeleccionarCartera: (Int?) -> Unit,
    onSeleccionarTipo: (TipoCartera?) -> Unit,
    onSeleccionarPeriodo: (Int?) -> Unit,
    onElegirFechas: (String?, String?) -> Unit,
    onActualizar: () -> Unit,
    onExportar: (FormatoReporte) -> Unit
) {
    var editandoInicio by remember { mutableStateOf(false) }
    var editandoFin by remember { mutableStateOf(false) }

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
                    titulo = stringResource(R.string.reportes_titulo),
                    onVolver = onVolver,
                    descripcionVolver = stringResource(R.string.comun_volver)
                )
            }

            item {
                Text(
                    text = stringResource(R.string.reportes_descripcion),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            item {
                FiltrosReporte(
                    state = state,
                    onSeleccionarCartera = onSeleccionarCartera,
                    onSeleccionarTipo = onSeleccionarTipo,
                    onSeleccionarPeriodo = onSeleccionarPeriodo,
                    onElegirFechas = onElegirFechas,
                    onEditarInicio = { editandoInicio = true },
                    onEditarFin = { editandoFin = true }
                )
            }

            state.errorFiltros?.let { mensaje ->
                item { BannerError(mensaje = mensaje) }
            }

            item {
                BotonPrincipal(
                    texto = stringResource(R.string.reportes_actualizar),
                    textoCargando = stringResource(R.string.reportes_actualizando),
                    cargando = state.cargando,
                    onClick = onActualizar
                )
            }

            if (state.cargando) {
                item { CargandoReporte() }
            } else if (state.error != null) {
                val mensaje = state.error
                item {
                    EstadoError(mensaje = mensaje, onReintentar = onActualizar)
                }
            } else {
                state.reporte?.let { reporte ->
                    if (reporte.hayDatos) {
                        item { EtiquetaSeccionReporte(stringResource(R.string.reportes_resumen)) }
                        item { IndicadoresReporte(reporte.indicadores) }
                        item { RangoFechasReporte(reporte.filtros) }

                        item { EtiquetaSeccionReporte(stringResource(R.string.reportes_graficas)) }
                        item { GraficaMensual(reporte.graficas.ingresosVsEgresos) }
                        item { GraficaCategorias(reporte.graficas.gastosPorCategoria) }

                        item { EtiquetaSeccionReporte(stringResource(R.string.reportes_exportar_titulo)) }
                        item {
                            BotonesExportar(
                                exportando = state.exportando,
                                onExportar = onExportar
                            )
                        }
                        state.archivoGenerado?.let { ruta ->
                            item { TarjetaArchivo(ruta) }
                        }
                        state.errorExportacion?.let { mensaje ->
                            item { BannerError(mensaje = mensaje) }
                        }
                    } else {
                        item {
                            EstadoVacio(
                                icono = Icons.AutoMirrored.Filled.List,
                                titulo = stringResource(R.string.reportes_vacio_titulo),
                                mensaje = stringResource(R.string.reportes_vacio_mensaje)
                            )
                        }
                    }
                }
            }
        }
    }

    if (editandoInicio || editandoFin) {
        SelectorFechaReporte(
            onAceptar = { nueva ->
                if (editandoInicio) {
                    onElegirFechas(nueva, state.fechaFin)
                } else {
                    onElegirFechas(state.fechaInicio, nueva)
                }
            },
            onCerrar = {
                editandoInicio = false
                editandoFin = false
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FiltrosReporte(
    state: ReportesUiState,
    onSeleccionarCartera: (Int?) -> Unit,
    onSeleccionarTipo: (TipoCartera?) -> Unit,
    onSeleccionarPeriodo: (Int?) -> Unit,
    onElegirFechas: (String?, String?) -> Unit,
    onEditarInicio: () -> Unit,
    onEditarFin: () -> Unit
) {
    var carteraExpandida by remember { mutableStateOf(false) }
    val carterasVisibles = state.carteras.filter {
        state.tipo == null || it.tipo == state.tipo
    }
    val nombreCartera = state.carteras.firstOrNull { it.id == state.carteraId }?.nombre
        ?: stringResource(R.string.reportes_cartera_todas)

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.reportes_filtros_titulo),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Primero el tipo y después la cartera, igual que en la web.
            EtiquetaFiltro(stringResource(R.string.reportes_tipo))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    FilterChip(
                        selected = state.tipo == null,
                        onClick = { onSeleccionarTipo(null) },
                        label = { Text(stringResource(R.string.reportes_tipo_todos)) }
                    )
                }
                items(items = TipoCartera.entries) { tipo ->
                    FilterChip(
                        selected = state.tipo == tipo,
                        onClick = { onSeleccionarTipo(tipo) },
                        label = { Text(tipo.etiqueta) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            EtiquetaFiltro(stringResource(R.string.reportes_cartera))
            ExposedDropdownMenuBox(
                expanded = carteraExpandida,
                onExpandedChange = { carteraExpandida = it }
            ) {
                OutlinedTextField(
                    value = nombreCartera,
                    onValueChange = {},
                    readOnly = true,
                    singleLine = true,
                    placeholder = {
                        Text(stringResource(R.string.reportes_cartera_seleccionar))
                    },
                    trailingIcon = {
                        ExposedDropdownMenuDefaults.TrailingIcon(expanded = carteraExpandida)
                    },
                    shape = RoundedCornerShape(Dimensiones.RadioCampo),
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(ExposedDropdownMenuAnchorType.PrimaryNotEditable)
                )
                ExposedDropdownMenu(
                    expanded = carteraExpandida,
                    onDismissRequest = { carteraExpandida = false }
                ) {
                    DropdownMenuItem(
                        text = { Text(stringResource(R.string.reportes_cartera_todas)) },
                        onClick = {
                            onSeleccionarCartera(null)
                            carteraExpandida = false
                        }
                    )
                    if (carterasVisibles.isEmpty()) {
                        DropdownMenuItem(
                            text = { Text(stringResource(R.string.reportes_sin_carteras)) },
                            onClick = { carteraExpandida = false },
                            enabled = false
                        )
                    }
                    carterasVisibles.forEach { cartera ->
                        DropdownMenuItem(
                            text = {
                                Text(
                                    text = cartera.nombre,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            },
                            onClick = {
                                onSeleccionarCartera(cartera.id)
                                carteraExpandida = false
                            }
                        )
                    }
                }
            }

            if (state.periodos.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                EtiquetaFiltro(stringResource(R.string.reportes_periodo))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    item {
                        FilterChip(
                            selected = state.periodoId == null,
                            onClick = { onSeleccionarPeriodo(null) },
                            label = { Text(stringResource(R.string.reportes_periodo_todos)) }
                        )
                    }
                    items(items = state.periodos, key = { it.id }) { periodo ->
                        FilterChip(
                            selected = state.periodoId == periodo.id,
                            onClick = { onSeleccionarPeriodo(periodo.id) },
                            label = { Text(periodo.nombre) }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            FilaFecha(
                etiqueta = stringResource(R.string.reportes_fecha_inicio_texto, textoFecha(state.fechaInicio)),
                hayFecha = state.fechaInicio != null,
                onEditar = onEditarInicio,
                onQuitar = { onElegirFechas(null, state.fechaFin) }
            )
            FilaFecha(
                etiqueta = stringResource(R.string.reportes_fecha_fin_texto, textoFecha(state.fechaFin)),
                hayFecha = state.fechaFin != null,
                onEditar = onEditarFin,
                onQuitar = { onElegirFechas(state.fechaInicio, null) }
            )
        }
    }
}

@Composable
private fun FilaFecha(
    etiqueta: String,
    hayFecha: Boolean,
    onEditar: () -> Unit,
    onQuitar: () -> Unit
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        OutlinedButton(
            onClick = onEditar,
            modifier = Modifier.weight(1f)
        ) {
            Text(etiqueta)
        }
        if (hayFecha) {
            IconButton(onClick = onQuitar) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = stringResource(R.string.reportes_quitar_fecha)
                )
            }
        }
    }
}

@Composable
private fun IndicadoresReporte(indicadores: IndicadoresReporte) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(modifier = Modifier.padding(vertical = 18.dp, horizontal = 12.dp)) {
            Row {
                Metrica(
                    etiqueta = stringResource(R.string.reportes_ingresos),
                    valor = formatearMoneda(indicadores.totalIngresos),
                    colorValor = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.weight(1f)
                )
                Metrica(
                    etiqueta = stringResource(R.string.reportes_gastos),
                    valor = formatearMoneda(indicadores.totalGastos),
                    colorValor = MaterialTheme.colorScheme.error,
                    modifier = Modifier.weight(1f)
                )
            }
            Row {
                Metrica(
                    etiqueta = stringResource(R.string.reportes_ahorro),
                    valor = formatearMoneda(indicadores.ahorro),
                    colorValor = if (indicadores.ahorro < 0) {
                        MaterialTheme.colorScheme.error
                    } else {
                        MaterialTheme.colorScheme.primary
                    },
                    modifier = Modifier.weight(1f)
                )
                Metrica(
                    etiqueta = stringResource(R.string.reportes_movimientos),
                    valor = indicadores.movimientos.toString(),
                    colorValor = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun RangoFechasReporte(filtros: FiltrosReporte) {
    val inicio = filtros.fechaInicio
    val fin = filtros.fechaFin
    if (inicio == null || fin == null) return

    Text(
        text = stringResource(
            R.string.reportes_rango_fechas,
            formatearFechaCorta(inicio),
            formatearFechaCorta(fin)
        ),
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
}

@Composable
private fun GraficaMensual(serie: List<SerieMensual>) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.reportes_ingresos_vs_egresos),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(8.dp))

            if (serie.isEmpty()) {
                Text(
                    text = stringResource(R.string.reportes_sin_datos),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                val maximo = maxOf(serie.maxOf { maxOf(it.ingresos, it.gastos) }, 1.0)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.Bottom
                ) {
                    serie.forEach { mes ->
                        Column(
                            modifier = Modifier.weight(1f),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Row(
                                modifier = Modifier.weight(1f),
                                horizontalArrangement = Arrangement.spacedBy(3.dp),
                                verticalAlignment = Alignment.Bottom
                            ) {
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height((100 * (mes.ingresos / maximo)).dp)
                                        .background(
                                            color = MaterialTheme.colorScheme.primary,
                                            shape = RoundedCornerShape(
                                                topStart = 4.dp,
                                                topEnd = 4.dp
                                            )
                                        )
                                )
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height((100 * (mes.gastos / maximo)).dp)
                                        .background(
                                            color = MaterialTheme.colorScheme.error,
                                            shape = RoundedCornerShape(
                                                topStart = 4.dp,
                                                topEnd = 4.dp
                                            )
                                        )
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = mes.periodo,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Leyenda(
                        color = MaterialTheme.colorScheme.primary,
                        texto = stringResource(R.string.reportes_ingresos)
                    )
                    Leyenda(
                        color = MaterialTheme.colorScheme.error,
                        texto = stringResource(R.string.reportes_gastos)
                    )
                }
            }
        }
    }
}

@Composable
private fun GraficaCategorias(categorias: List<GastoPorCategoria>) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.reportes_gastos_categoria),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(12.dp))

            if (categorias.isEmpty()) {
                Text(
                    text = stringResource(R.string.reportes_sin_datos),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                GraficaDona(
                    datos = categorias.map { DatoDona(it.categoria, it.monto) }
                )
            }
        }
    }
}

@Composable
private fun BotonesExportar(
    exportando: Boolean,
    onExportar: (FormatoReporte) -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.reportes_exportar_titulo),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = stringResource(R.string.reportes_archivo_ayuda),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = { onExportar(FormatoReporte.CSV) },
                    enabled = !exportando,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        stringResource(
                            if (exportando) R.string.reportes_exportando
                            else R.string.reportes_exportar_csv
                        )
                    )
                }
                OutlinedButton(
                    onClick = { onExportar(FormatoReporte.PDF) },
                    enabled = !exportando,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        stringResource(
                            if (exportando) R.string.reportes_exportando
                            else R.string.reportes_exportar_pdf
                        )
                    )
                }
            }
        }
    }
}

@Composable
private fun TarjetaArchivo(ruta: String) {
    val context = LocalContext.current
    var noSePudoAbrir by remember { mutableStateOf(false) }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.reportes_archivo_titulo),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = ruta.substringAfterLast('/'),
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = stringResource(R.string.reportes_archivo_ayuda),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = {
                        noSePudoAbrir = !abrirArchivoReporte(context, ruta)
                    },
                    modifier = Modifier.weight(1f)
                ) {
                    Text(stringResource(R.string.reportes_abrir_archivo))
                }
                OutlinedButton(
                    onClick = { compartirArchivoReporte(context, ruta) },
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(stringResource(R.string.reportes_compartir_archivo))
                }
            }
            if (noSePudoAbrir) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.reportes_archivo_error),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

private fun uriReporte(context: Context, ruta: String) = FileProvider.getUriForFile(
    context,
    "${context.packageName}.fileprovider",
    File(ruta)
)

private fun tipoMimeReporte(ruta: String): String =
    if (ruta.endsWith(".pdf", ignoreCase = true)) "application/pdf" else "text/csv"

private fun abrirArchivoReporte(context: Context, ruta: String): Boolean {
    val intent = Intent(Intent.ACTION_VIEW).apply {
        setDataAndType(uriReporte(context, ruta), tipoMimeReporte(ruta))
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    return try {
        context.startActivity(intent)
        true
    } catch (e: android.content.ActivityNotFoundException) {
        false
    }
}

private fun compartirArchivoReporte(context: Context, ruta: String) {
    val intent = Intent(Intent.ACTION_SEND).apply {
        type = tipoMimeReporte(ruta)
        putExtra(Intent.EXTRA_STREAM, uriReporte(context, ruta))
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    context.startActivity(
        Intent.createChooser(intent, context.getString(R.string.reportes_compartir_archivo))
    )
}

@Composable
private fun CargandoReporte() {
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
private fun SelectorFechaReporte(
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
private fun EtiquetaFiltro(texto: String) {
    Text(
        text = texto,
        style = MaterialTheme.typography.labelMedium,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
}

@Composable
private fun EtiquetaSeccionReporte(texto: String) {
    Text(
        text = texto,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.onBackground,
        modifier = Modifier.padding(top = 8.dp)
    )
}

@Composable
private fun textoFecha(fecha: String?): String =
    fecha?.let { formatearFechaCorta(it) } ?: stringResource(R.string.reportes_sin_fecha)

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

@Composable
private fun Leyenda(color: Color, texto: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .width(10.dp)
                .height(10.dp)
                .background(color = color, shape = RoundedCornerShape(percent = 50))
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = texto,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
