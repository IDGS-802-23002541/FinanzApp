import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout.jsx'
import ProtectedRoute from '../routes/ProtectedRoute.jsx'
import RoleRoute from '../routes/RoleRoute.jsx'
import Landing from '../features/landing/pages/Landing.jsx'
import Login from '../features/auth/pages/Login.jsx'
import Registro from '../features/auth/pages/Registro.jsx'
import RecuperarContrasena from '../features/auth/pages/RecuperarContrasena.jsx'
import ListaCarteras from '../features/carteras/pages/Lista.jsx'
import DetalleCartera from '../features/carteras/pages/Detalle.jsx'
import Transacciones from '../features/transacciones/pages/Transacciones.jsx'
import Reportes from '../features/reportes/pages/Reportes.jsx'
import PagosRecurrentes from '../features/pagos-recurrentes/pages/Lista.jsx'
import Ajustes from '../features/ajustes/pages/Ajustes.jsx'
import Soporte from '../features/soporte/pages/MisTickets.jsx'
import InicioAdmin from '../features/admin/pages/Inicio.jsx'
import Trabajadores from '../features/admin/pages/Trabajadores.jsx'
import TicketsAdmin from '../features/admin/pages/Tickets.jsx'
import PanelLayout from '../layouts/PanelLayout.jsx'
import PaginaNoEncontrada from '../features/PaginaNoEncontrada.jsx'
import { ROLES } from '../utils/constantes.js'

// Todas las rutas de la aplicación en un solo lugar.
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/login', element: <Login /> },
      { path: '/registro', element: <Registro /> },
      { path: '/recuperar', element: <RecuperarContrasena /> },
    ],
  },
  {
    element: <ProtectedRoute/>, children: [
      {element: <PanelLayout />, children: [
        {element: <RoleRoute roles={[ROLES.CLIENTE]} />, children: [
          {path: '/carteras', element: <ListaCarteras />},
          {path: '/carteras/:id', element: <DetalleCartera />},
          {path: '/transacciones', element: <Transacciones />},
          {path: '/reportes', element: <Reportes />},
          {path: '/pagos-recurrentes', element: <PagosRecurrentes />},
          {path: '/soporte', element: <Soporte />},
        ]},
        {element: <RoleRoute roles={[ROLES.ADMIN, ROLES.TRABAJADOR]}/>, children: [
          {element: <RoleRoute roles={[ROLES.ADMIN]} />, children: [
            {path: '/admin', element: <InicioAdmin />},
            {path: '/admin/trabajadores', element: <Trabajadores />},
          ]},
          {path: '/admin/tickets', element: <TicketsAdmin />},
        ]},
        {path: '/ajustes', element: <Ajustes />},
      ]}
    ]
  },
  { path: '*', element: <PaginaNoEncontrada /> },
])
