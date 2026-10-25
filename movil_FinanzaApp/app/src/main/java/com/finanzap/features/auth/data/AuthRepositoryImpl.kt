package com.finanzap.features.auth.data

import com.finanzap.core.storage.TokenStorage
import com.finanzap.features.auth.data.dto.LoginRequest
import com.finanzap.features.auth.data.dto.RecuperarRequest
import com.finanzap.features.auth.data.dto.RestablecerRequest
import kotlinx.coroutines.CancellationException
import javax.inject.Inject

// Único punto que habla con la API de autenticación.
class AuthRepositoryImpl @Inject constructor(
    private val authApi: AuthApi,
    private val tokenStorage: TokenStorage
) : AuthRepository {

    override suspend fun iniciarSesion(correo: String, contrasena: String): Result<Unit> =
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

    override suspend fun solicitarRecuperacion(correo: String): Result<String?> =
        try {
            val respuesta = authApi.solicitarRecuperacion(RecuperarRequest(correo.trim()))
            Result.success(respuesta.data?.codigo)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    override suspend fun restablecerContrasenia(
        correo: String,
        codigo: String,
        contrasena: String
    ): Result<Unit> =
        try {
            authApi.restablecerContrasenia(
                RestablecerRequest(correo.trim(), codigo.trim(), contrasena)
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
    override suspend fun cerrarSesion() {
        try {
            authApi.cerrarSesion()
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            // La sesión local debe cerrarse aunque el backend no responda.
        }
        tokenStorage.limpiar()
    }

    override fun haySesion(): Boolean = tokenStorage.haySesion()
}
