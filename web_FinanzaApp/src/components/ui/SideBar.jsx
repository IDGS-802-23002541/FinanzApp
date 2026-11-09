import { Box, Button, Stack, Typography } from '@mui/material'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
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

// Barra lateral compartida por los layouts de cliente y admin (mockup de Figma).
export default function SideBar({ enlaces = [] }) {
  const { usuario, cerrarSesion } = useAuth()
  const navegar = useNavigate()

  const salir = async () => {
    await cerrarSesion()
    navegar('/login', { replace: true })
  }

  return (
    <Box
      component="aside"
      sx={{
        width: 256,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: 'var(--color-superficie)',
        borderRight: '1px solid var(--color-borde)',
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ alignItems: 'center', px: 2.5, py: 2 }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'var(--color-primario)',
            color: 'var(--color-sobre-primario)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.875rem',
          }}
        >
          F
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>
          FinanzApp
        </Typography>
      </Stack>

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
                  <NavLink to={ruta} end={exacto} style={{ textDecoration: 'none' }}>
                    {({ isActive }) => (
                      <Box
                        component="span"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          px: 1.5,
                          py: 1,
                          borderRadius: '10px',
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
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <AvatarUsuario
            nombreUsuario={usuario?.nombreUsuario}
            imagenUsuario={usuario?.foto}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>
              {usuario?.nombreUsuario}
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
        </Stack>
        <Button
          fullWidth
          size="small"
          startIcon={<IconoSalir />}
          onClick={salir}
          sx={{
            mt: 1.5,
            justifyContent: 'flex-start',
            minHeight: 0,
            py: 1,
            px: 1.5,
            color: 'var(--color-texto-secundario)',
            fontSize: '0.8125rem',
            borderRadius: '10px',
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
