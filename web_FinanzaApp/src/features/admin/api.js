// Llamadas a la API del módulo de administración (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

// Comentarios enviados desde la landing, del más reciente al más antiguo.
export async function listarComentarios() {
  const { data } = await api.get('/comentarios')
  return data
}

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

export async function listarTrabajadores() {
  const { data } = await api.get('/admin/trabajadores')
  return data.trabajadores
}

export async function asignarTicket(
  idTicket,
  { trabajadorId, idAsignacionActual } = {},
) {
  const cuerpo = { idAsignacionActual }
  if (trabajadorId) cuerpo.trabajadorId = trabajadorId

  const { data } = await api.post(`/soporte/tickets/${idTicket}/asignar`, cuerpo)
  return data
}

export async function cerrarTicket(idTicket, observaciones = '') {
  const { data } = await api.post(`/soporte/tickets/${idTicket}/cerrar`, {
    observaciones: observaciones.trim(),
  })
  return data
}

export async function responderTicket(idTicket, mensaje) {
  const { data } = await api.post(`/soporte/tickets/${idTicket}/respuestas`, {
    mensaje: mensaje.trim(),
  })
  return data
}
