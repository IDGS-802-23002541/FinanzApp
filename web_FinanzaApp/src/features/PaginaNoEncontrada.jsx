import { Box, Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { PANEL_POR_ROL } from '../utils/constantes.js'
import { IconoBuscar } from '../components/ui/Iconos.jsx'

// Página 404. Vive fuera del panel: ofrece volver al inicio o al panel según
// haya sesión activa.
export default function PaginaNoEncontrada() {
  const { usuario } = useAuth()
  const destino = usuario ? PANEL_POR_ROL[usuario.rol] ?? '/' : '/'
  const accionPrincipal = usuario ? 'Ir a mi panel' : 'Volver al inicio'
  const accionSecundaria = usuario ? 'Volver al inicio' : 'Iniciar sesión'
  const rutaSecundaria = usuario ? '/' : '/login'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-fondo)',
        px: 3,
        py: 8,
      }}
    >
      <Stack
        spacing={3}
        sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 480 }}
      >
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            backgroundColor: 'var(--color-superficie-suave)',
            color: 'var(--color-texto-secundario)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconoBuscar sx={{ fontSize: 42 }} />
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-seleccion-texto)',
            }}
          >
            Error 404
          </Typography>
          <Typography
            component="h1"
            sx={{
              mt: 1,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            No encontramos esta página
          </Typography>
          <Typography sx={{ mt: 1.5, color: 'var(--color-texto-secundario)' }}>
            Puede que el enlace esté roto o que la página ya no exista.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            component={RouterLink}
            to={destino}
            variant="contained"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {accionPrincipal}
          </Button>
          <Button
            component={RouterLink}
            to={rutaSecundaria}
            variant="outlined"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {accionSecundaria}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
