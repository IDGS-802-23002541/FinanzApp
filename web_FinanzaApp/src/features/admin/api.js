// Llamadas a la API del módulo de administración (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

// Métricas agregadas para el inicio del administrador.
export async function obtenerMetricas() {
  const { data } = await api.get('/admin/metricas')
  return data
}

// Comentarios enviados desde la landing, del más reciente al más antiguo.
export async function listarComentarios({ pagina = 1, porPagina = 10 } = {}) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    porPagina: String(porPagina),
  })
  const { data, paginacion } = await api.get(`/comentarios?${params}`)
  return { comentarios: data ?? [], paginacion }
}

// Archiva un comentario (baja lógica).
export async function archivarComentario(idComentario) {
  const { data } = await api.post(
    `/comentarios/${idComentario}/archivar`,
    {},
  )
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

export async function listarTrabajadores({ pagina = 1, porPagina = 10 } = {}) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    porPagina: String(porPagina),
  })
  const { data, paginacion } = await api.get(`/admin/trabajadores?${params}`)
  return { trabajadores: data?.trabajadores ?? [], paginacion }
}

// Alta de personal de soporte. Devuelve la contraseña temporal para el admin.
export async function crearTrabajador({ nombreUsuario, apaterno, amaterno, correo }) {
  const { data } = await api.post('/admin/trabajadores', {
    nombreUsuario,
    apaterno,
    amaterno,
    correo,
  })
  return data
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
