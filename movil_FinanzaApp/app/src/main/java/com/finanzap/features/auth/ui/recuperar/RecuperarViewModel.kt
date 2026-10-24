package com.finanzap.features.auth.ui.recuperar

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.codigoValido
import com.finanzap.core.util.correoValido
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.core.util.requisitosContrasena
import com.finanzap.features.auth.data.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RecuperarViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow(RecuperarUiState())
    val state: StateFlow<RecuperarUiState> = _state.asStateFlow()

    private val _eventos = Channel<RecuperarEvento>(Channel.BUFFERED)
    val eventos: Flow<RecuperarEvento> = _eventos.receiveAsFlow()

    fun onCorreoChange(correo: String) {
        _state.update { it.copy(correo = correo, errorCorreo = null, errorGeneral = null) }
    }

    fun onCodigoChange(codigo: String) {
        if (codigo.length > 6 || codigo.any { !it.isDigit() }) return
        _state.update { it.copy(codigo = codigo, errorCodigo = null, errorGeneral = null) }
    }

    fun onContrasenaChange(contrasena: String) {
        _state.update {
            it.copy(contrasena = contrasena, errorContrasena = null, errorGeneral = null)
        }
    }

    fun onConfirmarChange(confirmar: String) {
        _state.update {
            it.copy(confirmarContrasena = confirmar, errorConfirmar = null, errorGeneral = null)
        }
    }

    fun onToggleContrasena() {
        _state.update { it.copy(contrasenaVisible = !it.contrasenaVisible) }
    }

    fun volverPaso() {
        _state.update {
            it.copy(
                paso = PasoRecuperacion.SOLICITUD,
                codigo = "",
                contrasena = "",
                confirmarContrasena = "",
                errorCodigo = null,
                errorContrasena = null,
                errorConfirmar = null,
                errorGeneral = null
            )
        }
    }

    fun solicitarCodigo() {
        val actual = _state.value
        if (actual.cargando) return

        val correo = actual.correo.trim()
        val errorCorreo = when {
            correo.isBlank() -> "Ingresa tu correo."
            !correoValido(correo) -> "Ingresa un correo válido."
            else -> null
        }
        if (errorCorreo != null) {
            _state.update { it.copy(errorCorreo = errorCorreo, errorGeneral = null) }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(cargando = true, errorCorreo = null, errorGeneral = null) }
            authRepository.solicitarRecuperacion(correo)
                .onSuccess { codigoDesarrollo ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            paso = PasoRecuperacion.CODIGO,
                            codigo = "",
                            codigoDesarrollo = codigoDesarrollo
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            errorGeneral = mensajeErrorApi(
                                error,
                                "No se pudo enviar el código. Intenta de nuevo."
                            )
                        )
                    }
                }
        }
    }

    fun restablecer() {
        val actual = _state.value
        if (actual.cargando) return

        val errorCodigo = if (codigoValido(actual.codigo)) null
        else "Ingresa el código de 6 dígitos."

        val requisitos = requisitosContrasena(actual.contrasena)
        val errorContrasena = if (requisitos.isEmpty()) null
        else "Debe incluir: ${requisitos.joinToString(", ")}."

        val errorConfirmar = if (actual.confirmarContrasena == actual.contrasena) null
        else "Las contraseñas no coinciden."

        if (errorCodigo != null || errorContrasena != null || errorConfirmar != null) {
            _state.update {
                it.copy(
                    errorCodigo = errorCodigo,
                    errorContrasena = errorContrasena,
                    errorConfirmar = errorConfirmar,
                    errorGeneral = null
                )
            }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(cargando = true, errorGeneral = null) }
            authRepository.restablecerContrasenia(
                correo = actual.correo.trim(),
                codigo = actual.codigo,
                contrasena = actual.contrasena
            )
                .onSuccess {
                    _state.update { it.copy(cargando = false) }
                    _eventos.send(RecuperarEvento.RecuperacionCompletada)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            errorGeneral = mensajeErrorApi(
                                error,
                                "No se pudo cambiar la contraseña. Intenta de nuevo."
                            )
                        )
                    }
                }
        }
    }
}
