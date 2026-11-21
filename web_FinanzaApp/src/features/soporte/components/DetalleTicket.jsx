import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import EstadoTicket from './EstadoTicket.jsx'
import { formatearFecha } from '../../../utils/formato.js'

// Estados en los que el reporte ya no admite cambios (CA4).
const SOLO_LECTURA = ['RESUELTO', 'CERRADO']

// Detalle de un reporte con su conversación (ticket #212).
// El backend no tiene GET /soporte/tickets/{id}: el ticket llega del listado,
// que ya incluye respuestas y asignación actual.
function DetalleTicket({ abierto = false, alCerrar, ticket }) {
  const respuestas = ticket?.respuestas ?? []
  const soloLectura = SOLO_LECTURA.includes(ticket?.estado)

  return (
    <Dialog open={abierto} onClose={alCerrar} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {ticket ? `#${ticket.idTicket} · ${ticket.asunto}` : 'Detalle del reporte'}
        {ticket?.estado && <EstadoTicket estado={ticket.estado} />}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography
            variant="body2"
            sx={{ color: 'var(--color-texto-terciario)' }}
          >
            {ticket?.fechaCreacion
              ? `Creado el ${formatearFecha(ticket.fechaCreacion)}`
              : ''}
            {ticket?.fechaCierre
              ? ` · Cerrado el ${formatearFecha(ticket.fechaCierre)}`
              : ''}
          </Typography>

          {soloLectura && (
            <Alert severity="info">
              Este reporte ya está {ticket.estado === 'CERRADO' ? 'cerrado' : 'resuelto'}:
              solo se puede consultar.
            </Alert>
          )}

          <Typography variant="body1">{ticket?.descripcion}</Typography>

          <Divider sx={{ borderColor: 'var(--color-borde)' }} />

          <Typography variant="h3">Conversación</Typography>

          {respuestas.length === 0 ? (
            <Box
              sx={{
                p: 2,
                border: '1px dashed var(--color-borde)',
                borderRadius: '12px',
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: 'var(--color-texto-terciario)' }}
              >
                Todavía no hay respuestas para este reporte.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {respuestas.map((respuesta) => (
                <Box
                  key={respuesta.idRespuesta}
                  sx={{
                    p: 2,
                    border: '1px solid var(--color-borde)',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-superficie-suave)',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-texto-terciario)', mb: 0.5 }}
                  >
                    {respuesta.fechaCreacion
                      ? formatearFecha(respuesta.fechaCreacion)
                      : ''}
                  </Typography>
                  <Typography variant="body1">{respuesta.mensaje}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default DetalleTicket
