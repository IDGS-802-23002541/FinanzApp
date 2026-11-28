package com.finanzap.core.navigation

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finanzap.core.notificaciones.mostrarNotificacion
import com.finanzap.core.notificaciones.notificacionesPermitidas
import com.finanzap.core.storage.EventosSesion
import com.finanzap.core.storage.PreferenciasTema
import com.finanzap.features.auth.data.AuthRepository
import com.finanzap.features.notificaciones.data.NotificacionesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val preferenciasTema: PreferenciasTema,
    private val notificacionesRepository: NotificacionesRepository,
    @ApplicationContext private val context: Context,
    eventosSesion: EventosSesion
) : ViewModel() {

    private val _state = MutableStateFlow(MainUiState(temaOscuro = preferenciasTema.temaOscuro()))
    val state: StateFlow<MainUiState> = _state.asStateFlow()

    private val _eventos = Channel<MainEvento>(Channel.BUFFERED)
    val eventos: Flow<MainEvento> = _eventos.receiveAsFlow()

    private var sincronizando = false

    init {
        viewModelScope.launch {
            val haySesion = withContext(Dispatchers.IO) { authRepository.haySesion() }
            _state.update { it.copy(cargando = false, haySesion = haySesion) }
        }
        viewModelScope.launch {
            eventosSesion.sesionTerminada.collect { _eventos.send(MainEvento.IrALogin) }
        }
    }

    fun cerrarSesion() {
        viewModelScope.launch {
            authRepository.cerrarSesion()
            _eventos.send(MainEvento.IrALogin)
        }
    }

    fun guardarTemaOscuro(oscuro: Boolean) {
        preferenciasTema.guardarTemaOscuro(oscuro)
        _state.update { it.copy(temaOscuro = oscuro) }
    }

    /**
     * Busca notificaciones nuevas del backend y las publica como avisos del
     * sistema. Guarda el último id mostrado para no repetirlas.
     */
    fun sincronizarNotificaciones() {
        if (sincronizando) return
        sincronizando = true
        viewModelScope.launch {
            notificacionesRepository.listar(1, 20)
                .onSuccess { listado ->
                    val preferencias = context.getSharedPreferences(
                        PREFERENCIAS_NOTIFICACIONES,
                        Context.MODE_PRIVATE
                    )
                    val ultimoMostrado = preferencias.getLong(CLAVE_ULTIMO_ID, 0L)
                    val nuevas = listado.notificaciones
                        .filter { it.id > ultimoMostrado && !it.leida }
                        .sortedBy { it.id }

                    if (nuevas.isNotEmpty() && notificacionesPermitidas(context)) {
                        nuevas.forEach { notificacion ->
                            mostrarNotificacion(
                                context = context,
                                id = (notificacion.id % Int.MAX_VALUE).toInt(),
                                titulo = notificacion.titulo,
                                texto = notificacion.mensaje,
                                abreNotificaciones = true
                            )
                        }
                        preferencias.edit()
                            .putLong(CLAVE_ULTIMO_ID, nuevas.maxOf { it.id })
                            .apply()
                    }
                    sincronizando = false
                }
                .onFailure {
                    sincronizando = false
                }
        }
    }

    private companion object {
        const val PREFERENCIAS_NOTIFICACIONES = "notificaciones_vistas"
        const val CLAVE_ULTIMO_ID = "ultimo_id"
    }
}

data class MainUiState(
    val cargando: Boolean = true,
    val haySesion: Boolean = false,
    val temaOscuro: Boolean? = null
)

/** Acciones de una sola vez que resuelve la navegación raíz. */
sealed interface MainEvento {
    data object IrALogin : MainEvento
}