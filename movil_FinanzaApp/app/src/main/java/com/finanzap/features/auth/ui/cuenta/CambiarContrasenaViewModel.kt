package com.finanzap.features.auth.ui.cuenta

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.errorConfirmacion
import com.finanzap.core.util.errorContrasenaNueva
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.auth.data.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@HiltViewModel
class CambiarContrasenaViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow(CambiarContrasenaUiState())
    val state: StateFlow<CambiarContrasenaUiState> = _state.asStateFlow()

    private val _eventos = Channel<CambiarContrasenaEvento>(Channel.BUFFERED)
    val eventos: Flow<CambiarContrasenaEvento> = _eventos.receiveAsFlow()

    fun onActualChange(actual: String) {
        _state.update { it.copy(actual = actual, errorActual = null, errorGeneral = null) }
    }

    fun onNuevaChange(nueva: String) {
        _state.update { it.copy(nueva = nueva, errorNueva = null, errorGeneral = null) }
    }

    fun onConfirmarChange(confirmar: String) {
        _state.update { it.copy(confirmar = confirmar, errorConfirmar = null, errorGeneral = null) }
    }

    fun onToggleVisibles() {
        _state.update { it.copy(visibles = !it.visibles) }
    }

    fun guardar() {
        val actual = _state.value
        if (actual.guardando) return

        val errorActual = if (actual.actual.isBlank()) "Ingresa tu contraseña actual." else null

        val errorNueva = when {
            actual.nueva.isBlank() -> "Ingresa tu nueva contraseña."
            actual.nueva == actual.actual -> "La nueva contraseña debe ser distinta de la actual."
            else -> errorContrasenaNueva(actual.nueva)
        }

        val errorConfirmar = errorConfirmacion(actual.nueva, actual.confirmar)

        if (errorActual != null || errorNueva != null || errorConfirmar != null) {
            _state.update {
                it.copy(
                    errorActual = errorActual,
                    errorNueva = errorNueva,
                    errorConfirmar = errorConfirmar,
                    errorGeneral = null
                )
            }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(guardando = true, errorGeneral = null) }
            authRepository.cambiarContrasenia(actual = actual.actual, nueva = actual.nueva)
                .onSuccess {
                    _state.update { it.copy(guardando = false) }
                    _eventos.trySend(CambiarContrasenaEvento.ContrasenaCambiada)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            guardando = false,
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
