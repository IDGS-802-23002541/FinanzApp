import { Box, Button, Link, Stack, Tooltip, Typography } from '@mui/material'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import FormularioComentarios from '../components/FormularioComentarios.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import { PANEL_POR_ROL } from '../../../utils/constantes.js'
import {
  IconoCalendario,
  IconoCartera,
  IconoPersonas,
} from '../../../components/ui/Iconos.jsx'

const APK_URL = import.meta.env.VITE_APK_URL ?? ''

const COMPARATIVA = [
  {
    titulo: 'Versión web',
    items: [
      'Panel completo en el navegador',
      'Reportes y estadísticas con gráficas',
      'Administración de trabajadores y tickets',
    ],
  },
  {
    titulo: 'Versión móvil',
    items: [
      'Registro rápido de gastos desde el celular',
      'Invitaciones con código QR',
      'Notificaciones de movimientos de la cartera',
    ],
  },
]

const EJEMPLOS = [
  {
    titulo: 'Cartera personal',
    Icono: IconoCartera,
    descripcion:
      'Controla tus gastos del mes y define un presupuesto para saber cuánto te queda disponible.',
  },
  {
    titulo: 'Cartera compartida',
    Icono: IconoPersonas,
    descripcion:
      'Invita a tu familia o compañeros con un QR y vean juntos quién aportó y quién gastó.',
  },
  {
    titulo: 'Evento o viaje',
    Icono: IconoCalendario,
    descripcion:
      'Reúne los gastos de una fecha especial, cierra la cartera y obtén el balance por participante.',
  },
]

function Tarjeta({ children }) {
  return (
    <Box
      sx={{
        p: 3,
        height: '100%',
        backgroundColor: 'var(--color-superficie)',
        border: '1px solid var(--color-borde)',
        borderRadius: '16px',
      }}
    >
      {children}
    </Box>
  )
}

function Landing() {
  const { usuario } = useAuth()

  // CA4: con sesión activa se va directo al inicio del rol.
  if (usuario) {
    return <Navigate to={PANEL_POR_ROL[usuario.rol] ?? '/'} replace />
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-fondo)',
        color: 'var(--color-texto)',
      }}
    >
      <Box
        sx={{
          maxWidth: 1040,
          mx: 'auto',
          px: { xs: 2.5, md: 4 },
          py: { xs: 3, md: 5 },
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
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
            <Typography sx={{ fontWeight: 800 }}>FinanzApp</Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Link
              component={RouterLink}
              to="/login"
              sx={{ fontWeight: 700 }}
            >
              Iniciar sesión
            </Link>
            <Button component={RouterLink} to="/registro" variant="contained">
              Registrarme
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'center',
            mt: { xs: 6, md: 10 },
          }}
        >
          <Box>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              Las cuentas claras también se ven bien
            </Typography>
            <Typography
              sx={{
                mt: 2,
                fontSize: '1.05rem',
                color: 'var(--color-texto-secundario)',
              }}
            >
              Organiza tus carteras de hogar, viajes y eventos, y comparte los
              gastos sin perder el control.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ mt: 3 }}
            >
              <Button
                component={RouterLink}
                to="/registro"
                variant="contained"
              >
                Crear cuenta gratis
              </Button>
              {APK_URL ? (
                <Button
                  component="a"
                  href={APK_URL}
                  variant="outlined"
                  download
                >
                  Descargar app
                </Button>
              ) : (
                <Tooltip title="La descarga estará disponible pronto.">
                  <span>
                    <Button variant="outlined" disabled>
                      Descargar app
                    </Button>
                  </span>
                </Tooltip>
              )}
            </Stack>
          </Box>

          <FormularioComentarios />
        </Box>

        <Box component="section" sx={{ mt: { xs: 8, md: 12 } }}>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800 }}
          >
            Web y móvil, cada una para lo suyo
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2.5,
              mt: 3,
            }}
          >
            {COMPARATIVA.map((columna) => (
              <Tarjeta key={columna.titulo}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  {columna.titulo}
                </Typography>
                <Stack component="ul" spacing={1.25} sx={{ mt: 2, pl: 0, listStyle: 'none' }}>
                  {columna.items.map((item) => (
                    <Stack
                      component="li"
                      key={item}
                      direction="row"
                      spacing={1.25}
                      sx={{ alignItems: 'flex-start' }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          mt: '0.45rem',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-acento)',
                          flexShrink: 0,
                        }}
                      />
                      <Typography sx={{ color: 'var(--color-texto-secundario)' }}>
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Tarjeta>
            ))}
          </Box>
        </Box>

        <Box component="section" sx={{ mt: { xs: 8, md: 12 } }}>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800 }}
          >
            Una cartera para cada plan
          </Typography>
          <Typography sx={{ mt: 1, color: 'var(--color-texto-secundario)' }}>
            Elige el tipo de cartera según lo que quieras organizar.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 2.5,
              mt: 3,
            }}
          >
            {EJEMPLOS.map(({ titulo, Icono, descripcion }) => (
              <Tarjeta key={titulo}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-seleccion)',
                    color: 'var(--color-seleccion-texto)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icono sx={{ fontSize: 22 }} />
                </Box>
                <Typography sx={{ mt: 2, fontWeight: 800 }}>{titulo}</Typography>
                <Typography
                  sx={{ mt: 1, color: 'var(--color-texto-secundario)' }}
                >
                  {descripcion}
                </Typography>
              </Tarjeta>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Landing
