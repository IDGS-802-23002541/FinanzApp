package com.finanzap.core.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.finanzap.core.util.formatearMoneda
import kotlin.math.min

/** Un segmento de la gráfica circular. */
data class DatoDona(
    val nombre: String,
    val valor: Double
)

/**
 * Gráfica circular (dona) con leyenda. Se dibuja con Canvas para no sumar
 * dependencias de gráficas a la app.
 */
@Composable
fun GraficaDona(
    datos: List<DatoDona>,
    modifier: Modifier = Modifier
) {
    val total = datos.sumOf { it.valor }
    if (total <= 0.0) return

    val colores = coloresDona()
    val ordenados = datos.sortedByDescending { it.valor }
    val grosor = 24.dp

    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier.size(148.dp),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.size(148.dp)) {
                val trazo = Stroke(width = grosor.toPx(), cap = StrokeCap.Round)
                val diametro = min(size.width, size.height) - trazo.width
                val esquina = Offset(
                    x = (size.width - diametro) / 2f,
                    y = (size.height - diametro) / 2f
                )
                var inicio = -90f
                ordenados.forEachIndexed { indice, dato ->
                    val barrido = (dato.valor / total * 360.0).toFloat()
                    // Se separa cada segmento para que se distingan sin líneas extra.
                    val hueco = if (ordenados.size > 1) 2f else 0f
                    drawArc(
                        color = colores[indice % colores.size],
                        startAngle = inicio,
                        sweepAngle = (barrido - hueco).coerceAtLeast(0.5f),
                        useCenter = false,
                        topLeft = esquina,
                        size = androidx.compose.ui.geometry.Size(diametro, diametro),
                        style = trazo
                    )
                    inicio += barrido
                }
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = formatearMoneda(total),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Total",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.width(16.dp))

        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            ordenados.forEachIndexed { indice, dato ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .background(
                                color = colores[indice % colores.size],
                                shape = CircleShape
                            )
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = dato.nombre,
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "${formatearMoneda(dato.valor)} · " +
                                "${(dato.valor / total * 100).toInt()}%",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun coloresDona(): List<Color> = listOf(
    MaterialTheme.colorScheme.primary,
    MaterialTheme.colorScheme.secondary,
    MaterialTheme.colorScheme.tertiary,
    PetroleoMedio,
    Coral,
    Terracota,
    Color(0xFF7A9E7E),
    Color(0xFFB08A5A)
)
