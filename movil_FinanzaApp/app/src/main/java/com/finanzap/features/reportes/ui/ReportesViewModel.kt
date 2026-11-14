package com.finanzap.features.reportes.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.carteras.Cartera
import com.finanzap.features.carteras.PeriodoCartera
import com.finanzap.features.carteras.TipoCartera
import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.reportes.data.FormatoReporte
import com.finanzap.features.reportes.data.FiltrosReporte
import com.finanzap.features.reportes.data.Reporte
import com.finanzap.features.reportes.data.ReportesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@HiltViewModel
class ReportesViewModel @Inject constructor(
    private val reportesRepository: ReportesRepository,
    private val carterasRepository: CarterasRepository
) : ViewModel() {

    private val _state = MutableStateFlow(ReportesUiState())
    val state: StateFlow<ReportesUiState> = _state.asStateFlow()

    init {
        viewModelScope.launch { cargarCarteras() }
    }

    fun cargar() {
        if (_state.value.cargando) return
        _state.update { it.copy(cargando = true, error = null) }
        viewModelScope.launch {
            reportesRepository.vistaPrevia(filtros())
                .onSuccess { reporte ->
                    _state.update { it.copy(cargando = false, reporte = reporte) }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            error = mensajeErrorApi(
                                error,
                                "No se pudo generar la vista previa del reporte."
                            )
                        )
                    }
                }
        }
    }

    fun seleccionarCartera(idCartera: Int?) {
        _state.update {
            it.copy(carteraId = idCartera, periodoId = null, periodos = emptyList())
        }
        if (idCartera == null) return

        viewModelScope.launch {
            carterasRepository.periodos(idCartera)
                .onSuccess { periodos ->
                    _state.update { it.copy(periodos = periodos) }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            errorFiltros = mensajeErrorApi(
                                error,
                                "No se pudieron cargar los periodos."
                            )
                        )
                    }
                }
        }
    }

    fun seleccionarTipo(tipo: TipoCartera?) {
        _state.update { it.copy(tipo = tipo) }
    }

    fun seleccionarPeriodo(periodoId: Int?) {
        _state.update { it.copy(periodoId = periodoId) }
    }

    fun elegirFechas(fechaInicio: String?, fechaFin: String?) {
        _state.update { it.copy(fechaInicio = fechaInicio, fechaFin = fechaFin) }
    }

    fun exportar(formato: FormatoReporte) {
        if (_state.value.exportando) return
        _state.update {
            it.copy(exportando = true, errorExportacion = null, archivoGenerado = null)
        }
        viewModelScope.launch {
            reportesRepository.exportar(filtros(), formato)
                .onSuccess { ruta ->
                    _state.update { it.copy(exportando = false, archivoGenerado = ruta) }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            exportando = false,
                            errorExportacion = mensajeErrorApi(
                                error,
                                "No se pudo generar el archivo del reporte."
                            )
                        )
                    }
                }
        }
    }

    // Los reportes solo incluyen las carteras propias, activas o finalizadas.
    private suspend fun cargarCarteras() {
        val propias = mutableListOf<Cartera>()
        var error: String? = null
        for (estado in listOf("ACTIVA", "FINALIZADA")) {
            carterasRepository.carterasConFiltros(estado, null, "PROPIETARIO", null)
                .onSuccess { propias += it }
                .onFailure {
                    error = mensajeErrorApi(it, "No se pudieron cargar tus carteras.")
                }
        }
        _state.update { it.copy(carteras = propias, errorFiltros = error) }
    }

    private fun filtros() = FiltrosReporte(
        carteraId = _state.value.carteraId,
        tipo = _state.value.tipo?.name,
        periodoId = _state.value.periodoId,
        fechaInicio = _state.value.fechaInicio,
        fechaFin = _state.value.fechaFin
    )
}

data class ReportesUiState(
    val cargando: Boolean = false,
    val error: String? = null,
    val errorFiltros: String? = null,
    val carteras: List<Cartera> = emptyList(),
    val carteraId: Int? = null,
    val tipo: TipoCartera? = null,
    val periodos: List<PeriodoCartera> = emptyList(),
    val periodoId: Int? = null,
    val fechaInicio: String? = null,
    val fechaFin: String? = null,
    val reporte: Reporte? = null,
    val exportando: Boolean = false,
    val errorExportacion: String? = null,
    val archivoGenerado: String? = null
)
