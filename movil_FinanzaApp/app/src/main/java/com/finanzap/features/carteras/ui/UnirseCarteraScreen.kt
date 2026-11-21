package com.finanzap.features.carteras.ui

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.ui.BannerError
import com.finanzap.core.ui.BotonPrincipal
import com.finanzap.core.ui.Dimensiones
import com.finanzap.core.ui.PantallaFormulario
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning

@Composable
fun UnirseCarteraScreen(
    onVolver: () -> Unit,
    viewModel: UnirseCarteraViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val contexto = LocalContext.current
    val foco = LocalFocusManager.current

    LaunchedEffect(Unit) {
        viewModel.eventos.collect { evento ->
            when (evento) {
                UnirseCarteraEvento.Unido -> onVolver()
            }
        }
    }

    val escanear: () -> Unit = {
        val opciones = GmsBarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
            .build()
        GmsBarcodeScanning.getClient(contexto, opciones).startScan()
            .addOnSuccessListener { codigo ->
                val contenido = codigo.rawValue
                if (contenido != null) {
                    viewModel.onCodigoEscaneado(contenido)
                } else {
                    viewModel.onErrorEscaner()
                }
            }
            .addOnFailureListener { viewModel.onErrorEscaner() }
    }

    PantallaFormulario(
        titulo = stringResource(R.string.unirse_titulo),
        onVolver = onVolver,
        descripcionVolver = stringResource(R.string.comun_volver)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = stringResource(R.string.unirse_descripcion),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(20.dp))

        OutlinedButton(
            onClick = escanear,
            shape = RoundedCornerShape(Dimensiones.RadioCampo),
            modifier = Modifier
                .fillMaxWidth()
                .height(Dimensiones.AlturaBoton)
        ) {
            Icon(
                painter = painterResource(R.drawable.ic_qr),
                contentDescription = null,
                modifier = Modifier.padding(end = 8.dp)
            )
            Text(stringResource(R.string.unirse_escanear))
        }

        Spacer(modifier = Modifier.height(20.dp))

        OutlinedTextField(
            value = state.codigo,
            onValueChange = viewModel::onCodigoChange,
            label = { Text(stringResource(R.string.unirse_codigo)) },
            singleLine = true,
            enabled = !state.cargando,
            shape = RoundedCornerShape(Dimensiones.RadioCampo),
            keyboardOptions = KeyboardOptions(
                capitalization = KeyboardCapitalization.Characters,
                keyboardType = KeyboardType.Text,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(
                onDone = {
                    foco.clearFocus()
                    viewModel.unirse()
                }
            ),
            modifier = Modifier.fillMaxWidth()
        )

        state.error?.let {
            Spacer(modifier = Modifier.height(12.dp))
            BannerError(mensaje = it)
        }

        Spacer(modifier = Modifier.height(24.dp))

        BotonPrincipal(
            texto = stringResource(R.string.unirse_accion),
            textoCargando = stringResource(R.string.comun_guardando),
            cargando = state.cargando,
            onClick = viewModel::unirse
        )
    }
}
