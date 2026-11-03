package com.finanzap.core.util

private val REGEX_CORREO = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
private val REGEX_CODIGO = Regex("^\\d{6}$")

private fun correoValido(correo: String): Boolean = REGEX_CORREO.matches(correo.trim())

fun codigoValido(codigo: String): Boolean = REGEX_CODIGO.matches(codigo.trim())

/** Mensaje listo para mostrar cuando el correo falta o no tiene forma válida. */
fun errorCorreo(correo: String): String? = when {
    correo.isBlank() -> "Ingresa tu correo."
    !correoValido(correo) -> "Ingresa un correo válido."
    else -> null
}

/** Misma política que valida el backend en /auth/restablecer. */
private fun requisitosContrasena(contrasena: String): List<String> = buildList {
    if (contrasena.length < 8) add("mínimo 8 caracteres")
    if (contrasena.none { it.isUpperCase() }) add("una mayúscula")
    if (contrasena.none { it.isDigit() }) add("un número")
}

/** Mensaje de la política de contraseña; null si la cumple. */
fun errorContrasenaNueva(contrasena: String): String? {
    val requisitos = requisitosContrasena(contrasena)
    return if (requisitos.isEmpty()) null
    else "Debe incluir: ${requisitos.joinToString(", ")}."
}

/** Mensaje cuando la confirmación no coincide con la contraseña. */
fun errorConfirmacion(contrasena: String, confirmacion: String): String? =
    if (contrasena == confirmacion) null else "Las contraseñas no coinciden."
