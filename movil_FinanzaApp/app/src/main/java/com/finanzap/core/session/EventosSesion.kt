package com.finanzap.core.session

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Avisa a la navegación que la sesión terminó (logout o refresh token rechazado)
 * para regresar al login sin importar la pantalla abierta.
 */
@Singleton
class EventosSesion @Inject constructor() {

    private val _sesionTerminada = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val sesionTerminada: SharedFlow<Unit> = _sesionTerminada.asSharedFlow()

    fun notificarSesionTerminada() {
        _sesionTerminada.tryEmit(Unit)
    }
}
