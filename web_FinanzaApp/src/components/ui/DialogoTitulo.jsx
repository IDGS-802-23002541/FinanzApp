import { Box, DialogTitle, IconButton } from '@mui/material'
import { IconoCerrar } from './Iconos.jsx'

// Título de diálogo con el botón de cerrar a la derecha. Se usa en todos los
// diálogos para que la ventana siempre tenga una salida visible, además de
// "Cancelar" o el clic fuera.
export default function DialogoTitulo({ children, alCerrar, sx }) {
  return (
    <DialogTitle
      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 1, ...sx }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
      <IconButton
        aria-label="Cerrar"
        size="small"
        onClick={alCerrar}
        sx={{ flexShrink: 0 }}
      >
        <IconoCerrar sx={{ fontSize: 20 }} />
      </IconButton>
    </DialogTitle>
  )
}
