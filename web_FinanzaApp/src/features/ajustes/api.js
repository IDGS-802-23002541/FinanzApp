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
