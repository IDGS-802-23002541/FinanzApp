// Llamadas a la API del módulo de transacciones (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

export async function listarTransacciones(
  idCartera,
  { pagina = 1, porPagina = 5 } = {},
) {
  const query = new URLSearchParams({
    pagina: String(pagina),
    porPagina: String(porPagina),
  })
  const { data } = await api.get(
    `/carteras/${idCartera}/transacciones?${query}`,
  )
  return data // { items, paginacion, totales }
}