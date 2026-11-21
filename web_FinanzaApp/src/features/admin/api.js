// Llamadas a la API del modulo de administracion (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

export async function listarTickets({
  estado,
  prioridad,
  pagina = 1,
  porPagina = 20,
} = {}) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    porPagina: String(porPagina),
  })
  if (estado) params.append('estado', estado)
  if (prioridad) params.append('prioridad', prioridad)

  const { data } = await api.get(`/soporte/tickets?${params}`)
  return data
}

export async function responderTicket(idTicket, mensaje) {
  const { data } = await api.post(`/soporte/tickets/${idTicket}/respuestas`, {
    mensaje: mensaje.trim(),
  })
  return data
}

// Comentarios enviados desde la landing, del mas reciente al mas antiguo.
export async function listarComentarios() {
  const { data } = await api.get('/comentarios')
  return data
}
