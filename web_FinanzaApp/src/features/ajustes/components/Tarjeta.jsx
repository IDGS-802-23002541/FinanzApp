import { Box, Stack, Typography } from '@mui/material'

const estiloTitulo = { fontSize: '0.9375rem', fontWeight: 700, lineHeight: 1.5 }
const estiloSubtitulo = {
  fontSize: '0.78125rem',
  color: 'var(--color-texto-terciario)',
  lineHeight: 1.5,
}

// Tarjeta blanca del interior de Ajustes (mockup de Figma).
function Tarjeta({ titulo, subtitulo, avatar, children }) {
  return (
    <Box
      sx={{
        backgroundColor: 'var(--color-superficie)',
        border: '1px solid var(--color-borde)',
        borderRadius: '16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        p: 2.5,
      }}
    >
      {avatar ? (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {avatar}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={estiloTitulo}>{titulo}</Typography>
            <Typography sx={estiloSubtitulo}>{subtitulo}</Typography>
          </Box>
        </Stack>
      ) : (
        <>
          <Typography sx={estiloTitulo}>{titulo}</Typography>
          <Typography sx={{ ...estiloSubtitulo, mt: 0.5 }}>{subtitulo}</Typography>
        </>
      )}

      <Box sx={{ mt: 1.5 }}>{children}</Box>
    </Box>
  )
}

export default Tarjeta
