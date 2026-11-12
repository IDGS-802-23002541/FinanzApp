// Llamadas a la API del módulo de reportes (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

const API_URL = import.meta.env.VITE_API_URL ?? ''

function queryReporte(filtros = {}) {
  const params = new URLSearchParams()

  if (filtros.carteraId) params.append('carteraId', String(filtros.carteraId))
  if (filtros.tipo) params.append('tipo', filtros.tipo)
  if (filtros.periodoId) params.append('periodoId', String(filtros.periodoId))
  if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
  if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)
  if (filtros.cantidad) params.append('cantidad', String(filtros.cantidad))

  return params.toString()
}

export async function obtenerVistaPreviaReporte(filtros = {}) {
  const query = queryReporte(filtros)
  const { data } = await api.get(`/reportes${query ? `?${query}` : ''}`)
  return data
}

export async function descargarReporte(filtros = {}, formato = 'CSV') {
  const query = queryReporte({ ...filtros, formato })
  const token = localStorage.getItem('token')
  const respuesta = await fetch(
    `${API_URL}/reportes/exportar?${query}&formato=${encodeURIComponent(formato)}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  )

  if (!respuesta.ok) {
    let mensaje = 'No se pudo generar el reporte.'
    try {
      const cuerpo = await respuesta.json()
      if (cuerpo?.mensaje) mensaje = cuerpo.mensaje
    } catch {
      // La respuesta no trajo JSON: se conserva el mensaje genérico.
    }
    throw new Error(mensaje)
  }

  const blob = await respuesta.blob()
  const disposicion = respuesta.headers.get('Content-Disposition') ?? ''
  const coincidencia = disposicion.match(/filename="([^"]+)"/i)
  const nombre =
    coincidencia?.[1] ?? `reporte.${formato.toLowerCase()}`

  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}
