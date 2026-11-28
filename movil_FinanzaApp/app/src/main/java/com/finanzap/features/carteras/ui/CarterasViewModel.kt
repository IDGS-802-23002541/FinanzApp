package com.finanzap.features.carteras.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.carteras.Cartera
import com.finanzap.features.carteras.RolEnCartera
import com.finanzap.features.carteras.TipoCartera
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

    fun cargar() {
        if (_state.value.cargando) return
        _state.update { it.copy(cargando = true, error = null) }
        viewModelScope.launch {
            // El backend filtra por un solo estado, así que se consultan los tres.
            val todas = mutableListOf<Cartera>()
            var error: String? = null
            for (estado in listOf("ACTIVA", "ARCHIVADA", "FINALIZADA")) {
                carterasRepository.carterasConFiltros(estado, null, null, null)
                    .onSuccess { todas += it }
                    .onFailure { error = "No se pudieron cargar tus carteras." }
            }

            if (error != null && todas.isEmpty()) {
                _state.update { it.copy(cargando = false, error = error) }
                return@launch
            }

            misCarteras = todas.distinctBy { it.id }.filter { it.rol == RolEnCartera.PROPIETARIO }
            compartidas = todas.distinctBy { it.id }.filter { it.rol == RolEnCartera.COLABORADOR }
            _state.update {
                it.copy(
                    cargando = false,
                    totalMis = misCarteras.size,
                    totalCompartidas = compartidas.size
                )
            }
            actualizarLista()
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

    fun onEstadoChange(estado: EstadoCartera) {
        _state.update { it.copy(estado = estado) }
        actualizarLista()
    }

    fun onBusquedaChange(busqueda: String) {
        _state.update { it.copy(busqueda = busqueda) }
        actualizarLista()
    }

    private fun actualizarLista() {
        val actual = _state.value
        val base = if (actual.segmento == Segmento.MIS) misCarteras else compartidas

        // Los contadores reflejan el estado elegido para que coincidan con la lista.
        val delEstado = base.filter { actual.estado.coincide(it.estado) }
        val filtradas = delEstado
            .filter { actual.tipo == null || it.tipo == actual.tipo }
            .filter {
                actual.busqueda.isBlank() ||
                    it.nombre.contains(actual.busqueda.trim(), ignoreCase = true)
            }

        _state.update {
            it.copy(
                carteras = filtradas,
                totalMis = misCarteras.count { c -> actual.estado.coincide(c.estado) },
                totalCompartidas = compartidas.count { c -> actual.estado.coincide(c.estado) }
            )
        }
    }
}

enum class Segmento {
    MIS,
    COMPARTIDAS
}

enum class EstadoCartera {
    ACTIVAS,
    INACTIVAS,
    FINALIZADAS,
    TODAS;

    /** El backend llama "ARCHIVADA" a la cartera inactiva. */
    fun coincide(estadoCartera: String): Boolean = when (this) {
        ACTIVAS -> estadoCartera == "ACTIVA"
        INACTIVAS -> estadoCartera == "ARCHIVADA"
        FINALIZADAS -> estadoCartera == "FINALIZADA"
        TODAS -> true
    }
}

data class CarterasUiState(
    val cargando: Boolean = false,
    val error: String? = null,
    val segmento: Segmento = Segmento.MIS,
    val tipo: TipoCartera? = null,
    val estado: EstadoCartera = EstadoCartera.ACTIVAS,
    val busqueda: String = "",
    val carteras: List<Cartera> = emptyList(),
    val totalMis: Int = 0,
    val totalCompartidas: Int = 0
)
