//Se usa este archivo para renderizar los contenidos y la barra lateral de los paneles por rol
import { Box, Stack } from '@mui/material'
import { Outlet } from 'react-router-dom'
import SideBar from '../components/ui/SideBar.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { ROLES } from '../utils/constantes.js'

const enlacesPorRol = {
  [ROLES.ADMIN]: [
    { ruta: '/admin', texto: 'Inicio', grupo: 'Principal', exacto: true },
    { ruta: '/admin/trabajadores', texto: 'Trabajadores', grupo: 'Principal' },
    { ruta: '/admin/tickets', texto: 'Tickets', grupo: 'Principal' },
    { ruta: '/ajustes', texto: 'Ajustes', grupo: 'Cuenta' },
    ],
 [ROLES.TRABAJADOR]: [
    { ruta: '/admin/tickets', texto: 'Tickets', grupo: 'Principal' },
    { ruta: '/ajustes', texto: 'Ajustes', grupo: 'Cuenta' },
  ],
  [ROLES.CLIENTE] : [
    { ruta: '/carteras', texto: 'Carteras', grupo: 'Principal' },
    { ruta: '/transacciones', texto: 'Transacciones', grupo: 'Principal' },
    { ruta: '/reportes', texto: 'Reportes', grupo: 'Principal' },
    { ruta: '/pagos-recurrentes', texto: 'Pagos recurrentes', grupo: 'Principal' },
    { ruta: '/soporte', texto: 'Soporte', grupo: 'Principal' },
    { ruta: '/ajustes', texto: 'Ajustes', grupo: 'Cuenta' },
  ]
}

export default function PanelLayout() {
    const { usuario } = useAuth()
    const enlaces = enlacesPorRol[usuario?.rol] || []
    return (
    <Box sx={{ display: 'flex', backgroundColor: 'var(--color-fondo)' }}>
        <SideBar enlaces={enlacesPorRol[usuario.rol]} />
        <Box component="section" sx={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto', backgroundColor: 'var(--color-fondo)' }}>
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Outlet />
        </Box>
        </Box>
    </Box>
    )
}