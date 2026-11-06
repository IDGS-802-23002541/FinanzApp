package com.finanzap.core.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.finanzap.core.ui.Dimensiones

/** Estructura común de los formularios: cabecera, scroll y márgenes. */
@Composable
fun PantallaFormulario(
    titulo: String,
    onVolver: () -> Unit,
    descripcionVolver: String,
    modifier: Modifier = Modifier,
    contenido: @Composable ColumnScope.() -> Unit
) {
    Scaffold(
        containerColor = MaterialTheme.colorScheme.background
    ) { margen ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(margen)
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(
                    horizontal = Dimensiones.MargenHorizontal,
                    vertical = Dimensiones.MargenVertical
                )
        ) {
            EncabezadoVolver(
                titulo = titulo,
                onVolver = onVolver,
                descripcionVolver = descripcionVolver
            )
            contenido()
        }
    }
}
