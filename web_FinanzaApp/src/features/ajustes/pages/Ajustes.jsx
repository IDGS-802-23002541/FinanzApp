import { Box, Stack } from '@mui/material'
import EncabezadoPagina from '../../../components/ui/EncabezadoPagina.jsx'
import FormularioPerfil from '../components/FormularioPerfil.jsx'
import FormularioSeguridad from '../components/FormularioSeguridad.jsx'
import Preferencias from '../components/Preferencias.jsx'
import ZonaRiesgo from '../components/ZonaRiesgo.jsx'

const sxColumna = {
  flex: '1 1 380px',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 2.5,
}

// Interior de Ajustes: identidad y contraseña a la izquierda; preferencias a la
// derecha y la zona de riesgo siempre al final. Así las dos columnas terminan
// a una altura parecida en vez de dejar un hueco.
function Ajustes() {
  return (
    <Stack spacing={3}>
      <EncabezadoPagina
        titulo="Ajustes"
        descripcion="Actualiza tus datos, tu contraseña y tus preferencias de la cuenta."
      />

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
          <FormularioSeguridad />
        </Box>

        <Box sx={sxColumna}>
          <Preferencias />
          <ZonaRiesgo />
        </Box>
      </Box>
    </Stack>
  )
}

export default Ajustes
