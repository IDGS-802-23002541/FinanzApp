package com.finanzap

import android.app.Application
import com.finanzap.core.notificaciones.crearCanalNotificaciones
import dagger.hilt.android.HiltAndroidApp

// Clase Application: punto de arranque e inicialización de la inyección de dependencias (Hilt).
@HiltAndroidApp
class FinanzapApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // El canal debe existir desde el arranque para que los avisos se muestren.
        crearCanalNotificaciones(this)
    }
}
