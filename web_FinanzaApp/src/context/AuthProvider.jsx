import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { cerrarSesion as cerrarSesionApi } from '../features/auth/api.js'
import { limpiarSesion } from '../services/apiClient.js'

function leerUsuarioGuardado() {
  try {
    const guardado = localStorage.getItem('usuario')
    return guardado ? JSON.parse(guardado) : null
  } catch {
    // Si el dato guardado está corrupto se descarta la sesión.
    limpiarSesion()
    return null
  }
}

export function AuthProvider({ children }) {
  // La sesión se restaura al recargar la página.
  const [usuario, setUsuario] = useState(leerUsuarioGuardado)

  // apiClient avisa cuando el refresh token ya no es válido.
  useEffect(() => {
    const manejarExpiracion = () => setUsuario(null)

    window.addEventListener('sesion-expirada', manejarExpiracion)
    return () => window.removeEventListener('sesion-expirada', manejarExpiracion)
  }, [])

  const iniciarSesion = (sesion) => {
    localStorage.setItem('token', sesion.token)
    localStorage.setItem('refreshToken', sesion.refreshToken)
    localStorage.setItem('usuario', JSON.stringify(sesion.usuario))
    setUsuario(sesion.usuario)
  }

  const cerrarSesion = async () => {
    try {
      await cerrarSesionApi()
    } catch {
      // Si la API no responde, de todos modos se cierra la sesión local.
    }

    limpiarSesion()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}
