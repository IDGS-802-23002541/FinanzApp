package com.finanzap.core.navigation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.session.EventosSesion
import com.finanzap.core.storage.PreferenciasTema
import com.finanzap.features.auth.data.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val preferenciasTema: PreferenciasTema,
    eventosSesion: EventosSesion
) : ViewModel() {

    private val _state = MutableStateFlow(MainUiState(temaOscuro = preferenciasTema.temaOscuro()))
    val state: StateFlow<MainUiState> = _state.asStateFlow()

    private val _eventos = Channel<MainEvento>(Channel.BUFFERED)
    val eventos: Flow<MainEvento> = _eventos.receiveAsFlow()

    init {
        viewModelScope.launch {
            val haySesion = withContext(Dispatchers.IO) { authRepository.haySesion() }
            _state.update { it.copy(cargando = false, haySesion = haySesion) }
        }
        viewModelScope.launch {
            eventosSesion.sesionTerminada.collect { _eventos.send(MainEvento.IrALogin) }
        }
    }

    fun cerrarSesion() {
        viewModelScope.launch {
            authRepository.cerrarSesion()
            _eventos.send(MainEvento.IrALogin)
        }
    }

    fun guardarTemaOscuro(oscuro: Boolean) {
        preferenciasTema.guardarTemaOscuro(oscuro)
        _state.update { it.copy(temaOscuro = oscuro) }
    }
}
