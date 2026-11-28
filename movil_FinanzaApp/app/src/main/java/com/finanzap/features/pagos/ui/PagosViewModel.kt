package com.finanzap.features.pagos.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.R
import com.finanzap.core.util.fechaIsoDesdeMillis
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.pagos.data.PagoRecurrente
import com.finanzap.features.pagos.data.PagosRepository
import com.finanzap.features.transacciones.Categoria
import com.finanzap.features.transacciones.data.CategoriasRepository
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
class PagosViewModel @Inject constructor(
    private val pagosRepository: PagosRepository,
    private val categoriasRepository: CategoriasRepository
) : ViewModel() {

    private val _state = MutableStateFlow(PagosUiState())
    val state: StateFlow<PagosUiState> = _state.asStateFlow()

    private val _eventos = Channel<PagosEvento>(Channel.BUFFERED)
    val eventos: Flow<PagosEvento> = _eventos.receiveAsFlow()

    fun cargar(carteraId: Int) {
        _state.update { it.copy(idCartera = carteraId) }
        cargarCategorias()
        cargarPagina(1)
    }

    fun reintentar() {
        cargarPagina(_state.value.pagina.coerceAtLeast(1))
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
        if (_state.value.categorias.isEmpty()) cargarCategorias()
        _state.update {
            it.copy(
                formularioAbierto = true,
                pagoEnEdicionId = null,
                nombre = "",
                monto = "",
                frecuencia = "MENSUAL",
                fechaInicio = fechaIsoDesdeMillis(System.currentTimeMillis()),
                fechaFin = "",
                descripcion = "",
                categoria = null,
                errorNombre = null,
                errorMonto = null,
                errorFechas = null,
                errorFormulario = null
            )
        }
    }

    fun abrirEdicion(pago: PagoRecurrente) {
        if (_state.value.categorias.isEmpty()) cargarCategorias()
        _state.update {
            it.copy(
                formularioAbierto = true,
                pagoEnEdicionId = pago.id,
                nombre = pago.nombre,
                monto = pago.monto.toString(),
                frecuencia = pago.frecuencia,
                fechaInicio = pago.fechaInicio.orEmpty(),
                fechaFin = pago.fechaFin.orEmpty(),
                descripcion = pago.descripcion.orEmpty(),
                categoria = it.categorias.firstOrNull { c -> c.id == pago.categoriaId },
                errorNombre = null,
                errorMonto = null,
                errorFechas = null,
                errorFormulario = null
            )
        }
    }

    fun cerrarFormulario() {
        _state.update { it.copy(formularioAbierto = false, errorFormulario = null) }
    }

    fun onNombreChange(nombre: String) {
        _state.update { it.copy(nombre = nombre, errorNombre = null, errorFormulario = null) }
    }

    fun onMontoChange(monto: String) {
        _state.update { it.copy(monto = monto, errorMonto = null, errorFormulario = null) }
    }

    fun onFrecuenciaChange(frecuencia: String) {
        _state.update { it.copy(frecuencia = frecuencia, errorFormulario = null) }
    }

    fun onFechaInicioChange(fecha: String) {
        _state.update { it.copy(fechaInicio = fecha, errorFechas = null, errorFormulario = null) }
    }

    fun onFechaFinChange(fecha: String) {
        _state.update { it.copy(fechaFin = fecha, errorFechas = null, errorFormulario = null) }
    }

    fun onDescripcionChange(descripcion: String) {
        _state.update { it.copy(descripcion = descripcion, errorFormulario = null) }
    }

    fun onCategoriaChange(categoria: Categoria) {
        _state.update { it.copy(categoria = categoria, errorFormulario = null) }
    }

    fun crearCategoria(nombre: String) {
        val actual = _state.value
        if (actual.creandoCategoria || actual.idCartera == 0) return

        _state.update { it.copy(creandoCategoria = true, errorCategorias = null) }
        viewModelScope.launch {
            categoriasRepository.crear(actual.idCartera, nombre.trim())
                .onSuccess { categoria ->
                    _state.update {
                        it.copy(
                            creandoCategoria = false,
                            categorias = it.categorias + categoria,
                            categoria = categoria
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

    private fun cargarCategorias() {
        val idCartera = _state.value.idCartera
        if (idCartera == 0 || _state.value.cargandoCategorias) return

        _state.update { it.copy(cargandoCategorias = true, errorCategorias = null) }
        viewModelScope.launch {
            categoriasRepository.listar(idCartera, "GASTO")
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

    fun guardar() {
        val actual = _state.value
        if (actual.guardando || actual.idCartera == 0) return

        val nombre = actual.nombre.trim()
        if (nombre.isBlank()) {
            _state.update { it.copy(errorNombre = R.string.pagos_error_nombre) }
            return
        }
        if (nombre.length > 120) {
            _state.update { it.copy(errorNombre = R.string.pagos_error_nombre_largo) }
            return
        }
        val monto = actual.monto.trim().replace(",", "").toDoubleOrNull() ?: 0.0
        if (monto <= 0.0) {
            _state.update { it.copy(errorMonto = R.string.pagos_error_monto) }
            return
        }
        if (actual.fechaInicio.isBlank()) {
            _state.update { it.copy(errorFechas = R.string.pagos_error_fecha_inicio) }
            return
        }
        if (actual.fechaFin.isNotBlank() && actual.fechaFin < actual.fechaInicio) {
            _state.update { it.copy(errorFechas = R.string.pagos_error_fechas) }
            return
        }

        val idPago = actual.pagoEnEdicionId
        val fechaFin = actual.fechaFin.ifBlank { null }
        val descripcion = actual.descripcion.trim().ifBlank { null }

        _state.update { it.copy(guardando = true, errorFormulario = null) }
        viewModelScope.launch {
            val resultado = if (idPago == null) {
                pagosRepository.crear(
                    carteraId = actual.idCartera,
                    nombre = nombre,
                    monto = monto,
                    frecuencia = actual.frecuencia,
                    fechaInicio = actual.fechaInicio,
                    fechaFin = fechaFin,
                    descripcion = descripcion,
                    categoriaId = actual.categoria?.id
                )
            } else {
                pagosRepository.actualizar(
                    idPago = idPago,
                    nombre = nombre,
                    monto = monto,
                    frecuencia = actual.frecuencia,
                    fechaInicio = actual.fechaInicio,
                    fechaFin = fechaFin,
                    descripcion = descripcion,
                    categoriaId = actual.categoria?.id
                )
            }
            resultado
                .onSuccess {
                    _state.update { it.copy(guardando = false, formularioAbierto = false) }
                    cargarPagina(1)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(guardando = false, errorFormulario = error.mensaje())
                    }
                }
        }
    }

    fun cancelar(idPago: Int) {
        val actual = _state.value
        if (actual.cancelando) return

        _state.update { it.copy(cancelando = true, errorCancelar = null) }
        viewModelScope.launch {
            pagosRepository.cancelar(idPago)
                .onSuccess {
                    _state.update { it.copy(cancelando = false) }
                    _eventos.trySend(PagosEvento.Cancelado)
                    cargarPagina(_state.value.pagina)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(cancelando = false, errorCancelar = error.mensaje())
                    }
                }
        }
    }

    fun marcarHecho(pago: PagoRecurrente) {
        val actual = _state.value
        if (actual.marcandoHechoId != null) return

        _state.update { it.copy(marcandoHechoId = pago.id, errorMarcarHecho = null) }
        viewModelScope.launch {
            pagosRepository.marcarHecho(pago.id, pago.proximaEjecucion)
                .onSuccess {
                    _state.update { it.copy(marcandoHechoId = null) }
                    _eventos.trySend(PagosEvento.MarcadoHecho)
                    cargarPagina(_state.value.pagina)
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            marcandoHechoId = null,
                            errorMarcarHecho = error.mensaje()
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
            pagosRepository.listar(actual.idCartera, pagina, POR_PAGINA)
                .onSuccess { listado ->
                    _state.update {
                        it.copy(
                            cargando = false,
                            pagos = listado.pagos,
                            pagina = listado.pagina,
                            totalPaginas = listado.totalPaginas.coerceAtLeast(1)
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(cargando = false, error = error.mensaje())
                    }
                }
        }
    }

    private companion object {
        const val POR_PAGINA = 20
    }
}

data class PagosUiState(
    val cargando: Boolean = false,
    val error: String? = null,
    val pagos: List<PagoRecurrente> = emptyList(),
    val pagina: Int = 1,
    val totalPaginas: Int = 1,
    val idCartera: Int = 0,
    val formularioAbierto: Boolean = false,
    val pagoEnEdicionId: Int? = null,
    val nombre: String = "",
    val monto: String = "",
    val frecuencia: String = "MENSUAL",
    val fechaInicio: String = "",
    val fechaFin: String = "",
    val descripcion: String = "",
    val categoria: Categoria? = null,
    val categorias: List<Categoria> = emptyList(),
    val cargandoCategorias: Boolean = false,
    val creandoCategoria: Boolean = false,
    val errorCategorias: String? = null,
    val errorNombre: Int? = null,
    val errorMonto: Int? = null,
    val errorFechas: Int? = null,
    val errorFormulario: String? = null,
    val guardando: Boolean = false,
    val cancelando: Boolean = false,
    val errorCancelar: String? = null,
    val marcandoHechoId: Int? = null,
    val errorMarcarHecho: String? = null
)

sealed interface PagosEvento {
    data object Cancelado : PagosEvento
    data object MarcadoHecho : PagosEvento
}

private fun Throwable.mensaje(): String = message ?: "No se pudo completar la operación."
