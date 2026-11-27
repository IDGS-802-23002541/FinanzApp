// Llamadas a la API del módulo de soporte al cliente (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

const CATEGORIAS = ['GENERAL', 'CUENTA', 'CARTERA', 'PAGOS', 'ERROR', 'OTRO']
const ESTADOS = ['ABIERTO', 'EN_PROCESO', 'ESPERA', 'RESUELTO', 'CERRADO']

// apiClient.get no acepta opciones: la query se arma aquí.
function queryTickets({ estado, busqueda, pagina, porPagina }) {
  const params = new URLSearchParams()

  if (estado && ESTADOS.includes(estado)) params.append('estado', estado)
  if (busqueda) params.append('busqueda', busqueda)
  if (pagina) params.append('pagina', String(pagina))
  if (porPagina) params.append('porPagina', String(porPagina))

  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function crearTicket({ asunto, descripcion, categoria }) {
  const { data } = await api.post('/soporte/tickets', {
    asunto,
    descripcion,
    categoria: CATEGORIAS.includes(categoria) ? categoria : 'GENERAL',
  })

  return data.ticket
}

export async function listarTickets({ estado, busqueda, pagina = 1, porPagina = 10 } = {}) {
  const { data } = await api.get(
    `/soporte/tickets${queryTickets({ estado, busqueda, pagina, porPagina })}`,
  )

  return data
}

// HU-09.3: el cliente solo puede editar su reporte mientras siga ABIERTO.
export async function actualizarTicket(idTicket, { asunto, descripcion, categoria }) {
  const { data } = await api.put(`/soporte/tickets/${idTicket}`, {
    asunto,
    descripcion,
    categoria,
  })

  return data.ticket
}

// La baja es lógica: el backend marca el ticket como ELIMINADO y deja de listarse.
export async function eliminarTicket(idTicket) {
  await api.delete(`/soporte/tickets/${idTicket}`)
}
