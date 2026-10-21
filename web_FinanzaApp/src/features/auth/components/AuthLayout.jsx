import { Box, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import {
  IconoCheck,
  IconoFlechaIzquierda,
} from '../../../components/ui/Iconos.jsx'

const CARACTERISTICAS = [
  'Carteras ilimitadas para hogar, viajes y eventos',
  'Invitaciones con código QR y clave única',
  'Estadísticas de gasto por categoría y por mes',
  'Cierre de cartera con balance y liquidación sugerida',
]

function PanelMarca() {
  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        width: '48%',
        p: 6,
        background: 'var(--gradiente-marca)',
        color: 'var(--paleta-blanco)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        component="svg"
        aria-hidden="true"
        viewBox="0 0 400 400"
        sx={{
          position: 'absolute',
          top: -140,
          right: -170,
          width: 440,
          height: 440,
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      >
        <circle cx="200" cy="200" r="150" fill="none" stroke="var(--color-acento)" />
        <circle cx="200" cy="200" r="190" fill="none" stroke="var(--color-acento)" />
      </Box>

      <Stack
        direction="row"
        spacing={1.25}
        component={RouterLink}
        to="/"
        sx={{
          alignItems: 'center',
          color: 'inherit',
          textDecoration: 'none',
          width: 'fit-content',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'var(--paleta-blanco)',
            color: 'var(--paleta-petroleo)',
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

      <Box sx={{ my: 'auto' }}>
        <Typography
          component="p"
          sx={{
            maxWidth: 430,
            fontSize: '1.875rem',
            fontWeight: 800,
            lineHeight: 1.5,
            letterSpacing: '-0.02em',
          }}
        >
          Las cuentas claras también se ven bien
        </Typography>

        <Stack component="ul" spacing={2} sx={{ listStyle: 'none', p: 0, mt: 3 }}>
          {CARACTERISTICAS.map((texto) => (
            <Stack
              component="li"
              key={texto}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center' }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: 'var(--paleta-blanco)',
                  color: 'var(--paleta-petroleo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconoCheck sx={{ fontSize: 13 }} />
              </Box>
              <Typography
                sx={{ fontSize: '0.875rem', color: 'var(--paleta-blanco)' }}
              >
                {texto}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Typography sx={{ fontSize: '0.75rem', color: 'var(--paleta-blanco)' }}>
        Proyecto integrador · Universidad Tecnológica de León · IDGS1002
      </Typography>
    </Box>
  )
}

// Estructura común de login, registro y recuperación de contraseña.
function AuthLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Panel de marca con características de la aplicación. Se oculta en pantallas pequeñas. */}
      <PanelMarca />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, md: 5 },
          py: 5,
          backgroundColor: 'var(--color-fondo)',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Link
            component={RouterLink}
            to="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-texto-terciario)',
            }}
          >
            <IconoFlechaIzquierda sx={{ fontSize: 16 }} />
            Volver al inicio
          </Link>

          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default AuthLayout
