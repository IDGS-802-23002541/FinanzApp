package com.finanzap.core.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/** Error debajo de un grupo de campos que no usan supportingText. */
@Composable
fun ErrorCampo(
    mensaje: String,
    modifier: Modifier = Modifier
) {
    Text(
        text = mensaje,
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.error,
        modifier = modifier
    )
}
