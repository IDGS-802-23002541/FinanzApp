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

    /** Actualiza los datos del usuario con sesión activa; los campos vacíos conservan su valor. */
    suspend fun editarCuenta(
        nombreUsuario: String,
        apaterno: String,
        amaterno: String,
        correo: String
    ): Result<Unit>

    suspend fun obtenerPreferencias(): Result<PreferenciasNotificacion>

    suspend fun guardarPreferencias(
        movimientos: Boolean,
        sistema: Boolean,
        pagos: Boolean
    ): Result<PreferenciasNotificacion>

    suspend fun cerrarSesion()

    fun haySesion(): Boolean
}

/** Avisos que el usuario con sesión activa quiere recibir. */
data class PreferenciasNotificacion(
    val movimientos: Boolean,
    val sistema: Boolean,
    val pagos: Boolean
)
