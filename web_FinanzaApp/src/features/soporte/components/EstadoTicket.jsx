import { Box, Chip } from '@mui/material'

// Estados del reporte con su color. El texto visible no cambia el estado del
// backend; solo se muestra en español.
const ESTADOS = {
  ABIERTO: { texto: 'Pendiente', clave: 'pendiente' },
  EN_PROCESO: { texto: 'En proceso', clave: 'proceso' },
  ESPERA: { texto: 'En espera', clave: 'espera' },
  RESUELTO: { texto: 'Resuelto', clave: 'resuelto' },
  CERRADO: { texto: 'Cerrado', clave: 'cerrado' },
}

// Etiqueta del estado de un reporte: punto + fondo suave del color del estado.
// Los tokens de color están en tema.css y son los mismos en claro y oscuro.
function EstadoTicket({ estado }) {
  const configuracion = ESTADOS[estado]
  const clave = configuracion?.clave

  return (
    <Chip
      size="small"
      label={
        <Box
          component="span"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
        >
          {clave && (
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'currentColor',
                flexShrink: 0,
              }}
            />
          )}
          {configuracion?.texto ?? estado}
        </Box>
      }
      sx={{
        fontWeight: 700,
        backgroundColor: clave
          ? `var(--color-${clave}-fondo)`
          : 'var(--color-superficie-suave)',
        color: clave ? `var(--color-${clave})` : 'var(--color-texto-secundario)',
        '& .MuiChip-label': { px: 1.25 },
      }}
    />
  )
}

export default EstadoTicket
