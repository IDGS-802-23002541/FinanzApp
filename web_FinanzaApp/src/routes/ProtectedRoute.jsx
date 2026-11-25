import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

// Exige sesión iniciada y, si el backend pidió cambiar la contraseña,
// solo deja ver la pantalla de cambio (CA3 de HU-11.1).
function ProtectedRoute() {
  const { usuario } = useAuth()
  const { pathname } = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (usuario.debeCambiarContrasenia && pathname !== '/cambiar-contrasenia') {
    return <Navigate to="/cambiar-contrasenia" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
