export const ROLES = {
  CLIENTE: 'cliente',
  TRABAJADOR: 'trabajador',
  ADMIN: 'admin',
}

// Misma política que valida el backend: 8 caracteres, una mayúscula y un número.
export const CONTRASENIA_VALIDA = /^(?=.*[A-Z])(?=.*\d).{8,}$/
export const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/