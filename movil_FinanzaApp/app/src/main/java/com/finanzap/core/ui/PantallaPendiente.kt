package com.finanzap.core.ui

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.finanzap.R

/** Marcador para módulos del menú que todavía no tienen pantalla. */
@Composable
fun PantallaPendiente(
    titulo: String,
    descripcionVolver: String,
    mensaje: String,
    onVolver: () -> Unit
) {
    PantallaFormulario(
        titulo = titulo,
        onVolver = onVolver,
        descripcionVolver = descripcionVolver
    ) {
        Spacer(modifier = Modifier.height(32.dp))
        Text(
            text = stringResource(R.string.comun_pendiente_titulo),
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = mensaje,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
