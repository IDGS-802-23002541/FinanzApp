package com.finanzap.features.auth.ui.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.correoValido
import com.finanzap.features.auth.data.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow(LoginUiState())
    val state: StateFlow<LoginUiState> = _state.asStateFlow()

    fun onCorreoChange(correo: String) {
        _state.update { it.copy(correo = correo, errorCorreo = null, error = null) }
    }

    fun onContrasenaChange(contrasena: String) {
        _state.update { it.copy(contrasena = contrasena, errorContrasena = null, error = null) }
    }

    fun onToggleContrasena() {
        _state.update { it.copy(contrasenaVisible = !it.contrasenaVisible) }
    }

    fun iniciarSesion() {
        val actual = _state.value
        if (actual.cargando) return

        val correo = actual.correo.trim()
        val errorCorreo = validarCorreo(correo)
        val errorContrasena = validarContrasena(actual.contrasena)
        if (errorCorreo != null || errorContrasena != null) {
            _state.update {
                it.copy(errorCorreo = errorCorreo, errorContrasena = errorContrasena, error = null)
            }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(cargando = true, error = null) }
            authRepository.iniciarSesion(correo, actual.contrasena)
                .onSuccess {
                    _state.update { it.copy(cargando = false, loginExitoso = true) }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(cargando = false, error = mensajeError(error))
                    }
                }
        }
    }

    fun onLoginNavegado() {
        _state.update { it.copy(loginExitoso = false) }
    }

    private fun validarCorreo(correo: String): String? = when {
        correo.isBlank() -> "Ingresa tu correo."
        !correoValido(correo) -> "Ingresa un correo válido."
        else -> null
    }

    private fun validarContrasena(contrasena: String): String? =
        if (contrasena.isBlank()) "Ingresa tu contraseña." else null

    private fun mensajeError(error: Throwable): String = when (error) {
        is HttpException -> if (error.code() == 401 || error.code() == 403) {
            "Correo o contraseña incorrectos."
        } else {
            "No se pudo iniciar sesión. Intenta de nuevo."
        }
        is IOException -> "No se pudo conectar. Revisa tu conexión."
        else -> "Ocurrió un error. Intenta de nuevo."
    }
}
