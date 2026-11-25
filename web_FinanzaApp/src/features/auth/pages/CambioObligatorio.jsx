import { useNavigate } from 'react-router-dom'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useAuth } from '../../../hooks/useAuth.js'
import FormularioSeguridad from '../../ajustes/components/FormularioSeguridad.jsx'
import { PANEL_POR_ROL } from '../../../utils/constantes.js'

// CA3 de HU-11.1: con la contraseña temporal solo se puede definir una nueva.
export default function CambioObligatorio() {
  const { usuario, cerrarSesion, actualizarUsuario } = useAuth()
  const navigate = useNavigate()

  const alCambiar = () => {
    actualizarUsuario({ debeCambiarContrasenia: false })
    navigate(PANEL_POR_ROL[usuario.rol] ?? '/', { replace: true })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 3,
        backgroundColor: 'var(--color-fondo)',
      }}
    >
      <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 460 }}>
        <Box>
          <Typography variant="h1">Cambia tu contraseña</Typography>
          <Typography
            sx={{
              mt: 0.75,
              fontSize: '0.875rem',
              color: 'var(--color-texto-secundario)',
            }}
          >
            Entraste con una contraseña temporal. Define una nueva para
            continuar.
          </Typography>
        </Box>

        <FormularioSeguridad alCambiar={alCambiar} />

        <Button
          onClick={cerrarSesion}
          sx={{ alignSelf: 'center', textTransform: 'none' }}
        >
          Cerrar sesión
        </Button>
      </Stack>
    </Box>
  )
}
