package com.finanzap.features.auth.ui.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.errorCorreo
import com.finanzap.core.util.mensajeErrorApi
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
import retrofit2.HttpException
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow(LoginUiState())
    val state: StateFlow<LoginUiState> = _state.asStateFlow()

    private val _eventos = Channel<LoginEvento>(Channel.BUFFERED)
    val eventos: Flow<LoginEvento> = _eventos.receiveAsFlow()

    fun onCorreoChange(correo: String) {
        _state.update { it.copy(correo = correo, errorCorreo = null, errorGeneral = null) }
    }

    fun onContrasenaChange(contrasena: String) {
        _state.update { it.copy(contrasena = contrasena, errorContrasena = null, errorGeneral = null) }
    }

    fun onToggleContrasena() {
        _state.update { it.copy(contrasenaVisible = !it.contrasenaVisible) }
    }

    fun iniciarSesion() {
        val actual = _state.value
        if (actual.cargando) return

        val correo = actual.correo.trim()
        val errorDeCorreo = errorCorreo(correo)
        val errorContrasena = validarContrasena(actual.contrasena)
        if (errorDeCorreo != null || errorContrasena != null) {
            _state.update {
                it.copy(errorCorreo = errorDeCorreo, errorContrasena = errorContrasena, errorGeneral = null)
            }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(cargando = true, errorGeneral = null) }
            authRepository.iniciarSesion(correo, actual.contrasena)
                .onSuccess {
                    _state.update { it.copy(cargando = false) }
                    _eventos.trySend(LoginEvento.IrACarteras)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(cargando = false, errorGeneral = mensajeError(error))
                    }
                }
        }
    }

    private fun validarContrasena(contrasena: String): String? =
        if (contrasena.isBlank()) "Ingresa tu contraseña." else null

    private fun mensajeError(error: Throwable): String =
        if (error is HttpException && (error.code() == 401 || error.code() == 403)) {
            "Correo o contraseña incorrectos."
        } else {
            mensajeErrorApi(error, "No se pudo iniciar sesión. Intenta de nuevo.")
        }
}
