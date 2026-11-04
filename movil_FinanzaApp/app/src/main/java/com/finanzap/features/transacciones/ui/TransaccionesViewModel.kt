package com.finanzap.features.transacciones.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.transacciones.Transaccion
import com.finanzap.features.transacciones.data.TransaccionesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@HiltViewModel
class TransaccionesViewModel @Inject constructor(
    private val transaccionesRepository: TransaccionesRepository
) : ViewModel() {

    private val _state = MutableStateFlow(TransaccionesUiState())
    val state: StateFlow<TransaccionesUiState> = _state.asStateFlow()

    fun cargar(idCartera: Int) {
        if (_state.value.cargando) return
        _state.update { it.copy(idCartera = idCartera) }
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

    fun reintentar() {
        cargarPagina(_state.value.pagina.coerceAtLeast(1))
    }

    private fun cargarPagina(pagina: Int) {
        val actual = _state.value
        if (actual.idCartera == 0 || actual.cargando) return

        _state.update { it.copy(cargando = true, error = null) }
        viewModelScope.launch {
            transaccionesRepository.listar(
                idCartera = actual.idCartera,
                pagina = pagina,
                porPagina = POR_PAGINA
            )
                .onSuccess { resultado ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            pagina = resultado.pagina,
                            totalPaginas = resultado.totalPaginas.coerceAtLeast(1),
                            total = resultado.total,
                            transacciones = resultado.items,
                            totalIngresos = resultado.totalIngresos,
                            totalGastos = resultado.totalGastos,
                            balance = resultado.balance
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            error = mensajeErrorApi(
                                error,
                                "No se pudieron cargar las transacciones."
                            )
                        )
                    }
                }
        }
    }

    private companion object {
        const val POR_PAGINA = 20
    }
}

data class TransaccionesUiState(
    val cargando: Boolean = false,
    val error: String? = null,
    val idCartera: Int = 0,
    val pagina: Int = 1,
    val totalPaginas: Int = 0,
    val total: Int = 0,
    val transacciones: List<Transaccion> = emptyList(),
    val totalIngresos: Double = 0.0,
    val totalGastos: Double = 0.0,
    val balance: Double = 0.0
)
