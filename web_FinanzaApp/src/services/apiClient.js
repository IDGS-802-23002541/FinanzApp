// Cliente HTTP único de la aplicación. Agrega el JWT guardado en localStorage.

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function peticion(ruta, opciones = {}) {
  const token = localStorage.getItem('token')
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  })

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} al llamar ${ruta}`)
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
