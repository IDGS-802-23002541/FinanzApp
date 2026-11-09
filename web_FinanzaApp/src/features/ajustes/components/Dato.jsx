import { Box, Typography } from '@mui/material'

// Fila de solo lectura (etiqueta + valor) usada por las tarjetas de Ajustes.
function Dato({ etiqueta, valor }) {
  return (
    <Box>
      <Typography
        sx={{ fontSize: '0.78125rem', color: 'var(--color-texto-terciario)' }}
      >
        {etiqueta}
      </Typography>
      <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-texto)' }}>
        {valor}
      </Typography>
    </Box>
  )
}

export default Dato
