package com.finanzap.features.auth.data

import com.finanzap.core.storage.TokenStorage
import com.finanzap.features.auth.data.dto.LoginRequest
import kotlinx.coroutines.CancellationException
import javax.inject.Inject
import javax.inject.Singleton

// Único punto que habla con la API de autenticación.
@Singleton
class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val tokenStorage: TokenStorage
) {

    suspend fun iniciarSesion(correo: String, contrasena: String): Result<Unit> =
        try {
            val respuesta = authApi.iniciarSesion(
                LoginRequest(correo = correo.trim(), contrasenia = contrasena)
            )
            val sesion = respuesta.data
            check(sesion.accessToken.isNotBlank()) { "El servidor devolvió un token vacío." }
            tokenStorage.guardarSesion(
                accessToken = sesion.accessToken,
                refreshToken = sesion.refreshToken
            )
            Result.success(Unit)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    /**
     * Revoca la sesión en el backend y siempre borra el guardado local.
     * Si no hay red se limpia igual: el refresh token caduca solo en el servidor.
     */
    suspend fun cerrarSesion() {
        try {
            authApi.cerrarSesion()
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            // La sesión local debe cerrarse aunque el backend no responda.
        }
        tokenStorage.limpiar()
    }

    fun haySesion(): Boolean = tokenStorage.haySesion()
}
