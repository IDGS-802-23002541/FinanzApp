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

    /**
     * Pendiente de backend (tarea #106): el endpoint aún no existe.
     * La firma ya queda fijada para no tocar pantallas cuando llegue.
     */
    suspend fun cambiarContrasenia(actual: String, nueva: String): Result<Unit>

    /**
     * Pendientes de backend (tareas #110 y #112): los endpoints aún no existen.
     * Al confirmar, la sesión local se borra igual que al cerrar sesión.
     */
    suspend fun desactivarCuenta(contrasena: String): Result<Unit>

    suspend fun eliminarCuenta(contrasena: String): Result<Unit>

    suspend fun cerrarSesion()

    fun haySesion(): Boolean
}
