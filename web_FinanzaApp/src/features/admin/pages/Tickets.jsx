import { useEffect, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { listarTickets, responderTicket } from '../api.js'
import { formatearFecha } from '../../../utils/formato.js'

const ESTADOS = {
  ABIERTO: 'Abierto',
  EN_PROCESO: 'En proceso',
  ESPERA: 'En espera',
  RESUELTO: 'Resuelto',
  CERRADO: 'Cerrado',
}

const CATEGORIAS = {
  GENERAL: 'General',
  CUENTA: 'Cuenta',
  CARTERA: 'Cartera',
  PAGOS: 'Pagos',
  ERROR: 'Error',
  OTRO: 'Otro',
}

const PRIORIDADES = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
}

const sxBoton = {
  minHeight: 0,
  py: 0.75,
  px: 2,
  borderRadius: '12px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
}

// Bandeja de soporte: lista de tickets y respuesta con hilo (HU-12.3).
function TicketsAdmin() {
  const [tickets, setTickets] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      setCargando(true)
      setError('')

      try {
        const datos = await listarTickets({ pagina, porPagina: 20 })
        if (!vigente) return

        setTickets(datos.tickets)
        setTotalPaginas(datos.paginacion.totalPaginas)
        setSeleccionadoId((actual) => {
          if (datos.tickets.some((ticket) => ticket.idTicket === actual)) {
            return actual
          }
          return datos.tickets[0]?.idTicket ?? null
        })
      } catch (err) {
        if (vigente) setError(err.message)
      } finally {
        if (vigente) setCargando(false)
      }
    }

    cargar()
    return () => {
      vigente = false
    }
  }, [pagina, recarga])

  const seleccionado =
    tickets.find((ticket) => ticket.idTicket === seleccionadoId) ?? null
  const cerrado = seleccionado?.estado === 'CERRADO'
  const respuestas = seleccionado?.respuestas ?? []

  const enviarRespuesta = async (evento) => {
    evento.preventDefault()
    if (!seleccionado || cerrado) return

    const texto = mensaje.trim()
    if (!texto) {
      setErrorEnvio('Escribe la respuesta.')
      return
    }

    setEnviando(true)
    setErrorEnvio('')

    try {
      await responderTicket(seleccionado.idTicket, texto)
      setMensaje('')
      setRecarga((actual) => actual + 1)
    } catch (err) {
      setErrorEnvio(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h1">Tickets de soporte</Typography>
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: 'var(--color-texto-terciario)',
            mt: 0.5,
          }}
        >
          Revisa las solicitudes de los clientes y responde desde aquí.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setRecarga((actual) => actual + 1)}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.4fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        <Box>
          <Box
            sx={{
              border: '1px solid var(--color-borde)',
              borderRadius: '16px',
              backgroundColor: 'var(--color-superficie)',
              overflow: 'hidden',
            }}
          >
            {cargando ? (
              <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} />
              </Box>
            ) : tickets.length === 0 ? (
              <Typography
                sx={{
                  p: 4,
                  fontSize: '0.875rem',
                  color: 'var(--color-texto-secundario)',
                  textAlign: 'center',
                }}
              >
                No hay tickets para mostrar.
              </Typography>
            ) : (
              tickets.map((ticket, indice) => {
                const activo = ticket.idTicket === seleccionadoId
                return (
                  <ButtonBase
                    key={ticket.idTicket}
                    onClick={() => {
                      setSeleccionadoId(ticket.idTicket)
                      setMensaje('')
                      setErrorEnvio('')
                    }}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      textAlign: 'left',
                      p: 2,
                      gap: 0.75,
                      borderBottom:
                        indice === tickets.length - 1
                          ? 'none'
                          : '1px solid var(--color-borde)',
                      backgroundColor: activo
                        ? 'var(--color-superficie-suave)'
                        : 'transparent',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: 'var(--color-texto)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ticket.asunto}
                      </Typography>
                      <Chip
                        size="small"
                        label={ESTADOS[ticket.estado] ?? ticket.estado}
                        sx={{
                          backgroundColor: 'var(--color-superficie)',
                          color: 'var(--color-texto-secundario)',
                          fontWeight: 600,
                          border: '1px solid var(--color-borde)',
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: 'var(--color-texto-terciario)',
                      }}
                    >
                      #{ticket.idTicket} · {formatearFecha(ticket.fechaCreacion)}
                    </Typography>
                  </ButtonBase>
                )
              })
            )}
          </Box>

          {totalPaginas > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPaginas}
                page={pagina}
                onChange={(_evento, valor) => setPagina(valor)}
                size="small"
              />
            </Box>
          )}
        </Box>

        {!seleccionado ? (
          <Box
            sx={{
              p: 4,
              border: '1px dashed var(--color-borde-fuerte)',
              borderRadius: '16px',
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{ fontSize: '0.875rem', color: 'var(--color-texto-secundario)' }}
            >
              Selecciona un ticket para ver su conversación.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              border: '1px solid var(--color-borde)',
              borderRadius: '16px',
              backgroundColor: 'var(--color-superficie)',
              p: 2.5,
            }}
          >
            <Typography
              sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-texto)' }}
            >
              {seleccionado.asunto}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 1.5 }}>
              <Chip
                size="small"
                label={ESTADOS[seleccionado.estado] ?? seleccionado.estado}
              />
              <Chip
                size="small"
                label={CATEGORIAS[seleccionado.categoria] ?? seleccionado.categoria}
                variant="outlined"
              />
              <Chip
                size="small"
                label={PRIORIDADES[seleccionado.prioridad] ?? seleccionado.prioridad}
                variant="outlined"
              />
              <Typography
                sx={{
                  alignSelf: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--color-texto-terciario)',
                }}
              >
                {formatearFecha(seleccionado.fechaCreacion)}
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 2,
                fontSize: '0.875rem',
                color: 'var(--color-texto-secundario)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {seleccionado.descripcion}
            </Typography>

            <Divider sx={{ my: 2.5 }} />

            <Typography
              sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-texto)' }}
            >
              Conversación
            </Typography>

            {respuestas.length === 0 ? (
              <Typography
                sx={{ mt: 1.5, fontSize: '0.8125rem', color: 'var(--color-texto-terciario)' }}
              >
                Aún no hay respuestas.
              </Typography>
            ) : (
              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                {respuestas.map((respuesta) => (
                  <Box
                    key={respuesta.idRespuesta}
                    sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-primario)',
                        color: 'var(--color-sobre-primario)',
                      }}
                    >
                      {respuesta.iniciales || 'S'}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: 'var(--color-texto)',
                        }}
                      >
                        {respuesta.autor || 'Soporte'}
                        <Box
                          component="span"
                          sx={{
                            ml: 1,
                            fontWeight: 400,
                            color: 'var(--color-texto-terciario)',
                          }}
                        >
                          {formatearFecha(respuesta.fechaCreacion)}
                        </Box>
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.25,
                          fontSize: '0.875rem',
                          color: 'var(--color-texto-secundario)',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {respuesta.mensaje}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}

            <Divider sx={{ my: 2.5 }} />

            {cerrado ? (
              <Alert severity="info">
                El ticket está cerrado; ya no admite respuestas.
              </Alert>
            ) : (
              <Box component="form" noValidate onSubmit={enviarRespuesta}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Respuesta para el cliente"
                  value={mensaje}
                  onChange={(evento) => {
                    setMensaje(evento.target.value)
                    setErrorEnvio('')
                  }}
                  disabled={enviando}
                  error={Boolean(errorEnvio)}
                  helperText={errorEnvio}
                />

                <Box
                  sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={enviando || !mensaje.trim()}
                    sx={sxBoton}
                  >
                    {enviando ? 'Enviando…' : 'Enviar respuesta'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Stack>
  )
}

export default TicketsAdmin
