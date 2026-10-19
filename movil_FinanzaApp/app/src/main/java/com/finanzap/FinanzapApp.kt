package com.finanzap

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

// Clase Application: punto de arranque e inicialización de la inyección de dependencias (Hilt).
@HiltAndroidApp
class FinanzapApp : Application()
