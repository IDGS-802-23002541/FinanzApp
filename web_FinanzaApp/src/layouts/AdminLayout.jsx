import { Link, Outlet } from 'react-router-dom'
import BarraSesion from '../components/ui/BarraSesion.jsx'

const enlaces = [
  { ruta: '/admin', texto: 'Inicio' },
  { ruta: '/admin/trabajadores', texto: 'Trabajadores' },
  { ruta: '/admin/tickets', texto: 'Tickets' },
]

// Administración y trabajadores.
function AdminLayout() {
  return (
    <>
      <BarraSesion />
      <nav>
        {enlaces.map(({ ruta, texto }) => (
          <Link key={ruta} to={ruta}>
            {texto}
          </Link>
        ))}
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default AdminLayout
