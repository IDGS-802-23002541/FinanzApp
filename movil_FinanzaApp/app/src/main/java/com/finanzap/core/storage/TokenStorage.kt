@file:Suppress("DEPRECATION")

package com.finanzap.core.storage

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Guarda el JWT cifrado en el dispositivo.
 * No se almacenan contraseñas ni datos personales.
 *
 * Se usa security-crypto porque es la dependencia acordada en el proyecto;
 * sus APIs están marcadas como deprecadas pero siguen siendo la opción vigente.
 */
@Singleton
class TokenStorage @Inject constructor(
    @ApplicationContext context: Context
) {
    private val preferencias by lazy {
        val claveMaestra = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            context,
            ARCHIVO_PREFERENCIAS,
            claveMaestra,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun guardar(token: String) {
        preferencias.edit().putString(CLAVE_TOKEN, token).apply()
    }

    fun obtener(): String? = preferencias.getString(CLAVE_TOKEN, null)

    fun limpiar() {
        preferencias.edit().remove(CLAVE_TOKEN).apply()
    }

    private companion object {
        const val ARCHIVO_PREFERENCIAS = "sesion_finanzapp"
        const val CLAVE_TOKEN = "jwt"
    }
}
