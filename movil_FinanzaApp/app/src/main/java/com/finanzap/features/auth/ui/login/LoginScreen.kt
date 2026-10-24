package com.finanzap.features.auth.ui.login

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.finanzap.R
import com.finanzap.core.ui.components.BannerError
import com.finanzap.core.ui.theme.Blanco
import com.finanzap.core.ui.theme.Coral
import com.finanzap.core.ui.theme.Petroleo
import com.finanzap.core.ui.theme.PetroleoMedio
import com.finanzap.core.ui.theme.PetroleoProfundo

@Composable
fun LoginScreen(
    temaOscuro: Boolean,
    onAlternarTema: () -> Unit,
    onLoginExitoso: () -> Unit,
    viewModel: LoginViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val foco = LocalFocusManager.current
    val focoContrasena = remember { FocusRequester() }

    LaunchedEffect(Unit) {
        viewModel.eventos.collect { evento ->
            when (evento) {
                LoginEvento.IrACarteras -> onLoginExitoso()
            }
        }
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .imePadding()
                .verticalScroll(rememberScrollState())
        ) {
            EncabezadoMarca(
                temaOscuro = temaOscuro,
                onAlternarTema = onAlternarTema
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 32.dp)
            ) {
                Text(
                    text = stringResource(R.string.login_encabezado),
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = (-0.5).sp,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.login_descripcion),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(28.dp))

                val errorCorreo = state.errorCorreo
                OutlinedTextField(
                    value = state.correo,
                    onValueChange = viewModel::onCorreoChange,
                    label = { Text(stringResource(R.string.login_correo)) },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.Email, contentDescription = null)
                    },
                    isError = errorCorreo != null,
                    supportingText = if (errorCorreo != null) {
                        { Text(errorCorreo) }
                    } else {
                        null
                    },
                    singleLine = true,
                    enabled = !state.cargando,
                    shape = RoundedCornerShape(10.dp),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Email,
                        imeAction = ImeAction.Next
                    ),
                    keyboardActions = KeyboardActions(
                        onNext = { focoContrasena.requestFocus() }
                    ),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(12.dp))

                val errorContrasena = state.errorContrasena
                OutlinedTextField(
                    value = state.contrasena,
                    onValueChange = viewModel::onContrasenaChange,
                    label = { Text(stringResource(R.string.login_contrasena)) },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.Lock, contentDescription = null)
                    },
                    trailingIcon = {
                        IconButton(
                            onClick = viewModel::onToggleContrasena,
                            enabled = !state.cargando
                        ) {
                            Icon(
                                painter = painterResource(
                                    if (state.contrasenaVisible) {
                                        R.drawable.ic_visibilidad_oculto
                                    } else {
                                        R.drawable.ic_visibilidad
                                    }
                                ),
                                contentDescription = stringResource(
                                    if (state.contrasenaVisible) {
                                        R.string.login_ocultar_contrasena
                                    } else {
                                        R.string.login_mostrar_contrasena
                                    }
                                )
                            )
                        }
                    },
                    isError = errorContrasena != null,
                    supportingText = if (errorContrasena != null) {
                        { Text(errorContrasena) }
                    } else {
                        null
                    },
                    singleLine = true,
                    enabled = !state.cargando,
                    shape = RoundedCornerShape(10.dp),
                    visualTransformation = if (state.contrasenaVisible) {
                        VisualTransformation.None
                    } else {
                        PasswordVisualTransformation()
                    },
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Password,
                        imeAction = ImeAction.Done
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = {
                            foco.clearFocus()
                            viewModel.iniciarSesion()
                        }
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(focoContrasena)
                )

                val errorGeneral = state.errorGeneral
                if (errorGeneral != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    BannerError(mensaje = errorGeneral)
                }

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = viewModel::iniciarSesion,
                    enabled = !state.cargando,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                ) {
                    if (state.cargando) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            strokeWidth = 2.dp,
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(stringResource(R.string.login_entrando))
                    } else {
                        Text(stringResource(R.string.login_entrar))
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowRight,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}

// Banda de marca: mismo gradiente, círculos y jerarquía del panel de AuthLayout en la web.
@Composable
private fun EncabezadoMarca(
    temaOscuro: Boolean,
    onAlternarTema: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(224.dp)
            .background(
                Brush.linearGradient(
                    colors = listOf(Petroleo, PetroleoMedio, PetroleoProfundo)
                )
            )
    ) {
        Canvas(modifier = Modifier.matchParentSize()) {
            val centro = Offset(size.width * 1.02f, -size.height * 0.12f)
            val trazo = Stroke(width = 1.5.dp.toPx())
            drawCircle(
                color = Coral.copy(alpha = 0.35f),
                radius = size.minDimension * 0.58f,
                center = centro,
                style = trazo
            )
            drawCircle(
                color = Coral.copy(alpha = 0.35f),
                radius = size.minDimension * 0.76f,
                center = centro,
                style = trazo
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp, vertical = 20.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(shape = CircleShape, color = Blanco) {
                    Box(contentAlignment = Alignment.Center, modifier = Modifier.size(36.dp)) {
                        Text(
                            text = "F",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Petroleo
                        )
                    }
                }
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = stringResource(R.string.app_name),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Blanco
                )
                Spacer(modifier = Modifier.weight(1f))
                IconButton(onClick = onAlternarTema) {
                    Icon(
                        painter = painterResource(
                            if (temaOscuro) R.drawable.ic_tema_claro else R.drawable.ic_tema_oscuro
                        ),
                        contentDescription = stringResource(
                            if (temaOscuro) {
                                R.string.tema_cambiar_claro
                            } else {
                                R.string.tema_cambiar_oscuro
                            }
                        ),
                        tint = Blanco
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Text(
                text = stringResource(R.string.login_lema),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.ExtraBold,
                lineHeight = 32.sp,
                letterSpacing = (-0.5).sp,
                color = Blanco
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = stringResource(R.string.login_lema_pie),
                style = MaterialTheme.typography.bodySmall,
                color = Blanco.copy(alpha = 0.7f)
            )
        }
    }
}
