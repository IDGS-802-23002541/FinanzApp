import { Box, Button, Stack, Typography } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

// Encabezado de los paneles con el usuario en sesión y la salida.
function BarraSesion() {
  const { usuario, cerrarSesion } = useAuth()
  const navegar = useNavigate()

  const salir = async () => {
    await cerrarSesion()
    navegar('/login', { replace: true })
  }

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: { xs: 2, md: 3 },
        py: 2,
        borderBottom: '1px solid var(--color-borde)',
        backgroundColor: 'var(--color-superficie)',
      }}
    >
      <Typography
        component={Link}
        to="/"
        sx={{
          fontWeight: 800,
          color: 'var(--color-texto)',
          textDecoration: 'none',
        }}
      >
        FinanzApp
      </Typography>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography
          sx={{ fontSize: '0.875rem', color: 'var(--color-texto-secundario)' }}
        >
          {usuario?.nombreUsuario}
        </Typography>
        <Button size="small" variant="outlined" onClick={salir}>
          Cerrar sesión
        </Button>
      </Stack>
    </Box>
  )
}

export default BarraSesion
