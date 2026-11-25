import { Box, Stack, Typography } from '@mui/material'

// Cabecera común de las pantallas del panel: título, descripción y acciones.
// Mantiene el mismo orden y tamaño en todas las vistas para que la jerarquía
// no cambie al navegar.
export default function EncabezadoPagina({ titulo, descripcion, children }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        alignItems: { xs: 'stretch', md: 'flex-start' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h1">{titulo}</Typography>
        {descripcion && (
          <Typography
            sx={{
              mt: 0.75,
              maxWidth: 620,
              fontSize: '0.875rem',
              color: 'var(--color-texto-secundario)',
            }}
          >
            {descripcion}
          </Typography>
        )}
      </Box>

      {children && (
        <Stack
          direction="row"
          sx={{ flexShrink: 0, flexWrap: 'wrap', alignItems: 'center', gap: 1 }}
        >
          {children}
        </Stack>
      )}
    </Stack>
  )
}
