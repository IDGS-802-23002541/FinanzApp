import { Box, Stack, Typography } from '@mui/material'
import FormularioPerfil from '../components/FormularioPerfil.jsx'
import FormularioSeguridad from '../components/FormularioSeguridad.jsx'
import Preferencias from '../components/Preferencias.jsx'
import ZonaRiesgo from '../components/ZonaRiesgo.jsx'

const sxColumna = { flex: '1 1 340px', minWidth: 0 }

// Interior de Ajustes: identidad y contacto a la izquierda; lo que protege o
// afecta la cuenta a la derecha, con la zona de riesgo siempre al final.
function Ajustes() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h1">Ajustes</Typography>
        <Typography
          sx={{
            mt: 0.75,
            fontSize: '0.875rem',
            color: 'var(--color-texto-terciario)',
          }}
        >
          Actualiza tus datos, tu contraseña y tus preferencias de la cuenta.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2.5,
          alignItems: 'flex-start',
        }}
      >
        <Box sx={sxColumna}>
          <FormularioPerfil />
        </Box>

        <Box
          sx={{
            ...sxColumna,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          <FormularioSeguridad />
          <Preferencias />
          <ZonaRiesgo />
        </Box>
      </Box>
    </Stack>
  )
}

export default Ajustes
