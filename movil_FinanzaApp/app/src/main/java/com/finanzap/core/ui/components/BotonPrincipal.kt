package com.finanzap.core.ui.components

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.finanzap.core.ui.theme.Dimensiones

/** Botón de acción principal: muestra avance y se deshabilita mientras guarda. */
@Composable
fun BotonPrincipal(
    texto: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    cargando: Boolean = false,
    textoCargando: String = texto,
    iconoFinal: ImageVector? = null
) {
    Button(
        onClick = onClick,
        enabled = !cargando,
        shape = RoundedCornerShape(Dimensiones.RadioCampo),
        modifier = modifier
            .fillMaxWidth()
            .height(Dimensiones.AlturaBoton)
    ) {
        if (cargando) {
            CircularProgressIndicator(
                modifier = Modifier.size(18.dp),
                strokeWidth = 2.dp,
                color = MaterialTheme.colorScheme.onPrimary
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(textoCargando)
        } else {
            Text(texto)
            if (iconoFinal != null) {
                Spacer(modifier = Modifier.width(8.dp))
                Icon(
                    imageVector = iconoFinal,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}
