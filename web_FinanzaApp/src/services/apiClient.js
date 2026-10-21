// Cliente HTTP único de la aplicación. Adjunta el JWT y renueva la sesión cuando expira.

const API_URL = import.meta.env.VITE_API_URL ?? ''

export function limpiarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('usuario')
}

function cerrarSesionLocal() {
  limpiarSesion()
  window.dispatchEvent(new Event('sesion-expirada'))
}

async function renovarSesion() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    cerrarSesionLocal()
    return false
  }

  // Se llama con fetch directo para no volver a entrar en la renovación.
  const respuesta = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!respuesta.ok) {
    cerrarSesionLocal()
    return false
  }

  const { data } = await respuesta.json()
  localStorage.setItem('token', data.access_token)
  return true
}

function crearError(respuesta, ruta) {
  const error = new Error(`Error ${respuesta.status} al llamar ${ruta}`)
  error.status = respuesta.status
  return error
}

async function peticion(ruta, opciones = {}, puedeRenovar = true) {
  const token = localStorage.getItem('token')
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  })

  // El access token dura 15 minutos: se renueva una vez y se repite la llamada.
  if (respuesta.status === 401 && puedeRenovar && !ruta.startsWith('/auth/login')) {
    if (await renovarSesion()) return peticion(ruta, opciones, false)
  }

  if (!respuesta.ok) {
    const error = crearError(respuesta, ruta)

    // El backend responde { ok: false, mensaje } cuando la petición falla.
    try {
      const cuerpo = await respuesta.json()
      if (cuerpo?.mensaje) error.message = cuerpo.mensaje
    } catch {
      // Respuesta sin JSON: se conserva el mensaje genérico.
    }

    throw error
  }

  return respuesta.status === 204 ? null : respuesta.json()
}

export const api = {
  get: (ruta) => peticion(ruta),
  post: (ruta, cuerpo) =>
    peticion(ruta, { method: 'POST', body: JSON.stringify(cuerpo) }),
  put: (ruta, cuerpo) =>
    peticion(ruta, { method: 'PUT', body: JSON.stringify(cuerpo) }),
  delete: (ruta) => peticion(ruta, { method: 'DELETE' }),
}
