package com.finanzap.features.auth.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
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
class CuentaEditarViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow(CuentaEditarUiState())
    val state: StateFlow<CuentaEditarUiState> = _state.asStateFlow()

    private val _eventos = Channel<CuentaEditarEvento>(Channel.BUFFERED)
    val eventos: Flow<CuentaEditarEvento> = _eventos.receiveAsFlow()

    fun onNombreChange(nombre: String) {
        _state.update { it.copy(nombre = nombre, errorNombre = null, errorGeneral = null) }
    }

    fun onApaternoChange(apaterno: String) {
        _state.update { it.copy(apaterno = apaterno, errorGeneral = null) }
    }

    fun onAmaternoChange(amaterno: String) {
        _state.update { it.copy(amaterno = amaterno, errorGeneral = null) }
    }

    fun onCorreoChange(correo: String) {
        _state.update { it.copy(correo = correo, errorGeneral = null) }
    }

    fun guardar() {
        val actual = _state.value
        if (actual.guardando) return

        val nombre = actual.nombre.trim()
        if (nombre.isBlank()) {
            _state.update {
                it.copy(
                    errorNombre = "El nombre de usuario es obligatorio.",
                    errorGeneral = null
                )
            }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(guardando = true, errorGeneral = null) }
            authRepository.editarCuenta(
                nombreUsuario = nombre,
                apaterno = actual.apaterno.trim(),
                amaterno = actual.amaterno.trim(),
                correo = actual.correo.trim()
            )
                .onSuccess {
                    _state.update { it.copy(guardando = false) }
                    _eventos.trySend(CuentaEditarEvento.CuentaActualizada)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            guardando = false,
                            errorGeneral = mensajeErrorApi(
                                error,
                                "No se pudo actualizar la cuenta. Intenta de nuevo."
                            )
                        )
                    }
                }
        }
    }
}

data class CuentaEditarUiState(
    val nombre: String = "",
    val apaterno: String = "",
    val amaterno: String = "",
    val correo: String = "",
    val guardando: Boolean = false,
    val errorNombre: String? = null,
    val errorGeneral: String? = null
)

sealed interface CuentaEditarEvento {
    data object CuentaActualizada : CuentaEditarEvento
}
