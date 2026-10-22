package com.finanzap.core.navigation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.session.EventosSesion
import com.finanzap.core.storage.PreferenciasTema
import com.finanzap.features.auth.data.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val preferenciasTema: PreferenciasTema,
    eventosSesion: EventosSesion
) : ViewModel() {

    // null = todavía se está leyendo el token; true/false = ya hay respuesta.
    private val _haySesion = MutableStateFlow<Boolean?>(null)
    val haySesion: StateFlow<Boolean?> = _haySesion.asStateFlow()

    // null = el usuario no ha elegido tema y se sigue el del sistema.
    private val _temaOscuro = MutableStateFlow(preferenciasTema.temaOscuro())
    val temaOscuro: StateFlow<Boolean?> = _temaOscuro.asStateFlow()

    // Se emite cuando hay que regresar al login: logout propio o refresh rechazado.
    private val _irALogin = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val irALogin: SharedFlow<Unit> = _irALogin.asSharedFlow()

    init {
        viewModelScope.launch {
            _haySesion.value = withContext(Dispatchers.IO) {
                authRepository.haySesion()
            }
        }

        viewModelScope.launch {
            eventosSesion.sesionTerminada.collect { _irALogin.emit(Unit) }
        }
    }

    fun cerrarSesion() {
        viewModelScope.launch {
            authRepository.cerrarSesion()
            _irALogin.emit(Unit)
        }
    }

    fun guardarTemaOscuro(oscuro: Boolean) {
        preferenciasTema.guardarTemaOscuro(oscuro)
        _temaOscuro.value = oscuro
    }
}
