package com.finanzap.features.carteras.ui.dashboard

import androidx.lifecycle.ViewModel
import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.carteras.model.Cartera
import com.finanzap.features.carteras.model.TipoCartera
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

@HiltViewModel
class CarterasViewModel @Inject constructor(
    carterasRepository: CarterasRepository
) : ViewModel() {

    private val misCarteras = carterasRepository.misCarteras()
    private val compartidas = carterasRepository.carterasCompartidas()

    private val _state = MutableStateFlow(
        CarterasUiState(
            carteras = misCarteras,
            totalMis = misCarteras.size,
            totalCompartidas = compartidas.size
        )
    )
    val state: StateFlow<CarterasUiState> = _state.asStateFlow()

    fun onSegmentoChange(segmento: Segmento) {
        _state.value = _state.value.copy(segmento = segmento)
        actualizarLista()
    }

    fun onTipoChange(tipo: TipoCartera?) {
        _state.value = _state.value.copy(tipo = tipo)
        actualizarLista()
    }

    fun onBusquedaChange(busqueda: String) {
        _state.value = _state.value.copy(busqueda = busqueda)
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

        _state.value = actual.copy(carteras = filtradas)
    }
}
