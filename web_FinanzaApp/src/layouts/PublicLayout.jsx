import { Outlet } from 'react-router-dom'

// Landing y vistas de autenticación (cada una define su propio layout visual).
function PublicLayout() {
  return <Outlet />
}

export default PublicLayout
