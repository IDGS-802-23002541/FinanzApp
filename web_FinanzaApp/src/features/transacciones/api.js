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

export async function actualizarTransaccion(
  idTransaccion,
  { tipo, monto, fecha, categoriaId, metodoPago, descripcion },
) {
  const { data } = await api.put(`/transacciones/${idTransaccion}`, {
    tipo,
    monto: Number(monto),
    fecha,
    ...(tipo === 'GASTO' ? { categoriaId: Number(categoriaId) } : {}),
    metodoPago: metodoPago || undefined,
    descripcion: descripcion?.trim() || undefined,
  })
  return data
}

export async function eliminarTransaccion(idTransaccion) {
  const { data } = await api.delete(`/transacciones/${idTransaccion}`)
  return data
}