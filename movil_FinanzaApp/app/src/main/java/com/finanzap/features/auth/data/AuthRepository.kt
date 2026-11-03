package com.finanzap.features.auth.data

/**
 * Contrato de autenticación consumido por los ViewModel.
 * La implementación real está en [AuthRepositoryImpl]; en las pruebas se sustituye por un doble.
 */
interface AuthRepository {

    suspend fun iniciarSesion(correo: String, contrasena: String): Result<Unit>

    /**
     * Devuelve el código solo cuando el backend corre en debug: el envío por correo
     * todavía no existe (tarea #219).
     */
    suspend fun solicitarRecuperacion(correo: String): Result<String?>

    suspend fun restablecerContrasenia(
        correo: String,
        codigo: String,
        contrasena: String
    ): Result<Unit>

    /** Cambia la contraseña del usuario con sesión activa. */
    suspend fun cambiarContrasenia(actual: String, nueva: String): Result<Unit>

    /**
     * Desactivar o eliminar cierra la sesión local cuando el backend confirma
     * que la cuenta ya no puede iniciar sesión (CA2 de HU-02.5a y HU-02.5b).
     */
    suspend fun desactivarCuenta(contrasena: String): Result<Unit>

    suspend fun eliminarCuenta(contrasena: String): Result<Unit>

    suspend fun cerrarSesion()

    fun haySesion(): Boolean
}
