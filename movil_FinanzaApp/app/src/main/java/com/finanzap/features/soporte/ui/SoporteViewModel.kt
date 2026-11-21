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
                ticketEditandoId = null,
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

    fun abrirEdicion(ticket: Ticket) {
        _state.update {
            it.copy(
                formularioAbierto = true,
                ticketEditandoId = ticket.idTicket,
                asunto = ticket.asunto,
                descripcion = ticket.descripcion,
                categoria = ticket.categoria,
                prioridad = ticket.prioridad,
                errorAsunto = null,
                errorDescripcion = null,
                errorFormulario = null
            )
        }
    }

    fun cerrarFormulario() {
        _state.update {
            it.copy(
                formularioAbierto = false,
                ticketEditandoId = null,
                errorFormulario = null
            )
        }
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

    fun guardarFormulario() {
        if (_state.value.ticketEditandoId != null) {
            guardarEdicion()
        } else {
            crearTicket()
        }
    }

    fun crearTicket() {
        val actual = _state.value
        if (actual.guardando) return

        val asunto = actual.asunto.trim()
        val descripcion = actual.descripcion.trim()
        val (errorAsunto, errorDescripcion) = validarFormulario(
            asunto,
            descripcion
        )
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

    private fun guardarEdicion() {
        val actual = _state.value
        val idTicket = actual.ticketEditandoId ?: return
        if (actual.guardando) return

        val asunto = actual.asunto.trim()
        val descripcion = actual.descripcion.trim()
        val (errorAsunto, errorDescripcion) = validarFormulario(
            asunto,
            descripcion
        )
        if (errorAsunto != null || errorDescripcion != null) {
            _state.update {
                it.copy(
                    errorAsunto = errorAsunto,
                    errorDescripcion = errorDescripcion
                )
            }
            return
        }

        _state.update { it.copy(guardando = true, errorFormulario = null) }
        viewModelScope.launch {
            soporteRepository.actualizarTicket(
                idTicket = idTicket,
                asunto = asunto,
                descripcion = descripcion,
                categoria = actual.categoria,
                prioridad = actual.prioridad
            )
                .onSuccess {
                    _state.update {
                        it.copy(
                            guardando = false,
                            formularioAbierto = false,
                            ticketEditandoId = null
                        )
                    }
                    cargarPagina(_state.value.pagina)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            guardando = false,
                            errorFormulario = mensajeErrorApi(
                                error,
                                "No se pudo actualizar el reporte."
                            )
                        )
                    }
                }
        }
    }

    fun pedirEliminar(idTicket: Int) {
        _state.update {
            it.copy(ticketEliminandoId = idTicket, errorEliminar = null)
        }
    }

    fun cancelarEliminar() {
        _state.update {
            it.copy(ticketEliminandoId = null, errorEliminar = null)
        }
    }

    fun confirmarEliminar() {
        val actual = _state.value
        val idTicket = actual.ticketEliminandoId ?: return
        if (actual.eliminando) return

        _state.update { it.copy(eliminando = true, errorEliminar = null) }
        viewModelScope.launch {
            soporteRepository.eliminarTicket(idTicket)
                .onSuccess {
                    _state.update {
                        it.copy(
                            eliminando = false,
                            ticketEliminandoId = null
                        )
                    }
                    val pagina = if (
                        _state.value.tickets.size <= 1 &&
                        _state.value.pagina > 1
                    ) {
                        _state.value.pagina - 1
                    } else {
                        _state.value.pagina
                    }
                    cargarPagina(pagina)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            eliminando = false,
                            errorEliminar = mensajeErrorApi(
                                error,
                                "No se pudo eliminar el reporte."
                            )
                        )
                    }
                }
        }
    }

    private fun validarFormulario(
        asunto: String,
        descripcion: String
    ): Pair<String?, String?> {
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
        return errorAsunto to errorDescripcion
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
    val ticketEditandoId: Int? = null,
    val asunto: String = "",
    val descripcion: String = "",
    val categoria: String = "GENERAL",
    val prioridad: String = "MEDIA",
    val errorAsunto: String? = null,
    val errorDescripcion: String? = null,
    val errorFormulario: String? = null,
    val guardando: Boolean = false,
    val ticketEliminandoId: Int? = null,
    val errorEliminar: String? = null,
    val eliminando: Boolean = false
)
