import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import EstadoTicket from './EstadoTicket.jsx'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'
import { formatearFecha } from '../../../utils/formato.js'

// Estados en los que el reporte ya no admite cambios (CA4).
const SOLO_LECTURA = ['RESUELTO', 'CERRADO']

// Detalle de un reporte con su conversación (ticket #212).
// El backend no tiene GET /soporte/tickets/{id}: el ticket llega del listado,
// que ya incluye respuestas y asignación actual.
function DetalleTicket({
  abierto = false,
  alCerrar,
  ticket,
  alEditar,
  alEliminar,
}) {
  const respuestas = ticket?.respuestas ?? []
  const soloLectura = SOLO_LECTURA.includes(ticket?.estado)
  // HU-09.3: editar y eliminar solo mientras el reporte siga pendiente.
  const puedeModificar = ticket?.estado === 'ABIERTO'

  return (
    <Dialog open={abierto} onClose={alCerrar} fullWidth maxWidth="sm">
      <DialogoTitulo alCerrar={alCerrar}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Typography sx={{ fontSize: '1.15rem', fontWeight: 700 }}>
            {ticket ? `#${ticket.idTicket} · ${ticket.asunto}` : 'Detalle del reporte'}
          </Typography>
          {ticket?.estado && <EstadoTicket estado={ticket.estado} />}
        </Stack>
      </DialogoTitulo>

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
                    borderRadius: 'var(--radio-md)',
                    backgroundColor: 'var(--color-superficie-suave)',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.25}
                    sx={{ alignItems: 'center', mb: 1 }}
                  >
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--paleta-petroleo)',
                        color: 'var(--paleta-blanco)',
                      }}
                    >
                      {respuesta.iniciales ?? '·'}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                        {respuesta.autor ?? 'Soporte'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'var(--color-texto-terciario)' }}
                      >
                        {respuesta.fechaCreacion
                          ? formatearFecha(respuesta.fechaCreacion)
                          : ''}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body1">{respuesta.mensaje}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      {puedeModificar && (alEditar || alEliminar) && (
        <DialogActions>
          {alEditar && (
            <Button onClick={() => alEditar(ticket)}>Editar</Button>
          )}
          {alEliminar && (
            <Button color="error" onClick={() => alEliminar(ticket)}>
              Eliminar
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  )
}

export default DetalleTicket
