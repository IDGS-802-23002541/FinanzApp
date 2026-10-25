package com.finanzap.features.auth.ui.cuenta

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.auth.data.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@HiltViewModel
class MiCuentaViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow(MiCuentaUiState())
    val state: StateFlow<MiCuentaUiState> = _state.asStateFlow()

    fun onPedirAccion(accion: AccionCuenta) {
        _state.update {
            it.copy(
                accion = accion,
                contrasena = "",
                errorContrasena = null,
                errorGeneral = null
            )
        }
    }

    fun onCancelarAccion() {
        if (_state.value.procesando) return
        _state.update {
            it.copy(
                accion = AccionCuenta.NINGUNA,
                contrasena = "",
                errorContrasena = null,
                errorGeneral = null
            )
        }
    }

    fun onContrasenaChange(contrasena: String) {
        _state.update { it.copy(contrasena = contrasena, errorContrasena = null, errorGeneral = null) }
    }

    fun confirmarAccion() {
        val actual = _state.value
        if (actual.procesando || actual.accion == AccionCuenta.NINGUNA) return

        if (actual.contrasena.isBlank()) {
            _state.update { it.copy(errorContrasena = "Ingresa tu contraseña para confirmar.") }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(procesando = true, errorGeneral = null) }
            val resultado = if (actual.accion == AccionCuenta.DESACTIVAR) {
                authRepository.desactivarCuenta(actual.contrasena)
            } else {
                authRepository.eliminarCuenta(actual.contrasena)
            }
            resultado
                .onSuccess {
                    _state.update { it.copy(procesando = false, cuentaCerrada = true) }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            procesando = false,
                            errorGeneral = mensajeErrorApi(
                                error,
                                "No se pudo completar la acción. Intenta de nuevo."
                            )
                        )
                    }
                }
        }
    }
}
