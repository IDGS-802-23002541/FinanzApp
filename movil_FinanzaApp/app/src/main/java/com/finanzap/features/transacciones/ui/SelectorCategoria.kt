package com.finanzap.features.transacciones.ui

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.finanzap.R

private val categoriasIniciales = listOf("Alimentos", "Transporte", "Servicios", "Vivienda", "Ocio")

/**
 * Selector de categorías con búsqueda y creación al vuelo.
 * Solo interfaz: la creación se guarda en memoria hasta conectar la API.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SelectorCategoria(
    seleccionada: String?,
    onSeleccionar: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var consulta by remember { mutableStateOf(seleccionada.orEmpty()) }
    var expandido by remember { mutableStateOf(false) }
    var categoriaPorCrear by remember { mutableStateOf<String?>(null) }
    val categorias = remember { mutableStateListOf(*categoriasIniciales.toTypedArray()) }

    val filtradas = categorias.filter { it.contains(consulta.trim(), ignoreCase = true) }
    val puedeCrear = consulta.isNotBlank() &&
        categorias.none { it.equals(consulta.trim(), ignoreCase = true) }

    ExposedDropdownMenuBox(
        expanded = expandido,
        onExpandedChange = { expandido = it },
        modifier = modifier
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
            trailingIcon = {
                ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandido)
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
                    text = { Text(categoria) },
                    onClick = {
                        consulta = categoria
                        onSeleccionar(categoria)
                        expandido = false
                    }
                )
            }
            if (puedeCrear) {
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

    categoriaPorCrear?.let { nueva ->
        AlertDialog(
            onDismissRequest = { categoriaPorCrear = null },
            title = { Text(stringResource(R.string.categoria_confirmar_titulo)) },
            text = { Text(stringResource(R.string.categoria_confirmar_mensaje, nueva)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        categorias.add(nueva)
                        consulta = nueva
                        onSeleccionar(nueva)
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
