package com.finanzap.core.network

import com.finanzap.core.session.EventosSesion
import com.finanzap.core.storage.TokenStorage
import com.finanzap.features.auth.data.AuthApi
import com.finanzap.features.auth.data.dto.RefreshRequest
import kotlinx.coroutines.runBlocking
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import javax.inject.Inject
import javax.inject.Provider
import javax.inject.Singleton

/**
 * Renueva el access token (15 min) cuando el backend responde 401 y repite la petición.
 * Si el refresh token ya no sirve, cierra la sesión y avisa para volver al login.
 */
@Singleton
class TokenAuthenticator @Inject constructor(
    private val tokenStorage: TokenStorage,
    private val eventosSesion: EventosSesion,
    private val authApi: Provider<AuthApi>
) : Authenticator {

    override fun authenticate(route: Route?, response: Response): Request? {
        // Un solo reintento por petición y nunca sobre las rutas de auth.
        if (response.priorResponse != null) return null
        if (response.request.url.encodedPath.startsWith("/auth/")) return null

        val refreshToken = tokenStorage.refreshToken() ?: return cerrarSesion()

        val nuevoAccessToken = runBlocking {
            try {
                authApi.get().renovarToken(RefreshRequest(refreshToken)).data.accessToken
            } catch (_: Exception) {
                null
            }
        }

        if (nuevoAccessToken.isNullOrBlank()) return cerrarSesion()

        tokenStorage.guardarAccessToken(nuevoAccessToken)
        return response.request.newBuilder()
            .header("Authorization", "Bearer $nuevoAccessToken")
            .build()
    }

    private fun cerrarSesion(): Request? {
        tokenStorage.limpiar()
        eventosSesion.notificarSesionTerminada()
        return null
    }
}
