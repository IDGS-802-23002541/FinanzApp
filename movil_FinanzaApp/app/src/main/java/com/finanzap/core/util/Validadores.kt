package com.finanzap.core.util

private val REGEX_CORREO = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
private val REGEX_CODIGO = Regex("^\\d{6}$")

fun correoValido(correo: String): Boolean = REGEX_CORREO.matches(correo.trim())

fun codigoValido(codigo: String): Boolean = REGEX_CODIGO.matches(codigo.trim())

// Misma política que valida el backend en /auth/restablecer.
fun requisitosContrasena(contrasena: String): List<String> = buildList {
    if (contrasena.length < 8) add("mínimo 8 caracteres")
    if (contrasena.none { it.isUpperCase() }) add("una mayúscula")
    if (contrasena.none { it.isDigit() }) add("un número")
}
