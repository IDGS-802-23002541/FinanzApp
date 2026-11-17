package com.finanzap.features.transacciones.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.fechaIsoDesdeMillis
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.transacciones.Categoria
import com.finanzap.features.transacciones.TipoTransaccion
import com.finanzap.features.transacciones.data.CategoriasRepository
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
class RegistrarTransaccionViewModel @Inject constructor(
    private val transaccionesRepository: TransaccionesRepository,
    private val categoriasRepository: CategoriasRepository
) : ViewModel() {

    private val _state = MutableStateFlow(RegistrarTransaccionUiState())
    val state: StateFlow<RegistrarTransaccionUiState> = _state.asStateFlow()

    private val _eventos = Channel<TransaccionEvento>(Channel.BUFFERED)
    val eventos: Flow<TransaccionEvento> = _eventos.receiveAsFlow()

    fun iniciar(idCartera: Int) {
        if (_state.value.idCartera == idCartera) return
        _state.update {
            it.copy(
                idCartera = idCartera,
                categoria = null,
                errorCategoria = null,
                errorCategorias = null
            )
        }
        cargarCategorias()
    }

    private fun cargarCategorias() {
        val idCartera = _state.value.idCartera
        if (idCartera == 0 || _state.value.cargandoCategorias) return

        _state.update { it.copy(cargandoCategorias = true, errorCategorias = null) }
        viewModelScope.launch {
            categoriasRepository.listar(idCartera)
                .onSuccess { categorias ->
                    _state.update {
                        it.copy(cargandoCategorias = false, categorias = categorias)
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            cargandoCategorias = false,
                            errorCategorias = mensajeErrorApi(
                                error,
                                "No se pudieron cargar las categorías."
                            )
                        )
                    }
                }
        }
    }

    fun onTipoChange(tipo: TipoTransaccion) {
        _state.update {
            val categoria = it.categoria?.takeIf { actual ->
                actual.tipo == "AMBOS" || actual.tipo == tipo.name
            }
            it.copy(
                tipo = tipo,
                categoria = categoria,
                errorTipo = null,
                errorCategoria = null,
                errorGeneral = null
            )
        }
    }

    fun onMontoChange(monto: String) {
        _state.update { it.copy(monto = monto, errorMonto = null, errorGeneral = null) }
    }

    fun onFechaChange(fecha: String) {
        _state.update { it.copy(fecha = fecha, errorFecha = null, errorGeneral = null) }
    }

    fun onCategoriaChange(categoria: Categoria) {
        _state.update {
            it.copy(categoria = categoria, errorCategoria = null, errorGeneral = null)
        }
    }

    fun onDescripcionChange(descripcion: String) {
        _state.update {
            it.copy(descripcion = descripcion, errorDescripcion = null, errorGeneral = null)
        }
    }

    fun crearCategoria(nombre: String) {
        val actual = _state.value
        if (actual.idCartera == 0 || actual.creandoCategoria) return

        _state.update { it.copy(creandoCategoria = true, errorCategorias = null) }
        viewModelScope.launch {
            categoriasRepository.crear(actual.idCartera, nombre)
                .onSuccess { categoria ->
                    _state.update {
                        it.copy(
                            creandoCategoria = false,
                            categorias = it.categorias + categoria,
                            categoria = categoria,
                            errorCategoria = null
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            creandoCategoria = false,
                            errorCategorias = mensajeErrorApi(
                                error,
                                "No se pudo crear la categoría."
                            )
                        )
                    }
                }
        }
    }

    fun guardar() {
        val actual = _state.value
        if (actual.guardando) return

        val monto = actual.monto.trim().replace(",", "").toDoubleOrNull()
        val errorTipo = if (actual.tipo == null) "Elige si es ingreso o gasto." else null
        val errorMonto = when {
            actual.monto.isBlank() -> "Ingresa el monto."
            monto == null || monto <= 0.0 -> "Ingresa un monto mayor a 0."
            else -> null
        }
        val errorFecha = if (actual.fecha.isBlank()) "Selecciona la fecha." else null
        val errorDescripcion = if (actual.descripcion.length > 500) {
            "La descripción admite hasta 500 caracteres."
        } else {
            null
        }
        val errorCategoria = if (actual.tipo == TipoTransaccion.GASTO && actual.categoria == null) {
            "Elige o crea una categoría."
        } else {
            null
        }

        if (errorTipo != null || errorMonto != null || errorFecha != null ||
            errorDescripcion != null || errorCategoria != null
        ) {
            _state.update {
                it.copy(
                    errorTipo = errorTipo,
                    errorMonto = errorMonto,
                    errorFecha = errorFecha,
                    errorDescripcion = errorDescripcion,
                    errorCategoria = errorCategoria,
                    errorGeneral = null
                )
            }
            return
        }

        val tipo = actual.tipo ?: return
        viewModelScope.launch {
            _state.update { it.copy(guardando = true, errorGeneral = null) }
            transaccionesRepository.crear(
                idCartera = actual.idCartera,
                tipo = tipo,
                monto = monto ?: 0.0,
                fecha = actual.fecha,
                categoriaId = if (tipo == TipoTransaccion.GASTO) actual.categoria?.id else null,
                descripcion = actual.descripcion
            )
                .onSuccess {
                    _state.update { it.copy(guardando = false) }
                    _eventos.trySend(TransaccionEvento.Guardada)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            guardando = false,
                            errorGeneral = mensajeErrorApi(
                                error,
                                "No se pudo guardar la transacción."
                            )
                        )
                    }
                }
        }
    }
}

data class RegistrarTransaccionUiState(
    val idCartera: Int = 0,
    val tipo: TipoTransaccion? = null,
    val monto: String = "",
    val fecha: String = fechaIsoDesdeMillis(System.currentTimeMillis()),
    val categoria: Categoria? = null,
    val categorias: List<Categoria> = emptyList(),
    val descripcion: String = "",
    val cargandoCategorias: Boolean = false,
    val creandoCategoria: Boolean = false,
    val guardando: Boolean = false,
    val errorTipo: String? = null,
    val errorMonto: String? = null,
    val errorFecha: String? = null,
    val errorDescripcion: String? = null,
    val errorCategoria: String? = null,
    val errorCategorias: String? = null,
    val errorGeneral: String? = null
)

sealed interface TransaccionEvento {
    data object Guardada : TransaccionEvento
}
