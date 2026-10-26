import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { ROLES } from '../utils/constantes.js'

// Exige que el usuario tenga uno de los roles indicados.
export default function RoleRoute({ roles }) {
  const { usuario } = useAuth()
  const PANEL_POR_ROL = {
    [ROLES.CLIENTE]: '/carteras',
    [ROLES.TRABAJADOR]: '/admin/tickets',
    [ROLES.ADMIN]: '/admin',
  }

  if (!usuario || !roles.includes(usuario.rol)) {
    return <Navigate to={PANEL_POR_ROL[usuario?.rol] || '/'} replace />
  }

  return <Outlet />
}
