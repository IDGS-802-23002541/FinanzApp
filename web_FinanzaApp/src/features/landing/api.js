// Llamadas a la API del módulo landing (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

// Envía un comentario desde el formulario público de la landing.
export async function crearComentario({ nombre, correo, comentario }) {
  const { data } = await api.post('/comentarios', {
    nombre: nombre.trim(),
    correo: correo.trim(),
    comentario: comentario.trim(),
  })
  return data
}
