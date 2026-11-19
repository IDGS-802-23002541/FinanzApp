export const ROLES = {
  CLIENTE: 'cliente',
  TRABAJADOR: 'trabajador',
  ADMIN: 'admin',
}

// Pantalla de inicio de cada rol.
export const PANEL_POR_ROL = {
  [ROLES.CLIENTE]: '/carteras',
  [ROLES.TRABAJADOR]: '/admin/tickets',
  [ROLES.ADMIN]: '/admin',
}

// Misma política que valida el backend: 8 caracteres, una mayúscula y un número.
export const CONTRASENIA_VALIDA = /^(?=.*[A-Z])(?=.*\d).{8,}$/
export const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/