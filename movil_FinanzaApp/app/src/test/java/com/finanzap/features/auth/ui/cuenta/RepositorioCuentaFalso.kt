package com.finanzap.features.auth.ui.cuenta

import com.finanzap.features.auth.data.AuthRepository

// Doble compartido por los tests de cuenta: cambiar, desactivar y eliminar.
class RepositorioCuentaFalso : AuthRepository {

    var llamadasCambiar = 0
    var llamadasDesactivar = 0
    var llamadasEliminar = 0
    var falla: Exception? = null

    override suspend fun iniciarSesion(correo: String, contrasena: String): Result<Unit> =
        Result.success(Unit)

    override suspend fun solicitarRecuperacion(correo: String): Result<String?> =
        Result.success(null)

    override suspend fun restablecerContrasenia(
        correo: String,
        codigo: String,
        contrasena: String
    ): Result<Unit> = Result.success(Unit)

    override suspend fun cambiarContrasenia(actual: String, nueva: String): Result<Unit> {
        llamadasCambiar++
        val error = falla
        return if (error != null) Result.failure(error) else Result.success(Unit)
    }

    override suspend fun desactivarCuenta(contrasena: String): Result<Unit> {
        llamadasDesactivar++
        val error = falla
        return if (error != null) Result.failure(error) else Result.success(Unit)
    }

    override suspend fun eliminarCuenta(contrasena: String): Result<Unit> {
        llamadasEliminar++
        val error = falla
        return if (error != null) Result.failure(error) else Result.success(Unit)
    }

    override suspend fun cerrarSesion() = Unit

    override fun haySesion(): Boolean = false
}
