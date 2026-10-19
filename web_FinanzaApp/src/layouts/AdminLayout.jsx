import { Link, Outlet } from 'react-router-dom'

const enlaces = [
  { ruta: '/admin', texto: 'Inicio' },
  { ruta: '/admin/trabajadores', texto: 'Trabajadores' },
  { ruta: '/admin/tickets', texto: 'Tickets' },
]

// Administración y trabajadores.
function AdminLayout() {
  return (
    <>
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
