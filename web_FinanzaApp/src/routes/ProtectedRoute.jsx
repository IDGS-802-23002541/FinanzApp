import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

// Exige sesión iniciada.
function ProtectedRoute() {
  const { usuario } = useAuth()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
