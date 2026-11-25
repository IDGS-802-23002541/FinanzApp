import { Box, Stack, Typography } from '@mui/material'

// Estado vacío de una sección del panel: ícono, mensaje y una acción opcional.
// Se usa en las pestañas del detalle para que todas se lean igual.
export default function EstadoVacio({ Icono, titulo, descripcion, accion }) {
  return (
    <Stack
      spacing={2}
      sx={{ alignItems: 'center', py: 5, px: 2, textAlign: 'center' }}
    >
      {Icono && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'var(--color-superficie-suave)',
            color: 'var(--color-texto-secundario)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icono sx={{ fontSize: 22 }} />
        </Box>
      )}

      <Box>
        <Typography sx={{ fontWeight: 700 }}>{titulo}</Typography>
        {descripcion && (
          <Typography
            sx={{
              mt: 0.5,
              maxWidth: 380,
              fontSize: '0.875rem',
              color: 'var(--color-texto-secundario)',
            }}
          >
            {descripcion}
          </Typography>
        )}
      </Box>

      {accion}
    </Stack>
  )
}
