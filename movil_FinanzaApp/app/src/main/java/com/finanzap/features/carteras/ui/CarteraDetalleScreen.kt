package com.finanzap.features.carteras.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.layout.ContentScale
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
import com.finanzap.core.ui.BotonPrincipal
import com.finanzap.core.ui.Dimensiones
import com.finanzap.core.ui.EstadoError
import com.finanzap.core.ui.PantallaFormulario
import com.finanzap.core.ui.generarQr
import com.finanzap.core.util.formatearFechaCorta
import com.finanzap.core.util.formatearFechaHoraCorta
import com.finanzap.core.util.formatearMoneda
import com.finanzap.core.util.formatearRangoFechas
import com.finanzap.features.carteras.Cartera
import com.finanzap.features.carteras.ColaboradorCartera
import com.finanzap.features.carteras.IngresoInvitacion
import com.finanzap.features.carteras.Invitacion
import com.finanzap.features.carteras.PeriodoCartera
import com.finanzap.features.carteras.ResumenCartera
import com.finanzap.features.carteras.SerieCategoria
import com.finanzap.features.carteras.SeriePeriodo
import com.finanzap.features.carteras.SeriesCartera
import com.finanzap.features.carteras.RolEnCartera

@Composable
fun CarteraDetalleScreen(
    carteraId: Int,
    onVolver: () -> Unit,
    onRegistrarGasto: (Int, String) -> Unit,
    onVerTransacciones: (Int, String, Boolean) -> Unit,
    viewModel: CarteraDetalleViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        viewModel.cargar(carteraId)
        viewModel.refrescarInvitacion(carteraId)
    }

    val cartera = state.cartera
    LaunchedEffect(cartera?.id, cartera?.rol, cartera?.estado) {
        if (cartera?.rol == RolEnCartera.PROPIETARIO && cartera.estado == "ACTIVA") {
            viewModel.cargarInvitacion(cartera.id)
        }
    }
    CarteraDetalleContenido(
        state = state,
        onVolver = onVolver,
        onReintentar = { viewModel.cargar(carteraId) },
        onRegistrarGasto = onRegistrarGasto,
        onVerTransacciones = onVerTransacciones,
        onGenerarInvitacion = { viewModel.generarInvitacion(carteraId) },
        onSeleccionarPeriodo = { viewModel.seleccionarPeriodo(carteraId, it) }
    )
}

@Composable
fun CarteraDetalleContenido(
    state: CarteraDetalleUiState,
    onVolver: () -> Unit,
    onReintentar: () -> Unit,
    onRegistrarGasto: (Int, String) -> Unit,
    onVerTransacciones: (Int, String, Boolean) -> Unit,
    onGenerarInvitacion: () -> Unit,
    onSeleccionarPeriodo: (Int?) -> Unit
) {
    PantallaFormulario(
        titulo = stringResource(R.string.detalle_titulo),
        onVolver = onVolver,
        descripcionVolver = stringResource(R.string.comun_volver)
    ) {
        when {
            state.cargando -> Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 48.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }

            state.error != null -> {
                Spacer(modifier = Modifier.height(16.dp))
                EstadoError(
                    mensaje = state.error,
                    onReintentar = onReintentar
                )
            }

            state.cartera != null -> DetalleCartera(
                cartera = state.cartera,
                onRegistrarGasto = onRegistrarGasto,
                onVerTransacciones = onVerTransacciones,
                resumen = state.resumen,
                series = state.series,
                colaboradores = state.colaboradores,
                invitacion = state.invitacion,
                ingresos = state.ingresos,
                cargandoInvitacion = state.cargandoInvitacion,
                errorInvitacion = state.errorInvitacion,
                onGenerarInvitacion = onGenerarInvitacion,
                periodos = state.periodos,
                periodoSeleccionadoId = state.periodoSeleccionadoId,
                errorPeriodos = state.errorPeriodos,
                onSeleccionarPeriodo = onSeleccionarPeriodo
            )
        }
    }
}

@Composable
private fun DetalleCartera(
    cartera: Cartera,
    onRegistrarGasto: (Int, String) -> Unit,
    onVerTransacciones: (Int, String, Boolean) -> Unit,
    resumen: ResumenCartera?,
    series: SeriesCartera?,
    colaboradores: List<ColaboradorCartera>,
    invitacion: Invitacion?,
    ingresos: List<IngresoInvitacion>,
    cargandoInvitacion: Boolean,
    errorInvitacion: String?,
    onGenerarInvitacion: () -> Unit,
    periodos: List<PeriodoCartera>,
    periodoSeleccionadoId: Int?,
    errorPeriodos: String?,
    onSeleccionarPeriodo: (Int?) -> Unit
) {
    val presupuesto = resumen?.presupuestoInicial ?: cartera.presupuestoInicial
    val totalIngresos = resumen?.totalIngresos ?: 0.0
    val totalGastos = resumen?.totalGastos ?: 0.0
    val saldo = resumen?.saldo ?: 0.0
    val avance = if (presupuesto > 0.0) {
        ((totalGastos / presupuesto) * 100).toInt().coerceIn(0, 100)
    } else {
        0
    }

    Spacer(modifier = Modifier.height(8.dp))

    Text(
        text = cartera.nombre,
        style = MaterialTheme.typography.headlineSmall,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.onBackground
    )

    Spacer(modifier = Modifier.height(8.dp))

    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Etiqueta(texto = cartera.tipo.etiqueta)
        Etiqueta(texto = "${stringResource(R.string.detalle_estado)}: ${cartera.estado}")
    }

    if (cartera.descripcion != null) {
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = cartera.descripcion,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }

    if (cartera.administrador != null) {
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = stringResource(R.string.carteras_administrada, cartera.administrador),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }

    if (cartera.fechaInicio != null && cartera.fechaFin != null) {
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = formatearRangoFechas(cartera.fechaInicio, cartera.fechaFin),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }

    val otrosColaboradores = colaboradores.filter { it.rol == "COLABORADOR" }
    if (otrosColaboradores.isNotEmpty()) {
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = stringResource(R.string.detalle_colaboradores),
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onSurface
        )
        Spacer(modifier = Modifier.height(6.dp))
        otrosColaboradores.forEach { colaborador ->
            FilaColaborador(colaborador)
        }
    }

    Spacer(modifier = Modifier.height(16.dp))

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Row(modifier = Modifier.padding(vertical = 14.dp, horizontal = 10.dp)) {
            Metrica(
                etiqueta = stringResource(R.string.transacciones_ingresos),
                valor = formatearMoneda(totalIngresos),
                colorValor = MaterialTheme.colorScheme.primary,
                modifier = Modifier.weight(1f)
            )
            Metrica(
                etiqueta = stringResource(R.string.transacciones_gastos),
                valor = formatearMoneda(totalGastos),
                colorValor = MaterialTheme.colorScheme.error,
                modifier = Modifier.weight(1f)
            )
            Metrica(
                etiqueta = stringResource(R.string.transacciones_balance),
                valor = formatearMoneda(saldo),
                colorValor = if (saldo < 0) {
                    MaterialTheme.colorScheme.secondary
                } else {
                    MaterialTheme.colorScheme.primary
                },
                modifier = Modifier.weight(1f)
            )
        }
    }

    Spacer(modifier = Modifier.height(16.dp))

    Row(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = stringResource(R.string.detalle_presupuesto),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = formatearMoneda(presupuesto),
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )
    }

    Spacer(modifier = Modifier.height(12.dp))

    Row(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = stringResource(R.string.carteras_avance),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = "$avance%",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }

    Spacer(modifier = Modifier.height(6.dp))
    LinearProgressIndicator(
        progress = { avance / 100f },
        modifier = Modifier
            .fillMaxWidth()
            .height(8.dp),
        color = if (saldo < 0) {
            MaterialTheme.colorScheme.secondary
        } else {
            MaterialTheme.colorScheme.primary
        },
        trackColor = MaterialTheme.colorScheme.surfaceVariant,
        strokeCap = StrokeCap.Round
    )

    Spacer(modifier = Modifier.height(20.dp))

    SelectorPeriodo(
        periodos = periodos,
        seleccionadoId = periodoSeleccionadoId,
        error = errorPeriodos,
        onSeleccionar = onSeleccionarPeriodo
    )

    Spacer(modifier = Modifier.height(12.dp))

    val periodosGrafica = if (periodoSeleccionadoId == null) {
        series?.ingresosVsEgresos.orEmpty()
    } else {
        series?.ingresosVsEgresos.orEmpty()
            .filter { it.periodoId == periodoSeleccionadoId }
    }

    GraficaPeriodos(periodosGrafica)

    Spacer(modifier = Modifier.height(12.dp))

    GraficaCategorias(series?.gastosPorCategoria.orEmpty())

    if (cartera.rol == RolEnCartera.PROPIETARIO && cartera.estado == "ACTIVA") {
        Spacer(modifier = Modifier.height(24.dp))
        InvitacionQrCard(
            invitacion = invitacion,
            ingresos = ingresos,
            cargando = cargandoInvitacion,
            error = errorInvitacion,
            onGenerar = onGenerarInvitacion
        )
    }

    Spacer(modifier = Modifier.height(24.dp))

    if (cartera.estado == "ACTIVA") {
        BotonPrincipal(
            texto = stringResource(R.string.carteras_registrar_gasto),
            onClick = { onRegistrarGasto(cartera.id, cartera.nombre) }
        )
        Spacer(modifier = Modifier.height(8.dp))
    }

    Spacer(modifier = Modifier.height(8.dp))

    OutlinedButton(
        onClick = {
            onVerTransacciones(
                cartera.id,
                cartera.nombre,
                cartera.rol == RolEnCartera.PROPIETARIO && cartera.estado == "ACTIVA"
            )
        },
        shape = RoundedCornerShape(Dimensiones.RadioCampo),
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(stringResource(R.string.transacciones_ver))
    }
}

@Composable
private fun FilaColaborador(colaborador: ColaboradorCartera) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .background(
                    color = MaterialTheme.colorScheme.primary,
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = colaborador.iniciales,
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onPrimary
            )
        }
        Spacer(modifier = Modifier.width(10.dp))
        Text(
            text = colaborador.nombre,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = stringResource(R.string.detalle_rol_colaborador),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun SelectorPeriodo(
    periodos: List<PeriodoCartera>,
    seleccionadoId: Int?,
    error: String?,
    onSeleccionar: (Int?) -> Unit
) {
    if (periodos.isEmpty()) {
        if (error != null) {
            Text(
                text = error,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.error
            )
        }
        return
    }

    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = stringResource(R.string.detalle_periodo),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(6.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            item {
                FilterChip(
                    selected = seleccionadoId == null,
                    onClick = { onSeleccionar(null) },
                    label = { Text(stringResource(R.string.detalle_periodo_todos)) }
                )
            }
            items(periodos, key = { it.id }) { periodo ->
                FilterChip(
                    selected = seleccionadoId == periodo.id,
                    onClick = { onSeleccionar(periodo.id) },
                    label = { Text(periodo.nombre) }
                )
            }
        }
    }
}

@Composable
private fun GraficaPeriodos(periodos: List<SeriePeriodo>) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(Dimensiones.RadioCampo),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.detalle_ingresos_vs_egresos),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(8.dp))

            if (periodos.isEmpty()) {
                Text(
                    text = stringResource(R.string.detalle_sin_datos),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                val maximo = maxOf(periodos.maxOf { maxOf(it.ingresos, it.gastos) }, 1.0)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.Bottom
                ) {
                    periodos.forEach { periodo ->
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
                                        .height((120 * (periodo.ingresos / maximo)).dp)
                                        .background(
                                            color = MaterialTheme.colorScheme.primary,
                                            shape = RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp)
                                        )
                                )
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height((120 * (periodo.gastos / maximo)).dp)
                                        .background(
                                            color = MaterialTheme.colorScheme.error,
                                            shape = RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp)
                                        )
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = periodo.nombre,
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
                        texto = stringResource(R.string.transacciones_ingresos)
                    )
                    Leyenda(
                        color = MaterialTheme.colorScheme.error,
                        texto = stringResource(R.string.transacciones_gastos)
                    )
                }
            }
        }
    }
}

@Composable
private fun GraficaCategorias(categorias: List<SerieCategoria>) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(Dimensiones.RadioCampo),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.detalle_gastos_categoria),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(8.dp))

            if (categorias.isEmpty()) {
                Text(
                    text = stringResource(R.string.detalle_sin_datos),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                val maximo = maxOf(categorias.maxOf { it.total }, 1.0)
                categorias.sortedByDescending { it.total }.forEach { categoria ->
                    Column(modifier = Modifier.padding(vertical = 4.dp)) {
                        Row(modifier = Modifier.fillMaxWidth()) {
                            Text(
                                text = categoria.nombre,
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.weight(1f),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                text = formatearMoneda(categoria.total),
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .background(
                                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f),
                                    shape = RoundedCornerShape(percent = 50)
                                )
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth((categoria.total / maximo).toFloat())
                                    .fillMaxHeight()
                                    .background(
                                        color = MaterialTheme.colorScheme.tertiary,
                                        shape = RoundedCornerShape(percent = 50)
                                    )
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun Leyenda(color: Color, texto: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .background(color = color, shape = CircleShape)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = texto,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun InvitacionQrCard(
    invitacion: Invitacion?,
    ingresos: List<IngresoInvitacion>,
    cargando: Boolean,
    error: String?,
    onGenerar: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(Dimensiones.RadioCampo),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = stringResource(R.string.detalle_invitacion),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(8.dp))

            if (invitacion == null) {
                Text(
                    text = stringResource(R.string.detalle_invitacion_sin_activa),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(12.dp))
            } else {
                val qr = remember(invitacion.qrContenido) {
                    generarQr(invitacion.qrContenido)
                }
                if (qr != null) {
                    Image(
                        bitmap = qr,
                        contentDescription = stringResource(R.string.detalle_invitacion_qr_descripcion),
                        contentScale = ContentScale.Fit,
                        modifier = Modifier.size(180.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }
                Text(
                    text = invitacion.codigo,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                if (invitacion.fechaExpiracion != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = stringResource(
                            R.string.detalle_invitacion_vence,
                            formatearFechaCorta(invitacion.fechaExpiracion.take(10))
                        ),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            BotonPrincipal(
                texto = stringResource(
                    if (invitacion == null) {
                        R.string.detalle_invitacion_generar
                    } else {
                        R.string.detalle_invitacion_regenerar
                    }
                ),
                textoCargando = stringResource(R.string.detalle_invitacion_generando),
                cargando = cargando,
                onClick = onGenerar
            )

            if (error != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = error,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = stringResource(R.string.detalle_invitacion_ingresos),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(8.dp))

            if (ingresos.isEmpty()) {
                Text(
                    text = stringResource(R.string.detalle_invitacion_sin_ingresos),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                ingresos.forEach { ingreso ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = ingreso.nombre,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        if (ingreso.fechaUnion != null) {
                            Text(
                                text = formatearFechaHoraCorta(ingreso.fechaUnion),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun Etiqueta(texto: String) {
    Surface(
        shape = RoundedCornerShape(percent = 50),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Text(
            text = texto,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
        )
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
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
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
