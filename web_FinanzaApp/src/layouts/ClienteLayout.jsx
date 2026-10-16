import { Link, Outlet } from 'react-router-dom'

const enlaces = [
  { ruta: '/carteras', texto: 'Carteras' },
  { ruta: '/transacciones', texto: 'Transacciones' },
  { ruta: '/reportes', texto: 'Reportes' },
  { ruta: '/pagos-recurrentes', texto: 'Pagos recurrentes' },
  { ruta: '/ajustes', texto: 'Ajustes' },
  { ruta: '/soporte', texto: 'Soporte' },
]

// Navegación del cliente.
function ClienteLayout() {
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

export default ClienteLayout
