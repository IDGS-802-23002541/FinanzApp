package com.finanzap.features.carteras.ui.formulario

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.util.mensajeErrorApi
import com.finanzap.features.carteras.data.CarterasRepository
import com.finanzap.features.carteras.model.TipoCartera
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

@HiltViewModel
class NuevaCarteraViewModel @Inject constructor(
    private val carterasRepository: CarterasRepository
) : ViewModel() {

    private val _state = MutableStateFlow(NuevaCarteraUiState())
    val state: StateFlow<NuevaCarteraUiState> = _state.asStateFlow()

    fun onNombreChange(nombre: String) {
        _state.update { it.copy(nombre = nombre, errorNombre = null, errorGeneral = null) }
    }

    fun onTipoChange(tipo: TipoCartera) {
        _state.update { it.copy(tipo = tipo, errorTipo = null, errorGeneral = null) }
    }

    fun onDescripcionChange(descripcion: String) {
        _state.update { it.copy(descripcion = descripcion, errorDescripcion = null, errorGeneral = null) }
    }

    fun onPresupuestoChange(presupuesto: String) {
        _state.update { it.copy(presupuesto = presupuesto, errorPresupuesto = null, errorGeneral = null) }
    }

    fun onFechaInicioChange(fecha: String?) {
        _state.update { it.copy(fechaInicio = fecha, errorFechas = null, errorGeneral = null) }
    }

    fun onFechaFinChange(fecha: String?) {
        _state.update { it.copy(fechaFin = fecha, errorFechas = null, errorGeneral = null) }
    }

    fun guardar() {
        val actual = _state.value
        if (actual.guardando) return

        val nombre = actual.nombre.trim()
        val tipo = actual.tipo
        val descripcion = actual.descripcion.trim()
        val monto = actual.presupuesto.trim().replace(",", "").toDoubleOrNull()

        val errorNombre = when {
            nombre.isBlank() -> "El nombre es obligatorio."
            nombre.length > 100 -> "El nombre admite hasta 100 caracteres."
            else -> null
        }
        val errorTipo = if (tipo == null) "Elige el tipo de cartera." else null
        val errorDescripcion = if (descripcion.length > 500) {
            "La descripción admite hasta 500 caracteres."
        } else {
            null
        }
        val errorPresupuesto = when {
            actual.presupuesto.isBlank() -> null
            monto == null -> "Ingresa un monto válido."
            monto < 0 -> "El presupuesto no puede ser negativo."
            else -> null
        }
        val errorFechas = if (
            actual.fechaInicio != null && actual.fechaFin != null && actual.fechaFin < actual.fechaInicio
        ) {
            "La fecha de fin no puede ser anterior a la de inicio."
        } else {
            null
        }

        if (errorNombre != null || errorTipo != null || errorDescripcion != null ||
            errorPresupuesto != null || errorFechas != null
        ) {
            _state.update {
                it.copy(
                    errorNombre = errorNombre,
                    errorTipo = errorTipo,
                    errorDescripcion = errorDescripcion,
                    errorPresupuesto = errorPresupuesto,
                    errorFechas = errorFechas,
                    errorGeneral = null
                )
            }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(guardando = true, errorGeneral = null) }
            carterasRepository.crear(
                nombre = nombre,
                tipo = tipo!!,
                descripcion = descripcion.ifBlank { null },
                presupuestoInicial = monto ?: 0.0,
                fechaInicio = actual.fechaInicio,
                fechaFin = actual.fechaFin
            )
                .onSuccess {
                    _state.update { it.copy(guardando = false, creada = true) }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            guardando = false,
                            errorGeneral = mensajeErrorApi(
                                error,
                                "No se pudo crear la cartera. Intenta de nuevo."
                            )
                        )
                    }
                }
        }
    }
}
