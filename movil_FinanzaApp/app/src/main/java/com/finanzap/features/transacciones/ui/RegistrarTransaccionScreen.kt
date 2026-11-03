package com.finanzap.features.transacciones.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SelectableDates
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.finanzap.R
import com.finanzap.core.ui.BotonPrincipal
import com.finanzap.core.ui.PantallaFormulario
import com.finanzap.core.ui.Dimensiones
import com.finanzap.core.util.fechaIsoDesdeMillis
import com.finanzap.core.util.formatearFechaCorta

private enum class TipoTransaccion { INGRESO, GASTO }

/**
 * Interior del formulario de transacción. Sin ViewModel ni llamadas a la API:
 * la lógica de validación y guardado se implementa con el equipo.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegistrarTransaccionScreen(
    carteraId: Int,
    carteraNombre: String,
    onVolver: () -> Unit
) {
    var tipo by remember { mutableStateOf<TipoTransaccion?>(null) }
    var monto by remember { mutableStateOf("") }
    var categoria by remember { mutableStateOf<String?>(null) }
    var fecha by remember { mutableStateOf(fechaIsoDesdeMillis(System.currentTimeMillis())) }
    var descripcion by remember { mutableStateOf("") }
    var fechaEnEdicion by remember { mutableStateOf(false) }
    var mostrarAviso by remember { mutableStateOf(false) }

    PantallaFormulario(
        titulo = stringResource(R.string.transaccion_titulo),
        onVolver = onVolver,
        descripcionVolver = stringResource(R.string.comun_volver)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Surface(
            shape = RoundedCornerShape(Dimensiones.RadioCampo),
            color = MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
                Text(
                    text = stringResource(R.string.carteras_titulo),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = carteraNombre.ifBlank { "#$carteraId" },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = stringResource(R.string.transaccion_tipo),
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(
                selected = tipo == TipoTransaccion.INGRESO,
                onClick = { tipo = TipoTransaccion.INGRESO },
                label = { Text(stringResource(R.string.transaccion_ingreso)) }
            )
            FilterChip(
                selected = tipo == TipoTransaccion.GASTO,
                onClick = { tipo = TipoTransaccion.GASTO },
                label = { Text(stringResource(R.string.transaccion_gasto)) }
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        OutlinedTextField(
            value = monto,
            onValueChange = { monto = it },
            label = { Text(stringResource(R.string.transaccion_monto)) },
            prefix = { Text("$") },
            singleLine = true,
            shape = RoundedCornerShape(Dimensiones.RadioCampo),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        SelectorCategoria(
            seleccionada = categoria,
            onSeleccionar = { categoria = it }
        )

        Spacer(modifier = Modifier.height(12.dp))

        CampoFechaTransaccion(
            valor = formatearFechaCorta(fecha),
            onClick = { fechaEnEdicion = true }
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = descripcion,
            onValueChange = { descripcion = it },
            label = { Text(stringResource(R.string.transaccion_descripcion)) },
            minLines = 3,
            maxLines = 5,
            shape = RoundedCornerShape(Dimensiones.RadioCampo),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(24.dp))

        BotonPrincipal(
            texto = stringResource(R.string.transaccion_guardar),
            onClick = { mostrarAviso = true }
        )
    }

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

    if (mostrarAviso) {
        AlertDialog(
            onDismissRequest = { mostrarAviso = false },
            title = { Text(stringResource(R.string.transaccion_pendiente_titulo)) },
            text = { Text(stringResource(R.string.transaccion_pendiente_mensaje)) },
            confirmButton = {
                TextButton(onClick = { mostrarAviso = false }) {
                    Text(stringResource(R.string.comun_aceptar))
                }
            }
        )
    }
}

@Composable
private fun CampoFechaTransaccion(
    valor: String?,
    onClick: () -> Unit
) {
    OutlinedButton(
        onClick = onClick,
        shape = RoundedCornerShape(Dimensiones.RadioCampo),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 18.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = stringResource(R.string.transaccion_fecha),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Start,
            modifier = Modifier.weight(1f)
        )
        Text(
            text = valor ?: stringResource(R.string.nueva_cartera_sin_fecha),
            style = MaterialTheme.typography.bodyMedium,
            color = if (valor == null) {
                MaterialTheme.colorScheme.onSurfaceVariant
            } else {
                MaterialTheme.colorScheme.onSurface
            }
        )
        Spacer(modifier = Modifier.width(8.dp))
        Icon(
            imageVector = Icons.Default.DateRange,
            contentDescription = null,
            modifier = Modifier.size(18.dp)
        )
    }
}
