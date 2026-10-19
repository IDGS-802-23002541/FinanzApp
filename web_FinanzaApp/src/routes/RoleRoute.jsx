import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

// Exige que el usuario tenga uno de los roles indicados.
function RoleRoute({ roles }) {
  const { usuario } = useAuth()

  if (!usuario || !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default RoleRoute
