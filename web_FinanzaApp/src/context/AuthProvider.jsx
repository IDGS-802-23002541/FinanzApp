import { useState } from 'react'
import { AuthContext } from './AuthContext.js'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)

  const iniciarSesion = (datosUsuario, token) => {
    localStorage.setItem('token', token)
    setUsuario(datosUsuario)
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}
