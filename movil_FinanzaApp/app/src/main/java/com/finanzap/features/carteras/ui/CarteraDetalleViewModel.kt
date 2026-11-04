package com.finanzap.features.carteras.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.carteras.Cartera
import com.finanzap.features.carteras.data.CarterasRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@HiltViewModel
class CarteraDetalleViewModel @Inject constructor(
    private val carterasRepository: CarterasRepository
) : ViewModel() {

    private val _state = MutableStateFlow(CarteraDetalleUiState())
    val state: StateFlow<CarteraDetalleUiState> = _state.asStateFlow()

    fun cargar(idCartera: Int) {
        if (_state.value.cargando) return

        _state.update { it.copy(cargando = true, error = null) }
        viewModelScope.launch {
            carterasRepository.detalle(idCartera)
                .onSuccess { cartera ->
                    _state.update { it.copy(cargando = false, cartera = cartera) }
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
    }
}

data class CarteraDetalleUiState(
    val cargando: Boolean = false,
    val error: String? = null,
    val cartera: Cartera? = null
)
