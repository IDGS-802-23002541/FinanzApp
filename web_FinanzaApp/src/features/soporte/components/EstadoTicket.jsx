import { Chip } from '@mui/material'

// Textos visibles para el cliente. El backend devuelve el estado en mayúsculas.
const ESTADOS = {
  ABIERTO: {
    texto: 'Pendiente',
    fondo: 'var(--color-superficie-suave)',
    color: 'var(--color-texto-secundario)',
  },
  EN_PROCESO: {
    texto: 'En proceso',
    fondo: 'var(--color-seleccion)',
    color: 'var(--color-seleccion-texto)',
  },
  ESPERA: {
    texto: 'En espera',
    fondo: 'var(--color-superficie-suave)',
    color: 'var(--color-texto-terciario)',
  },
  RESUELTO: {
    texto: 'Resuelto',
    fondo: 'var(--color-superficie-suave)',
    color: 'var(--color-exito)',
  },
  CERRADO: {
    texto: 'Cerrado',
    fondo: 'var(--color-superficie-suave)',
    color: 'var(--color-texto-terciario)',
  },
}

function EstadoTicket({ estado }) {
  const configuracion = ESTADOS[estado]

  return (
    <Chip
      size="small"
      label={configuracion?.texto ?? estado}
      sx={{
        fontWeight: 600,
        backgroundColor: configuracion?.fondo ?? 'var(--color-superficie-suave)',
        color: configuracion?.color ?? 'var(--color-texto-secundario)',
      }}
    />
  )
}

export default EstadoTicket
