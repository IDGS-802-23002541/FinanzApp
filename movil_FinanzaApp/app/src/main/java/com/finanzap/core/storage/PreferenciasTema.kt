package com.finanzap.core.storage

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Guarda el modo de color elegido por el usuario.
 * Sin valor guardado se sigue el tema del sistema.
 */
@Singleton
class PreferenciasTema @Inject constructor(
    @ApplicationContext context: Context
) {
    private val preferencias =
        context.getSharedPreferences(ARCHIVO_PREFERENCIAS, Context.MODE_PRIVATE)

    fun temaOscuro(): Boolean? =
        if (preferencias.contains(CLAVE_TEMA_OSCURO)) {
            preferencias.getBoolean(CLAVE_TEMA_OSCURO, false)
        } else {
            null
        }

    fun guardarTemaOscuro(oscuro: Boolean) {
        preferencias.edit().putBoolean(CLAVE_TEMA_OSCURO, oscuro).apply()
    }

    private companion object {
        const val ARCHIVO_PREFERENCIAS = "ajustes_finanzapp"
        const val CLAVE_TEMA_OSCURO = "temaOscuro"
    }
}
