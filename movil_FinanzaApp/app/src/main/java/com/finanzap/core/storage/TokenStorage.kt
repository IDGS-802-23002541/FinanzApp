@file:Suppress("DEPRECATION")

package com.finanzap.core.storage

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Guarda el JWT y el refresh token cifrados en el dispositivo.
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

    fun guardarSesion(accessToken: String, refreshToken: String) {
        preferencias.edit()
            .putString(CLAVE_ACCESS, accessToken)
            .putString(CLAVE_REFRESH, refreshToken)
            .apply()
    }

    /** El access token dura 15 minutos: se reemplaza cuando el backend lo renueva. */
    fun guardarAccessToken(accessToken: String) {
        preferencias.edit().putString(CLAVE_ACCESS, accessToken).apply()
    }

    fun accessToken(): String? = preferencias.getString(CLAVE_ACCESS, null)

    fun refreshToken(): String? = preferencias.getString(CLAVE_REFRESH, null)

    fun haySesion(): Boolean = !accessToken().isNullOrBlank() && !refreshToken().isNullOrBlank()

    fun limpiar() {
        preferencias.edit()
            .remove(CLAVE_ACCESS)
            .remove(CLAVE_REFRESH)
            .apply()
    }

    private companion object {
        const val ARCHIVO_PREFERENCIAS = "sesion_finanzapp"
        const val CLAVE_ACCESS = "jwt"
        const val CLAVE_REFRESH = "refresh"
    }
}
