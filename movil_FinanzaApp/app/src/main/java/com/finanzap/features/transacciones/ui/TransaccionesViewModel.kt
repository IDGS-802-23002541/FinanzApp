package com.finanzap.features.transacciones.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.carteras.PeriodoCartera
import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.transacciones.TipoTransaccion
import com.finanzap.features.transacciones.Transaccion
import com.finanzap.features.transacciones.data.TransaccionesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@HiltViewModel
class TransaccionesViewModel @Inject constructor(
    private val transaccionesRepository: TransaccionesRepository,
    private val carterasRepository: CarterasRepository
) : ViewModel() {

    private val _state = MutableStateFlow(TransaccionesUiState())
    val state: StateFlow<TransaccionesUiState> = _state.asStateFlow()

    private val _eventos = Channel<TransaccionesEvento>(Channel.BUFFERED)
    val eventos: Flow<TransaccionesEvento> = _eventos.receiveAsFlow()

    fun cargar(idCartera: Int) {
        if (_state.value.cargando) return
        _state.update { it.copy(idCartera = idCartera) }
        cargarPeriodos(idCartera)
        cargarPagina(1)
    }

    fun seleccionarPeriodo(periodoId: Int?) {
        if (_state.value.periodoSeleccionadoId == periodoId) return

        _state.update { it.copy(periodoSeleccionadoId = periodoId) }
        cargarPagina(1)
    }

    private fun cargarPeriodos(idCartera: Int) {
        viewModelScope.launch {
            carterasRepository.periodos(idCartera)
                .onSuccess { periodos ->
                    _state.update { it.copy(periodos = periodos, errorPeriodos = null) }
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

    fun actualizar(
        idTransaccion: Int,
        tipo: TipoTransaccion,
        monto: Double,
        fecha: String,
        categoriaId: Int?,
        descripcion: String?
    ) {
        val actual = _state.value
        if (actual.operando) return

        _state.update { it.copy(operando = true, errorOperacion = null) }
        viewModelScope.launch {
            transaccionesRepository.actualizar(
                idTransaccion = idTransaccion,
                tipo = tipo,
                monto = monto,
                fecha = fecha,
                categoriaId = categoriaId,
                descripcion = descripcion
            )
                .onSuccess {
                    _state.update { it.copy(operando = false) }
                    _eventos.trySend(TransaccionesEvento.Actualizada)
                    cargarPagina(_state.value.pagina)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            operando = false,
                            errorOperacion = mensajeErrorApi(
                                error,
                                "No se pudo actualizar la transacción."
                            )
                        )
                    }
                }
        }
    }

    fun eliminar(idTransaccion: Int) {
        val actual = _state.value
        if (actual.operando) return

        _state.update { it.copy(operando = true, errorOperacion = null) }
        viewModelScope.launch {
            transaccionesRepository.eliminar(idTransaccion)
                .onSuccess {
                    _state.update { it.copy(operando = false) }
                    _eventos.trySend(TransaccionesEvento.Eliminada)
                    cargarPagina(_state.value.pagina)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            operando = false,
                            errorOperacion = mensajeErrorApi(
                                error,
                                "No se pudo eliminar la transacción."
                            )
                        )
                    }
                }
        }
    }

    private fun cargarPagina(pagina: Int) {
        val actual = _state.value
        if (actual.idCartera == 0 || actual.cargando) return

        _state.update { it.copy(cargando = true, error = null) }
        viewModelScope.launch {
            transaccionesRepository.listar(
                idCartera = actual.idCartera,
                pagina = pagina,
                porPagina = POR_PAGINA,
                periodoId = actual.periodoSeleccionadoId
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
    val operando: Boolean = false,
    val errorOperacion: String? = null,
    val idCartera: Int = 0,
    val pagina: Int = 1,
    val totalPaginas: Int = 0,
    val total: Int = 0,
    val transacciones: List<Transaccion> = emptyList(),
    val periodos: List<PeriodoCartera> = emptyList(),
    val periodoSeleccionadoId: Int? = null,
    val errorPeriodos: String? = null,
    val totalIngresos: Double = 0.0,
    val totalGastos: Double = 0.0,
    val balance: Double = 0.0
)

sealed interface TransaccionesEvento {
    data object Actualizada : TransaccionesEvento
    data object Eliminada : TransaccionesEvento
}
