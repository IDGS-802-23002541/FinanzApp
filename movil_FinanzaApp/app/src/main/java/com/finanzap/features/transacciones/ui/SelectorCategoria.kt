package com.finanzap.features.transacciones.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.finanzap.R
import com.finanzap.features.transacciones.Categoria

/**
 * Selector de categorías de la cartera. Permite buscar entre las ya creadas en la
 * sesión y crear una nueva contra la API.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SelectorCategoria(
    categorias: List<Categoria>,
    seleccionada: Categoria?,
    onSeleccionar: (Categoria) -> Unit,
    onCrear: (String) -> Unit,
    creando: Boolean,
    error: String?,
    modifier: Modifier = Modifier
) {
    var consulta by remember { mutableStateOf(seleccionada?.nombre.orEmpty()) }
    var expandido by remember { mutableStateOf(false) }
    var categoriaPorCrear by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(seleccionada) {
        consulta = seleccionada?.nombre.orEmpty()
    }

    val filtradas = categorias.filter { it.nombre.contains(consulta.trim(), ignoreCase = true) }
    val puedeCrear = consulta.isNotBlank() &&
        categorias.none { it.nombre.equals(consulta.trim(), ignoreCase = true) }

    Column(modifier = modifier) {
        ExposedDropdownMenuBox(
            expanded = expandido,
            onExpandedChange = { expandido = it }
        ) {
            OutlinedTextField(
                value = consulta,
                onValueChange = {
                    consulta = it
                    expandido = true
                },
                label = { Text(stringResource(R.string.transaccion_categoria)) },
                placeholder = { Text(stringResource(R.string.categoria_buscar)) },
                singleLine = true,
                isError = error != null,
                supportingText = error?.let { { Text(it) } },
                trailingIcon = {
                    if (creando) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandido)
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor(ExposedDropdownMenuAnchorType.PrimaryEditable)
            )

            ExposedDropdownMenu(
                expanded = expandido,
                onDismissRequest = { expandido = false }
            ) {
                filtradas.forEach { categoria ->
                    DropdownMenuItem(
                        text = { Text(categoria.nombre) },
                        onClick = {
                            consulta = categoria.nombre
                            onSeleccionar(categoria)
                            expandido = false
                        }
                    )
                }
                if (puedeCrear && !creando) {
                    DropdownMenuItem(
                        text = { Text(stringResource(R.string.categoria_crear, consulta.trim())) },
                        onClick = {
                            categoriaPorCrear = consulta.trim()
                            expandido = false
                        }
                    )
                }
            }
        }
    }

    categoriaPorCrear?.let { nueva ->
        AlertDialog(
            onDismissRequest = { categoriaPorCrear = null },
            title = { Text(stringResource(R.string.categoria_confirmar_titulo)) },
            text = { Text(stringResource(R.string.categoria_confirmar_mensaje, nueva)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        onCrear(nueva)
                        categoriaPorCrear = null
                    }
                ) {
                    Text(stringResource(R.string.comun_crear))
                }
            },
            dismissButton = {
                TextButton(onClick = { categoriaPorCrear = null }) {
                    Text(stringResource(R.string.comun_cancelar))
                }
            }
        )
    }
}
