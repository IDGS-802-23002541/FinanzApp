// Llamadas a la API del módulo de autenticación (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

// El backend devuelve el rol como rolGlobal en mayúsculas (CLIENTE/TRABAJADOR/ADMIN).
function normalizarUsuario(usuario) {
  return { ...usuario, rol: usuario.rolGlobal.toLowerCase() }
}

export async function iniciarSesion({ correo, contrasenia }) {
  const { data } = await api.post('/auth/login', { correo, contrasenia })

  return {
    token: data.access_token,
    refreshToken: data.refresh_token,
    usuario: normalizarUsuario(data.usuario),
  }
}

export async function registrar({
  nombreUsuario,
  apaterno,
  amaterno,
  correo,
  contrasenia,
}) {
  const { data } = await api.post('/auth/registro', {
    nombreUsuario,
    apaterno,
    amaterno,
    correo,
    contrasenia,
  })

  return data
}

// El backend revoca la sesión asociada al access token.
export async function cerrarSesion() {
  await api.post('/auth/logout')
}

// Pendiente en el backend: rutas /auth/recuperar y /auth/restablecer.
export async function solicitarCodigo(correo) {
  const { data } = await api.post('/auth/recuperar', { correo })
  return data
}

export async function restablecerContrasenia({ correo, codigo, contrasenia }) {
  const { data } = await api.post('/auth/restablecer', {
    correo,
    codigo,
    contrasenia,
  })
  return data
}