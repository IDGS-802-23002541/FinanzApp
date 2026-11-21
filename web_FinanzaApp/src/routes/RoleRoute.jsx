import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { PANEL_POR_ROL } from '../utils/constantes.js'

// Exige que el usuario tenga uno de los roles indicados.
export default function RoleRoute({ roles }) {
  const { usuario } = useAuth()

  if (!usuario || !roles.includes(usuario.rol)) {
    return <Navigate to={PANEL_POR_ROL[usuario?.rol] || '/'} replace />
  }

  return <Outlet />
}
