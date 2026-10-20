package com.finanzap.core.util

private val REGEX_CORREO = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")

fun correoValido(correo: String): Boolean = REGEX_CORREO.matches(correo.trim())
