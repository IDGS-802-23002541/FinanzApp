//Se usa este archivo para renderizar los contenidos y la barra lateral de los paneles por rol
import { useState } from 'react'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Outlet } from 'react-router-dom'
import SideBar from '../components/ui/SideBar.jsx'
import Logo from '../components/ui/Logo.jsx'
import { IconoMenu } from '../components/ui/Iconos.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useTema } from '../hooks/useTema.js'
import { ROLES } from '../utils/constantes.js'

const enlacesPorRol = {
  [ROLES.ADMIN]: [
    { ruta: '/admin', texto: 'Inicio', grupo: 'Principal', exacto: true },
    { ruta: '/admin/trabajadores', texto: 'Trabajadores', grupo: 'Principal' },
    { ruta: '/admin/comentarios', texto: 'Buzón', grupo: 'Principal' },
    { ruta: '/admin/tickets', texto: 'Tickets', grupo: 'Principal' },
    { ruta: '/ajustes', texto: 'Ajustes', grupo: 'Cuenta' },
    ],
  [ROLES.TRABAJADOR]: [
    { ruta: '/admin/tickets', texto: 'Tickets', grupo: 'Principal' },
    { ruta: '/admin/comentarios', texto: 'Buzón', grupo: 'Principal' },
    { ruta: '/ajustes', texto: 'Ajustes', grupo: 'Cuenta' },
  ],
  [ROLES.CLIENTE] : [
    { ruta: '/carteras', texto: 'Carteras', grupo: 'Principal' },
    { ruta: '/reportes', texto: 'Reportes', grupo: 'Principal' },
    { ruta: '/soporte', texto: 'Soporte', grupo: 'Principal' },
    { ruta: '/ajustes', texto: 'Ajustes', grupo: 'Cuenta' },
  ]
}

export default function PanelLayout() {
    const { usuario } = useAuth()
    const { tema } = useTema()
    const temaMui = useTheme()
    // En pantallas chicas la navegación pasa a un cajón para dejar el ancho al contenido.
    const esMovil = useMediaQuery(temaMui.breakpoints.down('md'))
    const [menuAbierto, setMenuAbierto] = useState(false)

    const enlaces = enlacesPorRol[usuario.rol] ?? []

    return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-fondo)' }}>
        {esMovil ? (
          <>
            <AppBar
              position="fixed"
              elevation={0}
              sx={{
                backgroundColor: 'var(--color-superficie)',
                color: 'var(--color-texto)',
                borderBottom: '1px solid var(--color-borde)',
              }}
            >
              <Toolbar sx={{ gap: 1.5, minHeight: '60px !important' }}>
                <IconButton
                  edge="start"
                  aria-label="Abrir menú"
                  onClick={() => setMenuAbierto(true)}
                >
                  <IconoMenu />
                </IconButton>
                <Logo
                  variante={tema === 'oscuro' ? 'blanco' : 'color'}
                  alto={26}
                  conTexto
                />
              </Toolbar>
            </AppBar>

            <Drawer
              open={menuAbierto}
              onClose={() => setMenuAbierto(false)}
              slotProps={{ paper: { sx: { width: 272 } } }}
            >
              <SideBar
                enlaces={enlaces}
                enDrawer
                onNavegar={() => setMenuAbierto(false)}
              />
            </Drawer>
          </>
        ) : (
          <SideBar enlaces={enlaces} />
        )}

        <Box
          component="section"
          sx={{
            flex: 1,
            minWidth: 0,
            height: esMovil ? 'auto' : '100vh',
            overflowY: esMovil ? 'visible' : 'auto',
            backgroundColor: 'var(--color-fondo)',
            pt: esMovil ? '60px' : 0,
          }}
        >
          <Box sx={{ mx: 'auto', maxWidth: 1280, p: { xs: 2, md: 4 } }}>
            <Outlet />
          </Box>
        </Box>
    </Box>
    )
}
