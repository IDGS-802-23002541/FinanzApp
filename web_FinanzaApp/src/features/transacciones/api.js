// Llamadas a la API del módulo de transacciones (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

export async function listarTransacciones(
  idCartera,
  { pagina = 1, porPagina = 20, periodoId, desde, hasta } = {},
) {
  const query = new URLSearchParams({
    pagina: String(pagina),
    porPagina: String(porPagina),
  })
  if (periodoId) query.append('periodoId', String(periodoId))
  if (desde) query.append('desde', desde)
  if (hasta) query.append('hasta', hasta)
  const { data } = await api.get(
    `/carteras/${idCartera}/transacciones?${query}`,
  )
  return data // { items, paginacion, totales }
}

export async function actualizarTransaccion(idTransaccion, datos) {
  const { data } = await api.put(`/transacciones/${idTransaccion}`, datos)
  return data
}

export async function eliminarTransaccion(idTransaccion) {
  const { data } = await api.delete(`/transacciones/${idTransaccion}`)
  return data
}