package com.finanzap.features.carteras.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.carteras.model.Cartera
import com.finanzap.features.carteras.model.RolEnCartera
import com.finanzap.features.carteras.model.TipoCartera
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CarterasViewModel @Inject constructor(
    private val carterasRepository: CarterasRepository
) : ViewModel() {

    private var misCarteras: List<Cartera> = emptyList()
    private var compartidas: List<Cartera> = emptyList()

    private val _state = MutableStateFlow(CarterasUiState())
    val state: StateFlow<CarterasUiState> = _state.asStateFlow()

    init {
        cargar()
    }

    fun cargar() {
        _state.update { it.copy(cargando = true, error = null) }
        viewModelScope.launch {
            carterasRepository.carteras()
                .onSuccess { todas ->
                    misCarteras = todas.filter { it.rol == RolEnCartera.PROPIETARIO }
                    compartidas = todas.filter { it.rol == RolEnCartera.COLABORADOR }
                    _state.update {
                        it.copy(
                            cargando = false,
                            totalMis = misCarteras.size,
                            totalCompartidas = compartidas.size
                        )
                    }
                    actualizarLista()
                }
                .onFailure {
                    _state.update {
                        it.copy(cargando = false, error = "No se pudieron cargar tus carteras.")
                    }
                }
        }
    }

    fun onSegmentoChange(segmento: Segmento) {
        _state.update { it.copy(segmento = segmento) }
        actualizarLista()
    }

    fun onTipoChange(tipo: TipoCartera?) {
        _state.update { it.copy(tipo = tipo) }
        actualizarLista()
    }

    fun onBusquedaChange(busqueda: String) {
        _state.update { it.copy(busqueda = busqueda) }
        actualizarLista()
    }

    private fun actualizarLista() {
        val actual = _state.value
        val base = if (actual.segmento == Segmento.MIS) misCarteras else compartidas

        val filtradas = base
            .filter { actual.tipo == null || it.tipo == actual.tipo }
            .filter {
                actual.busqueda.isBlank() ||
                    it.nombre.contains(actual.busqueda.trim(), ignoreCase = true)
            }

        _state.update { it.copy(carteras = filtradas) }
    }
}
