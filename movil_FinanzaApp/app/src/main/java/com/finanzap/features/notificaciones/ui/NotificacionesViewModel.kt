package com.finanzap.features.notificaciones.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.notificaciones.data.Notificacion
import com.finanzap.features.notificaciones.data.NotificacionesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@HiltViewModel
class NotificacionesViewModel @Inject constructor(
    private val repository: NotificacionesRepository
) : ViewModel() {

    private val _state = MutableStateFlow(NotificacionesUiState())
    val state: StateFlow<NotificacionesUiState> = _state.asStateFlow()

    fun cargar() {
        if (_state.value.cargando) return
        cargarPagina(1)
    }

    fun siguiente() {
        val actual = _state.value
        if (actual.pagina < actual.totalPaginas) cargarPagina(actual.pagina + 1)
    }

    fun anterior() {
        val actual = _state.value
        if (actual.pagina > 1) cargarPagina(actual.pagina - 1)
    }

    fun marcarLeida(notificacion: Notificacion) {
        if (notificacion.leida || _state.value.operando) return

        _state.update { it.copy(operando = true, error = null) }
        viewModelScope.launch {
            repository.marcarLeida(notificacion.id)
                .onSuccess {
                    _state.update { actual ->
                        actual.copy(
                            operando = false,
                            notificaciones = actual.notificaciones.map {
                                if (it.id == notificacion.id) it.copy(leida = true) else it
                            },
                            noLeidas = (actual.noLeidas - 1).coerceAtLeast(0)
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            operando = false,
                            error = mensajeErrorApi(
                                error,
                                "No se pudo marcar la notificación como leída."
                            )
                        )
                    }
                }
        }
    }

    fun marcarTodasLeidas() {
        if (_state.value.operando || _state.value.noLeidas == 0) return

        _state.update { it.copy(operando = true, error = null) }
        viewModelScope.launch {
            repository.marcarTodasLeidas()
                .onSuccess {
                    _state.update { actual ->
                        actual.copy(
                            operando = false,
                            noLeidas = 0,
                            notificaciones = actual.notificaciones.map {
                                it.copy(leida = true)
                            }
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            operando = false,
                            error = mensajeErrorApi(
                                error,
                                "No se pudieron marcar las notificaciones."
                            )
                        )
                    }
                }
        }
    }

    private fun cargarPagina(pagina: Int) {
        _state.update { it.copy(cargando = true, error = null) }
        viewModelScope.launch {
            repository.listar(pagina)
                .onSuccess { listado ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            notificaciones = listado.notificaciones,
                            noLeidas = listado.noLeidas,
                            pagina = listado.pagina,
                            totalPaginas = listado.totalPaginas.coerceAtLeast(1)
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            error = mensajeErrorApi(
                                error,
                                "No se pudieron cargar las notificaciones."
                            )
                        )
                    }
                }
        }
    }
}

data class NotificacionesUiState(
    val cargando: Boolean = false,
    val error: String? = null,
    val notificaciones: List<Notificacion> = emptyList(),
    val noLeidas: Int = 0,
    val pagina: Int = 1,
    val totalPaginas: Int = 1,
    val operando: Boolean = false
)
