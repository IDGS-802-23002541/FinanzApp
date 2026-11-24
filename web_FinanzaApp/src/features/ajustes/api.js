// Llamadas a la API del módulo de ajustes (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

// HU-02.4: cambia la contraseña en sesión. El backend revoca las demás
// sesiones y conserva la actual.
export async function cambiarContrasenia({ actual, nueva }) {
  await api.post('/auth/cambiar', { actual, nueva })
}

// HU-02.5a: desactivación lógica. Archiva las carteras propias y da de baja
// las colaboraciones.
export async function desactivarCuenta(contrasenia) {
  await api.post('/auth/desactivar', { contrasenia })
}

// HU-08.3: preferencias de notificación (se guardan al instante).
export async function obtenerPreferencias() {
  const { data } = await api.get('/auth/preferencias')
  return data
}

export async function guardarPreferencias(cambios) {
  const { data } = await api.put('/auth/preferencias', cambios)
  return data
}

// HU-02.5b: eliminación del registro del cliente. El backend anonimiza sus
// datos, conserva las transacciones y revoca la sesión.
export async function eliminarCuenta(contrasenia) {
  await api.delete('/auth/cuenta', { contrasenia })
}
