package com.finanzap.features.carteras.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.ui.BotonPrincipal
import com.finanzap.core.ui.Dimensiones
import com.finanzap.core.ui.EstadoError
import com.finanzap.core.ui.PantallaFormulario
import com.finanzap.core.util.formatearMoneda
import com.finanzap.core.util.formatearRangoFechas
import com.finanzap.features.carteras.Cartera

@Composable
fun CarteraDetalleScreen(
    carteraId: Int,
    onVolver: () -> Unit,
    onRegistrarGasto: (Int, String) -> Unit,
    viewModel: CarteraDetalleViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(carteraId) {
        viewModel.cargar(carteraId)
    }

    CarteraDetalleContenido(
        state = state,
        onVolver = onVolver,
        onReintentar = { viewModel.cargar(carteraId) },
        onRegistrarGasto = onRegistrarGasto
    )
}

@Composable
fun CarteraDetalleContenido(
    state: CarteraDetalleUiState,
    onVolver: () -> Unit,
    onReintentar: () -> Unit,
    onRegistrarGasto: (Int, String) -> Unit
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
                onRegistrarGasto = onRegistrarGasto
            )
        }
    }
}

@Composable
private fun DetalleCartera(
    cartera: Cartera,
    onRegistrarGasto: (Int, String) -> Unit
) {
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

    Spacer(modifier = Modifier.height(16.dp))

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

    Spacer(modifier = Modifier.height(16.dp))

    Row(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = stringResource(R.string.detalle_presupuesto),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = formatearMoneda(cartera.presupuestoInicial),
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
        strokeCap = StrokeCap.Round
    )

    Spacer(modifier = Modifier.height(20.dp))

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(Dimensiones.RadioCampo),
        color = MaterialTheme.colorScheme.surfaceVariant
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = stringResource(R.string.detalle_graficas),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = stringResource(R.string.detalle_graficas_pendiente),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }

    Spacer(modifier = Modifier.height(24.dp))

    BotonPrincipal(
        texto = stringResource(R.string.carteras_registrar_gasto),
        onClick = { onRegistrarGasto(cartera.id, cartera.nombre) }
    )
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
