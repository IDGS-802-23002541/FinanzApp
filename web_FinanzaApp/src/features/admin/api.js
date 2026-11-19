// Llamadas a la API del módulo de administración (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

// Comentarios enviados desde la landing, del más reciente al más antiguo.
export async function listarComentarios() {
  const { data } = await api.get('/comentarios')
  return data
}
