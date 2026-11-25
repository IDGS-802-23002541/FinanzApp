import { Box, Button, Typography } from '@mui/material'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useTema } from '../../hooks/useTema.js'
import Logo from './Logo.jsx'
import { AvatarUsuario, IconoSalir } from './Iconos.jsx'

// Une los enlaces consecutivos del mismo grupo para pintar las secciones del menú.
function agruparEnlaces(enlaces) {
  const grupos = []

  enlaces.forEach((enlace) => {
    const etiqueta = enlace.grupo || ''
    const ultimo = grupos[grupos.length - 1]

    if (ultimo && ultimo.etiqueta === etiqueta) {
      ultimo.enlaces.push(enlace)
    } else {
      grupos.push({ etiqueta, enlaces: [enlace] })
    }
  })

  return grupos
}

// Barra lateral compartida por los layouts de cliente y admin. En móvil se
// monta dentro de un Drawer (`enDrawer`), así no arrastra el alto de la ventana.
export default function SideBar({ enlaces = [], enDrawer = false, onNavegar }) {
  const { usuario, cerrarSesion } = useAuth()
  const { tema } = useTema()
  const navegar = useNavigate()

  const salir = async () => {
    await cerrarSesion()
    navegar('/login', { replace: true })
  }

  // El recuadro de cuenta muestra nombre y apellidos, no solo el nombre.
  const nombreVisible = [
    usuario?.nombreUsuario,
    usuario?.apaterno,
    usuario?.amaterno,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Box
      component="aside"
      sx={{
        width: enDrawer ? '100%' : 256,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: enDrawer ? '100%' : '100vh',
        overflowY: 'auto',
        backgroundColor: 'var(--color-superficie)',
        borderRight: enDrawer ? 'none' : '1px solid var(--color-borde)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 2 }}>
        <Logo
          variante={tema === 'oscuro' ? 'blanco' : 'color'}
          alto={30}
          conTexto
        />
      </Box>

      <Box component="nav" sx={{ flex: 1, px: 2, pb: 2 }}>
        {agruparEnlaces(enlaces).map((grupo, indice) => (
          <Box key={`${indice}-${grupo.etiqueta}`} sx={{ mt: grupo.etiqueta ? 2.5 : 1 }}>
            {grupo.etiqueta && (
              <Typography
                sx={{
                  px: 1.5,
                  mb: 0.75,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-texto-terciario)',
                }}
              >
                {grupo.etiqueta}
              </Typography>
            )}
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {grupo.enlaces.map(({ ruta, texto, exacto }) => (
                <Box component="li" key={ruta} sx={{ mb: 0.5 }}>
                  <NavLink
                    to={ruta}
                    end={exacto}
                    onClick={onNavegar}
                    style={{ textDecoration: 'none' }}
                  >
                    {({ isActive }) => (
                      <Box
                        component="span"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          px: 1.5,
                          py: 1,
                          borderRadius: 'var(--radio-md)',
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: isActive
                            ? 'var(--color-seleccion-texto)'
                            : 'var(--color-texto)',
                          backgroundColor: isActive
                            ? 'var(--color-seleccion)'
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: isActive
                              ? 'var(--color-seleccion)'
                              : 'var(--color-superficie-suave)',
                          },
                        }}
                      >
                        {texto}
                      </Box>
                    )}
                  </NavLink>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ borderTop: '1px solid var(--color-borde)', p: 2 }}>
        {/* El bloque de la cuenta lleva a Ajustes: es donde se cambian los datos. */}
        <Box
          component={NavLink}
          to="/ajustes"
          onClick={onNavegar}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mx: -1,
            p: 1,
            borderRadius: 'var(--radio-md)',
            color: 'inherit',
            textDecoration: 'none',
            '&:hover': { backgroundColor: 'var(--color-superficie-suave)' },
          }}
        >
          <AvatarUsuario
            nombreUsuario={usuario?.nombreUsuario}
            imagenUsuario={usuario?.foto}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              title={nombreVisible}
              sx={{ fontSize: '0.8125rem', fontWeight: 700 }}
            >
              {nombreVisible}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: 'var(--color-texto-secundario)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {usuario?.correo}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          size="small"
          startIcon={<IconoSalir />}
          onClick={salir}
          sx={{
            mt: 1,
            justifyContent: 'flex-start',
            px: 1.5,
            color: 'var(--color-texto-secundario)',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radio-md)',
            '&:hover': {
              backgroundColor: 'var(--color-superficie-suave)',
            },
          }}
        >
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  )
}
