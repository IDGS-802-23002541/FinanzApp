package com.finanzap.features.soporte.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.soporte.data.SoporteRepository
import com.finanzap.features.soporte.data.Ticket
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@HiltViewModel
class SoporteViewModel @Inject constructor(
    private val soporteRepository: SoporteRepository
) : ViewModel() {

    private val _state = MutableStateFlow(SoporteUiState())
    val state: StateFlow<SoporteUiState> = _state.asStateFlow()

    fun cargar() {
        cargarPagina(_state.value.pagina)
    }

    fun siguiente() {
        val actual = _state.value
        if (actual.pagina < actual.totalPaginas) cargarPagina(actual.pagina + 1)
    }

    fun anterior() {
        val actual = _state.value
        if (actual.pagina > 1) cargarPagina(actual.pagina - 1)
    }

    fun abrirFormulario() {
        _state.update {
            it.copy(
                formularioAbierto = true,
                asunto = "",
                descripcion = "",
                categoria = "GENERAL",
                prioridad = "MEDIA",
                errorAsunto = null,
                errorDescripcion = null,
                errorFormulario = null
            )
        }
    }

    fun cerrarFormulario() {
        _state.update { it.copy(formularioAbierto = false, errorFormulario = null) }
    }

    fun onAsuntoChange(asunto: String) {
        _state.update { it.copy(asunto = asunto, errorAsunto = null, errorFormulario = null) }
    }

    fun onDescripcionChange(descripcion: String) {
        _state.update {
            it.copy(descripcion = descripcion, errorDescripcion = null, errorFormulario = null)
        }
    }

    fun onCategoriaChange(categoria: String) {
        _state.update { it.copy(categoria = categoria) }
    }

    fun onPrioridadChange(prioridad: String) {
        _state.update { it.copy(prioridad = prioridad) }
    }

    fun crearTicket() {
        val actual = _state.value
        if (actual.guardando) return

        val asunto = actual.asunto.trim()
        val descripcion = actual.descripcion.trim()
        val errorAsunto = when {
            asunto.isBlank() -> "Escribe el asunto."
            asunto.length > 150 -> "El asunto admite hasta 150 caracteres."
            else -> null
        }
        val errorDescripcion = when {
            descripcion.isBlank() -> "Escribe la descripción."
            descripcion.length > 3000 -> "La descripción admite hasta 3000 caracteres."
            else -> null
        }
        if (errorAsunto != null || errorDescripcion != null) {
            _state.update {
                it.copy(errorAsunto = errorAsunto, errorDescripcion = errorDescripcion)
            }
            return
        }

        _state.update { it.copy(guardando = true, errorFormulario = null) }
        viewModelScope.launch {
            soporteRepository.crearTicket(
                asunto = asunto,
                descripcion = descripcion,
                categoria = actual.categoria,
                prioridad = actual.prioridad
            )
                .onSuccess {
                    _state.update { it.copy(guardando = false, formularioAbierto = false) }
                    cargarPagina(1)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            guardando = false,
                            errorFormulario = mensajeErrorApi(
                                error,
                                "No se pudo enviar el reporte."
                            )
                        )
                    }
                }
        }
    }

    fun abrirRespuesta(idTicket: Int) {
        _state.update {
            it.copy(
                ticketRespondiendoId = idTicket,
                mensajeRespuesta = "",
                errorRespuesta = null
            )
        }
    }

    fun cerrarRespuesta() {
        _state.update {
            it.copy(ticketRespondiendoId = null, mensajeRespuesta = "", errorRespuesta = null)
        }
    }

    fun onMensajeRespuestaChange(mensaje: String) {
        _state.update { it.copy(mensajeRespuesta = mensaje, errorRespuesta = null) }
    }

    fun enviarRespuesta() {
        val actual = _state.value
        val idTicket = actual.ticketRespondiendoId ?: return
        if (actual.respondiendo) return

        val mensaje = actual.mensajeRespuesta.trim()
        if (mensaje.isBlank()) {
            _state.update { it.copy(errorRespuesta = "Escribe el mensaje.") }
            return
        }
        if (mensaje.length > 3000) {
            _state.update {
                it.copy(errorRespuesta = "El mensaje admite hasta 3000 caracteres.")
            }
            return
        }

        _state.update { it.copy(respondiendo = true, errorRespuesta = null) }
        viewModelScope.launch {
            soporteRepository.responderTicket(idTicket, mensaje)
                .onSuccess {
                    _state.update {
                        it.copy(
                            respondiendo = false,
                            ticketRespondiendoId = null,
                            mensajeRespuesta = ""
                        )
                    }
                    cargarPagina(_state.value.pagina)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            respondiendo = false,
                            errorRespuesta = mensajeErrorApi(
                                error,
                                "No se pudo enviar la respuesta."
                            )
                        )
                    }
                }
        }
    }

    private fun cargarPagina(pagina: Int) {
        if (_state.value.cargando) return
        _state.update { it.copy(cargando = true, error = null) }
        viewModelScope.launch {
            soporteRepository.listarTickets(pagina = pagina)
                .onSuccess { listado ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            tickets = listado.tickets,
                            pagina = listado.paginacion.pagina,
                            totalPaginas = listado.paginacion.totalPaginas
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            error = mensajeErrorApi(
                                error,
                                "No se pudieron cargar los reportes."
                            )
                        )
                    }
                }
        }
    }
}

data class SoporteUiState(
    val cargando: Boolean = false,
    val error: String? = null,
    val tickets: List<Ticket> = emptyList(),
    val pagina: Int = 1,
    val totalPaginas: Int = 0,
    val formularioAbierto: Boolean = false,
    val asunto: String = "",
    val descripcion: String = "",
    val categoria: String = "GENERAL",
    val prioridad: String = "MEDIA",
    val errorAsunto: String? = null,
    val errorDescripcion: String? = null,
    val errorFormulario: String? = null,
    val guardando: Boolean = false,
    val ticketRespondiendoId: Int? = null,
    val mensajeRespuesta: String = "",
    val errorRespuesta: String? = null,
    val respondiendo: Boolean = false
)
