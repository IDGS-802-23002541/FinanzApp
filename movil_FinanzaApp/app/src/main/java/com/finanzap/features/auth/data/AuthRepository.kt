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
                LoginRequest(correo = correo.trim(), contrasena = contrasena)
            )
            check(respuesta.token.isNotBlank()) { "El servidor devolvió un token vacío." }
            tokenStorage.guardar(respuesta.token)
            Result.success(Unit)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            Result.failure(e)
        }

    fun cerrarSesion() {
        tokenStorage.limpiar()
    }

    fun haySesion(): Boolean = !tokenStorage.obtener().isNullOrBlank()
}
