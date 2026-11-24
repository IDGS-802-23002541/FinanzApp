import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import {
  asignarTicket,
  cerrarTicket,
  listarTickets,
  listarTrabajadores,
  responderTicket,
} from '../api.js'
import { formatearFecha } from '../../../utils/formato.js'
import { useAuth } from '../../../hooks/useAuth.js'

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

const AREAS_PERSONAL = {
  ADMIN: 'Administrador',
  TRABAJADOR: 'Trabajador',
}

const FILTROS_INICIALES = {
  estado: '',
  prioridad: '',
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

const sxCabecera = {
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--color-texto-terciario)',
  borderBottom: '1px solid var(--color-borde)',
  whiteSpace: 'nowrap',
}

const sxCelda = {
  borderBottom: '1px solid var(--color-borde)',
  fontSize: '0.875rem',
  color: 'var(--color-texto)',
  py: 1.5,
}

// Bandeja de soporte para admin y trabajador: tabla con filtros (HU-12.1)
// y detalle con respuesta (HU-12.3).
function TicketsAdmin() {
  const { usuario } = useAuth()
  const detalleRef = useRef(null)
  const bajarAlDetalle = useRef(false)
  const [tickets, setTickets] = useState([])
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [recarga, setRecarga] = useState(0)
  const [trabajadores, setTrabajadores] = useState([])
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState('')
  const [cargandoTrabajadores, setCargandoTrabajadores] = useState(true)
  const [asignando, setAsignando] = useState(false)
  const [errorAsignacion, setErrorAsignacion] = useState('')
  const [avisoAsignacion, setAvisoAsignacion] = useState('')
  const [resaltarDetalle, setResaltarDetalle] = useState(false)
  const [porCerrar, setPorCerrar] = useState(false)
  const [cerrando, setCerrando] = useState(false)
  const [errorCierre, setErrorCierre] = useState('')
  const [avisoCierre, setAvisoCierre] = useState(null)

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      setCargando(true)
      setError('')

      try {
        const datos = await listarTickets({
          ...filtros,
          pagina,
          porPagina: 20,
        })
        if (!vigente) return

        setTickets(datos.tickets)
        setTotal(datos.paginacion.total)
        setTotalPaginas(datos.paginacion.totalPaginas)
        setSeleccionadoId((actual) => {
          if (datos.tickets.some((ticket) => ticket.idTicket === actual)) {
            return actual
          }
          return datos.tickets[0]?.idTicket ?? null
        })
      } catch (err) {
        if (!vigente) return
        setTickets([])
        setTotal(0)
        setTotalPaginas(0)
        setError(err.message)
      } finally {
        if (vigente) setCargando(false)
      }
    }

    cargar()
    return () => {
      vigente = false
    }
  }, [filtros, pagina, recarga])

  useEffect(() => {
    let vigente = true

    const cargarTrabajadores = async () => {
      setCargandoTrabajadores(true)
      try {
        const datos = await listarTrabajadores({ porPagina: 100 })
        if (vigente) setTrabajadores(datos.trabajadores ?? [])
      } catch (err) {
        if (vigente) setErrorAsignacion(err.message)
      } finally {
        if (vigente) setCargandoTrabajadores(false)
      }
    }

    cargarTrabajadores()
    return () => {
      vigente = false
    }
  }, [])

  // Solo se baja al detalle cuando el usuario eligió una fila.
  useEffect(() => {
    if (!seleccionadoId || !bajarAlDetalle.current) return
    bajarAlDetalle.current = false
    detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    requestAnimationFrame(() => detalleRef.current?.focus())
  }, [seleccionadoId])

  const seleccionado =
    tickets.find((ticket) => ticket.idTicket === seleccionadoId) ?? null
  const cerrado = seleccionado?.estado === 'CERRADO'
  const respuestas = seleccionado?.respuestas ?? []
  const hayFiltros = Boolean(filtros.estado || filtros.prioridad)
  const asignadoAmi =
    seleccionado?.asignacionActual?.trabajadorId === usuario?.idUsuario

  const destacarDetalle = () => {
    setResaltarDetalle(false)
    requestAnimationFrame(() => setResaltarDetalle(true))
  }

  const abrirDetalle = (idTicket) => {
    setMensaje('')
    setErrorEnvio('')
    setTrabajadorSeleccionado('')
    setErrorAsignacion('')
    setAvisoAsignacion('')
    setErrorCierre('')
    setAvisoCierre(null)
    destacarDetalle()

    if (idTicket === seleccionadoId) {
      detalleRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      detalleRef.current?.focus()
      return
    }

    bajarAlDetalle.current = true
    setSeleccionadoId(idTicket)
  }

  const cambiarFiltro = (campo) => (evento) => {
    setFiltros((actual) => ({ ...actual, [campo]: evento.target.value }))
    setPagina(1)
  }

  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES)
    setPagina(1)
  }

  const asignar = async (trabajadorId) => {
    if (!seleccionado || asignando) return

    setAsignando(true)
    setErrorAsignacion('')
    setAvisoAsignacion('')

    try {
      await asignarTicket(seleccionado.idTicket, {
        trabajadorId,
        idAsignacionActual:
          seleccionado.asignacionActual?.idAsignacion ?? null,
      })
      setTrabajadorSeleccionado('')
      setAvisoAsignacion('Ticket asignado correctamente.')
      setRecarga((actual) => actual + 1)
    } catch (err) {
      setErrorAsignacion(err.message)
      // Si otro tomó el ticket, se recarga para mostrar la asignación real.
      if (err.status === 409) setRecarga((actual) => actual + 1)
    } finally {
      setAsignando(false)
    }
  }

  const cerrar = async () => {
    if (!seleccionado || cerrando) return

    setCerrando(true)
    setErrorCierre('')

    try {
      await cerrarTicket(seleccionado.idTicket)
      setPorCerrar(false)
      setAvisoCierre({
        idTicket: seleccionado.idTicket,
        mensaje: 'Ticket cerrado correctamente.',
      })
      setRecarga((actual) => actual + 1)
    } catch (err) {
      setErrorCierre(err.message)
    } finally {
      setCerrando(false)
    }
  }

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

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{
          alignItems: { xs: 'stretch', md: 'center' },
          flexWrap: 'wrap',
        }}
      >
        <TextField
          select
          size="small"
          label="Estatus"
          value={filtros.estado}
          onChange={cambiarFiltro('estado')}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(ESTADOS).map(([valor, texto]) => (
            <MenuItem key={valor} value={valor}>
              {texto}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Prioridad"
          value={filtros.prioridad}
          onChange={cambiarFiltro('prioridad')}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {Object.entries(PRIORIDADES).map(([valor, texto]) => (
            <MenuItem key={valor} value={valor}>
              {texto}
            </MenuItem>
          ))}
        </TextField>

        <Button
          onClick={limpiarFiltros}
          disabled={!hayFiltros}
          sx={sxBoton}
        >
          Limpiar filtros
        </Button>

        <Box sx={{ flex: 1 }} />

        <Typography
          sx={{ fontSize: '0.8125rem', color: 'var(--color-texto-terciario)' }}
        >
          {total} {total === 1 ? 'ticket' : 'tickets'}
        </Typography>
      </Stack>

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

      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--color-borde)',
          borderRadius: '16px',
          backgroundColor: 'var(--color-superficie)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...sxCabecera, width: 90 }}>Folio</TableCell>
                <TableCell sx={sxCabecera}>Asunto</TableCell>
                <TableCell sx={sxCabecera}>Cliente</TableCell>
                <TableCell sx={{ ...sxCabecera, width: 150 }}>Estatus</TableCell>
                <TableCell sx={sxCabecera}>Asignado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 6, border: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 5, border: 0 }}>
                    <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          color: 'var(--color-texto-secundario)',
                          textAlign: 'center',
                        }}
                      >
                        {hayFiltros
                          ? 'No hay tickets que coincidan con los filtros.'
                          : 'No hay tickets para mostrar.'}
                      </Typography>
                      {hayFiltros && (
                        <Button size="small" onClick={limpiarFiltros}>
                          Limpiar filtros
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => {
                  const activo = ticket.idTicket === seleccionadoId
                  return (
                    <TableRow
                      key={ticket.idTicket}
                      hover
                      selected={activo}
                      onClick={() => abrirDetalle(ticket.idTicket)}
                      sx={{
                        cursor: 'pointer',
                        '&.Mui-selected': {
                          backgroundColor: 'var(--color-superficie-suave)',
                        },
                        '&.Mui-selected:hover': {
                          backgroundColor: 'var(--color-superficie-suave)',
                        },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={{ ...sxCelda, fontWeight: 700 }}>
                        #{ticket.idTicket}
                      </TableCell>
                      <TableCell sx={sxCelda}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: 'var(--color-texto)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 320,
                          }}
                        >
                          {ticket.asunto}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          ...sxCelda,
                          color: 'var(--color-texto-secundario)',
                        }}
                      >
                        {ticket.cliente || '—'}
                      </TableCell>
                      <TableCell sx={sxCelda}>
                        <Chip
                          size="small"
                          label={ESTADOS[ticket.estado] ?? ticket.estado}
                          sx={{
                            backgroundColor: 'var(--color-superficie-suave)',
                            color: 'var(--color-texto-secundario)',
                            fontWeight: 600,
                            border: '1px solid var(--color-borde)',
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          ...sxCelda,
                          color: 'var(--color-texto-secundario)',
                        }}
                      >
                        {ticket.asignado || 'Sin asignar'}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {totalPaginas > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPaginas}
            page={pagina}
            onChange={(_evento, valor) => setPagina(valor)}
            size="small"
          />
        </Box>
      )}

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
          ref={detalleRef}
          tabIndex={-1}
          onAnimationEnd={() => setResaltarDetalle(false)}
          sx={{
            border: '1px solid var(--color-borde)',
            borderRadius: '16px',
            backgroundColor: 'var(--color-superficie)',
            p: 2.5,
            scrollMarginTop: 24,
            '&:focus': { outline: 'none' },
            animation: resaltarDetalle
              ? 'destacarDetalle 2.2s ease-out'
              : 'none',
            '@keyframes destacarDetalle': {
              '0%': {
                borderColor: 'var(--color-resaltado)',
                boxShadow:
                  '0 0 0 4px color-mix(in srgb, var(--color-resaltado) 30%, transparent)',
              },
              '100%': {
                borderColor: 'var(--color-borde)',
                boxShadow:
                  '0 0 0 0 color-mix(in srgb, var(--color-resaltado) 0%, transparent)',
              },
            },
          }}
        >
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-texto-terciario)',
            }}
          >
            Detalle del ticket y respuesta
          </Typography>
          <Typography
            sx={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-texto)',
              mt: 0.5,
            }}
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
              label={
                CATEGORIAS[seleccionado.categoria] ?? seleccionado.categoria
              }
              variant="outlined"
            />
            <Chip
              size="small"
              label={
                PRIORIDADES[seleccionado.prioridad] ?? seleccionado.prioridad
              }
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

          <Box
            sx={{
              mt: 2.5,
              p: 2,
              border: '1px solid var(--color-borde)',
              borderRadius: '12px',
              backgroundColor: 'var(--color-superficie-suave)',
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              sx={{
                alignItems: { xs: 'stretch', md: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: 'var(--color-texto-secundario)',
                }}
              >
                Asignado a:{' '}
                <Box
                  component="span"
                  sx={{ fontWeight: 700, color: 'var(--color-texto)' }}
                >
                  {seleccionado.asignado || 'Sin asignar'}
                </Box>
                {asignadoAmi && ' (tú)'}
              </Typography>

              <Button
                size="small"
                variant="outlined"
                onClick={() => asignar()}
                disabled={asignando || asignadoAmi || cerrado}
                sx={sxBoton}
              >
                {asignadoAmi ? 'Ya es tuyo' : 'Tomar ticket'}
              </Button>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ mt: 1.5, alignItems: { xs: 'stretch', sm: 'center' } }}
            >
              <TextField
                select
                size="small"
                label="Asignar a otro trabajador"
                value={trabajadorSeleccionado}
                onChange={(evento) =>
                  setTrabajadorSeleccionado(evento.target.value)
                }
                disabled={asignando || cerrado || cargandoTrabajadores}
                sx={{ minWidth: 260, flex: 1 }}
                helperText={
                  cargandoTrabajadores
                    ? 'Cargando trabajadores…'
                    : trabajadores.length === 0
                      ? 'No hay trabajadores activos.'
                      : ' '
                }
              >
                {trabajadores.map((trabajador) => (
                  <MenuItem
                    key={trabajador.idUsuario}
                    value={String(trabajador.idUsuario)}
                  >
                    {trabajador.nombre} ·{' '}
                    {AREAS_PERSONAL[trabajador.rolGlobal] ??
                      trabajador.rolGlobal}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                size="small"
                variant="contained"
                onClick={() => asignar(Number(trabajadorSeleccionado))}
                disabled={
                  asignando || cerrado || !trabajadorSeleccionado.trim()
                }
                sx={sxBoton}
              >
                Asignar
              </Button>
            </Stack>

            {errorAsignacion && (
              <Alert severity="warning" sx={{ mt: 1.5 }}>
                {errorAsignacion}
              </Alert>
            )}
            {avisoAsignacion && (
              <Alert severity="success" sx={{ mt: 1.5 }}>
                {avisoAsignacion}
              </Alert>
            )}
          </Box>

          {!cerrado && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  setErrorCierre('')
                  setPorCerrar(true)
                }}
                disabled={cerrando}
                sx={sxBoton}
              >
                Cerrar ticket
              </Button>
            </Box>
          )}

          {avisoCierre?.idTicket === seleccionado.idTicket && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {avisoCierre.mensaje}
            </Alert>
          )}

          <Divider sx={{ my: 2.5 }} />

          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--color-texto)',
            }}
          >
            Conversación
          </Typography>

          {respuestas.length === 0 ? (
            <Typography
              sx={{
                mt: 1.5,
                fontSize: '0.8125rem',
                color: 'var(--color-texto-terciario)',
              }}
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

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
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

      <Dialog
        open={porCerrar}
        onClose={() => {
          if (!cerrando) setPorCerrar(false)
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Cerrar ticket</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Cerrar el ticket #{seleccionado?.idTicket}? Ya no admitirá más
            respuestas.
          </DialogContentText>
          {errorCierre && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorCierre}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPorCerrar(false)}
            disabled={cerrando}
            sx={sxBoton}
          >
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={cerrar}
            disabled={cerrando}
            sx={sxBoton}
          >
            {cerrando ? 'Cerrando…' : 'Cerrar ticket'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default TicketsAdmin
