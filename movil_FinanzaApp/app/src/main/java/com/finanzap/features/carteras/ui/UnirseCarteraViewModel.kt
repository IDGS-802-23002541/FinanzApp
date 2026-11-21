package com.finanzap.features.carteras.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.carteras.data.InvitacionesRepository
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
class UnirseCarteraViewModel @Inject constructor(
    private val invitacionesRepository: InvitacionesRepository
) : ViewModel() {

    private val _state = MutableStateFlow(UnirseCarteraUiState())
    val state: StateFlow<UnirseCarteraUiState> = _state.asStateFlow()

    private val _eventos = Channel<UnirseCarteraEvento>(Channel.BUFFERED)
    val eventos: Flow<UnirseCarteraEvento> = _eventos.receiveAsFlow()

    fun onCodigoChange(valor: String) {
        val codigo = valor.uppercase().filter { it.isLetterOrDigit() }.take(8)
        _state.update { it.copy(codigo = codigo, error = null) }
    }

    fun onCodigoEscaneado(contenido: String) {
        val codigo = extraerCodigoInvitacion(contenido)
        if (codigo == null) {
            _state.update {
                it.copy(error = "No se pudo leer el QR. Intenta de nuevo.")
            }
            return
        }
        _state.update { it.copy(codigo = codigo, error = null) }
        unirse()
    }

    fun onErrorEscaner() {
        _state.update { it.copy(error = "No se pudo leer el QR. Intenta de nuevo.") }
    }

    fun unirse() {
        val actual = _state.value
        if (actual.cargando) return

        if (actual.codigo.length != 8) {
            _state.update {
                it.copy(error = "Ingresa un código válido de 8 caracteres.")
            }
            return
        }

        _state.update { it.copy(cargando = true, error = null) }
        viewModelScope.launch {
            invitacionesRepository.unirse(actual.codigo)
                .onSuccess {
                    _state.update { it.copy(cargando = false) }
                    _eventos.trySend(UnirseCarteraEvento.Unido)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            error = mensajeErrorApi(
                                error,
                                "No se pudo unir a la cartera."
                            )
                        )
                    }
                }
        }
    }
}

data class UnirseCarteraUiState(
    val codigo: String = "",
    val cargando: Boolean = false,
    val error: String? = null
)

sealed interface UnirseCarteraEvento {
    data object Unido : UnirseCarteraEvento
}

fun extraerCodigoInvitacion(contenido: String): String? {
    val limpio = contenido.trim()
    if (limpio.isEmpty()) return null

    val prefijo = "finanzapp://invitacion/"
    val base = if (limpio.startsWith(prefijo)) limpio.removePrefix(prefijo) else limpio
    val codigo = base.takeWhile { it.isLetterOrDigit() }.uppercase()
    return codigo.takeIf { it.length == 8 }
}
