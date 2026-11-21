// Llamadas a la API del módulo de administración (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

// Comentarios enviados desde la landing, del más reciente al más antiguo.
export async function listarComentarios() {
  const { data } = await api.get('/comentarios')
  return data
}

export async function listarTickets({ estado, pagina = 1, porPagina = 20 } = {}) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    porPagina: String(porPagina),
  })
  if (estado) params.append('estado', estado)

  const { data } = await api.get(`/soporte/tickets?${params}`)
  return data
}

export async function responderTicket(idTicket, mensaje) {
  const { data } = await api.post(`/soporte/tickets/${idTicket}/respuestas`, {
    mensaje: mensaje.trim(),
  })
  return data
}
