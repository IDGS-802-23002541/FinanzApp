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
class PreferenciasNotificacionViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow(PreferenciasNotificacionUiState())
    val state: StateFlow<PreferenciasNotificacionUiState> = _state.asStateFlow()

    private val _eventos = Channel<PreferenciasNotificacionEvento>(Channel.BUFFERED)
    val eventos: Flow<PreferenciasNotificacionEvento> = _eventos.receiveAsFlow()

    fun cargar() {
        _state.update { it.copy(cargando = true, errorCarga = null) }
        viewModelScope.launch {
            authRepository.obtenerPreferencias()
                .onSuccess { preferencias ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            movimientos = preferencias.movimientos,
                            sistema = preferencias.sistema,
                            pagos = preferencias.pagos
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            errorCarga = mensajeErrorApi(
                                error,
                                "No se pudieron cargar tus preferencias."
                            )
                        )
                    }
                }
        }
    }

    fun onMovimientosChange(movimientos: Boolean) {
        _state.update { it.copy(movimientos = movimientos) }
    }

    fun onSistemaChange(sistema: Boolean) {
        _state.update { it.copy(sistema = sistema) }
    }

    fun onPagosChange(pagos: Boolean) {
        _state.update { it.copy(pagos = pagos) }
    }

    fun guardar() {
        val actual = _state.value
        if (actual.guardando || actual.cargando) return

        viewModelScope.launch {
            _state.update { it.copy(guardando = true, errorGuardado = null) }
            authRepository.guardarPreferencias(
                movimientos = actual.movimientos,
                sistema = actual.sistema,
                pagos = actual.pagos
            )
                .onSuccess { preferencias ->
                    _state.update {
                        it.copy(
                            guardando = false,
                            movimientos = preferencias.movimientos,
                            sistema = preferencias.sistema,
                            pagos = preferencias.pagos
                        )
                    }
                    _eventos.trySend(PreferenciasNotificacionEvento.PreferenciasGuardadas)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            guardando = false,
                            errorGuardado = mensajeErrorApi(
                                error,
                                "No se pudieron guardar tus preferencias. Intenta de nuevo."
                            )
                        )
                    }
                }
        }
    }
}

data class PreferenciasNotificacionUiState(
    val cargando: Boolean = true,
    val movimientos: Boolean = true,
    val sistema: Boolean = true,
    val pagos: Boolean = true,
    val guardando: Boolean = false,
    val errorCarga: String? = null,
    val errorGuardado: String? = null
)

sealed interface PreferenciasNotificacionEvento {
    data object PreferenciasGuardadas : PreferenciasNotificacionEvento
}
