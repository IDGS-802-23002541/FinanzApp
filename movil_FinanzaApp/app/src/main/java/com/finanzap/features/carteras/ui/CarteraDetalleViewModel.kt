package com.finanzap.features.carteras.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.carteras.Cartera
import com.finanzap.features.carteras.ColaboradorCartera
import com.finanzap.features.carteras.IngresoInvitacion
import com.finanzap.features.carteras.Invitacion
import com.finanzap.features.carteras.PeriodoCartera
import com.finanzap.features.carteras.RolEnCartera
import com.finanzap.features.carteras.ResumenCartera
import com.finanzap.features.carteras.SeriesCartera
import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.carteras.data.InvitacionesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@HiltViewModel
class CarteraDetalleViewModel @Inject constructor(
    private val carterasRepository: CarterasRepository,
    private val invitacionesRepository: InvitacionesRepository
) : ViewModel() {

    private val _state = MutableStateFlow(CarteraDetalleUiState())
    val state: StateFlow<CarteraDetalleUiState> = _state.asStateFlow()

    fun cargar(idCartera: Int) {
        if (_state.value.cargando) return

        _state.update { it.copy(cargando = true, error = null, errorPeriodos = null) }
        viewModelScope.launch {
            carterasRepository.detalle(idCartera, _state.value.periodoSeleccionadoId)
                .onSuccess { detalle ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            cartera = detalle.cartera,
                            resumen = detalle.resumen,
                            series = detalle.series,
                            colaboradores = detalle.colaboradores
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            error = mensajeErrorApi(error, "No se pudo cargar la cartera.")
                        )
                    }
                }
        }
        viewModelScope.launch {
            carterasRepository.periodos(idCartera)
                .onSuccess { periodos ->
                    _state.update { it.copy(periodos = periodos) }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            errorPeriodos = mensajeErrorApi(
                                error,
                                "No se pudieron cargar los periodos."
                            )
                        )
                    }
                }
        }
    }

    fun seleccionarPeriodo(idCartera: Int, periodoId: Int?) {
        if (_state.value.cargando || _state.value.periodoSeleccionadoId == periodoId) return

        _state.update { it.copy(periodoSeleccionadoId = periodoId) }
        cargar(idCartera)
    }

    fun refrescarInvitacion(idCartera: Int) {
        val cartera = _state.value.cartera ?: return
        if (cartera.rol == RolEnCartera.PROPIETARIO && cartera.estado == "ACTIVA") {
            cargarInvitacion(idCartera)
        }
    }

    fun cargarInvitacion(idCartera: Int) {
        if (_state.value.cargandoInvitacion) return

        _state.update { it.copy(cargandoInvitacion = true, errorInvitacion = null) }
        viewModelScope.launch {
            invitacionesRepository.consultar(idCartera)
                .onSuccess { datos ->
                    _state.update {
                        it.copy(
                            cargandoInvitacion = false,
                            invitacion = datos.invitacion,
                            ingresos = datos.ingresos
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            cargandoInvitacion = false,
                            errorInvitacion = mensajeErrorApi(
                                error,
                                "No se pudo cargar la invitación."
                            )
                        )
                    }
                }
        }
    }

    fun generarInvitacion(idCartera: Int) {
        if (_state.value.cargandoInvitacion) return

        _state.update { it.copy(cargandoInvitacion = true, errorInvitacion = null) }
        viewModelScope.launch {
            invitacionesRepository.generar(idCartera)
                .onSuccess { invitacion ->
                    _state.update {
                        it.copy(cargandoInvitacion = false, invitacion = invitacion)
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            cargandoInvitacion = false,
                            errorInvitacion = mensajeErrorApi(
                                error,
                                "No se pudo generar la invitación."
                            )
                        )
                    }
                }
        }
    }

    fun salir(idCartera: Int) {
        if (_state.value.saliendo) return

        _state.update { it.copy(saliendo = true, errorSalir = null) }
        viewModelScope.launch {
            carterasRepository.salir(idCartera)
                .onSuccess {
                    _state.update { it.copy(saliendo = false, salidaExitosa = true) }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            saliendo = false,
                            errorSalir = mensajeErrorApi(error, "No se pudo salir de la cartera.")
                        )
                    }
                }
        }
    }
}

data class CarteraDetalleUiState(
    val cargando: Boolean = false,
    val error: String? = null,
    val cartera: Cartera? = null,
    val resumen: ResumenCartera? = null,
    val series: SeriesCartera? = null,
    val colaboradores: List<ColaboradorCartera> = emptyList(),
    val periodos: List<PeriodoCartera> = emptyList(),
    val periodoSeleccionadoId: Int? = null,
    val errorPeriodos: String? = null,
    val cargandoInvitacion: Boolean = false,
    val errorInvitacion: String? = null,
    val invitacion: Invitacion? = null,
    val ingresos: List<IngresoInvitacion> = emptyList(),
    val saliendo: Boolean = false,
    val errorSalir: String? = null,
    val salidaExitosa: Boolean = false
)
