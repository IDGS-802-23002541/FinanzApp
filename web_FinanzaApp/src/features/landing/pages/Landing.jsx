import { Box, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import FormularioComentarios from '../components/FormularioComentarios.jsx'

function Landing() {
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

          <Link component={RouterLink} to="/login" sx={{ fontWeight: 700 }}>
            Iniciar sesión
          </Link>
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
          </Box>

          <FormularioComentarios />
        </Box>
      </Box>
    </Box>
  )
}

export default Landing
