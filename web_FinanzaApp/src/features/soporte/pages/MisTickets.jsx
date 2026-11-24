import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Pagination,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import FormularioTicket from '../components/FormularioTicket.jsx'
import DetalleTicket from '../components/DetalleTicket.jsx'
import DialogoEditarTicket from '../components/DialogoEditarTicket.jsx'
import EstadoTicket from '../components/EstadoTicket.jsx'
import { eliminarTicket, listarTickets } from '../api.js'
import { formatearFecha } from '../../../utils/formato.js'

const FILTROS = [
  { valor: '', texto: 'Todos' },
  { valor: 'ABIERTO', texto: 'Pendiente' },
  { valor: 'EN_PROCESO', texto: 'En proceso' },
  { valor: 'ESPERA', texto: 'En espera' },
  { valor: 'RESUELTO', texto: 'Resuelto' },
  { valor: 'CERRADO', texto: 'Cerrado' },
]

const POR_PAGINA = 10

const estiloPapel = {
  p: 3,
  border: '1px solid var(--color-borde)',
  borderRadius: '16px',
  backgroundColor: 'var(--color-superficie)',
}

// Pantalla de soporte del cliente: alta, seguimiento, edición y baja
// de reportes pendientes (tickets #208, #212 y #288).
function MisTickets() {
  const [filtro, setFiltro] = useState('')
  const [pagina, setPagina] = useState(1)
  const [tickets, setTickets] = useState([])
  const [paginacion, setPaginacion] = useState({ total: 0, totalPaginas: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recarga, setRecarga] = useState(0)
  const [seleccionado, setSeleccionado] = useState(null)
  const [editando, setEditando] = useState(null)
  const [borrando, setBorrando] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    let vigente = true

    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const datos = await listarTickets({
          estado: filtro,
          pagina,
          porPagina: POR_PAGINA,
        })
        if (!vigente) return
        setTickets(datos.tickets ?? [])
        setPaginacion(datos.paginacion ?? { total: 0, totalPaginas: 0 })
      } catch (fallo) {
        if (!vigente) return
        setTickets([])
        setPaginacion({ total: 0, totalPaginas: 0 })
        setError(fallo.message || 'No se pudieron obtener tus reportes.')
      } finally {
        if (vigente) setCargando(false)
      }
    }

    cargar()
    return () => {
      vigente = false
    }
  }, [filtro, pagina, recarga])

  const cambiarFiltro = (valor) => {
    setFiltro(valor)
    setPagina(1)
  }

  const alCrear = () => {
    setFiltro('')
    setPagina(1)
    setRecarga((actual) => actual + 1)
  }

  const abrirEdicion = (ticket) => {
    setSeleccionado(null)
    setEditando(ticket)
  }

  const alGuardarEdicion = (actualizado) => {
    setEditando(null)
    setAviso({
      severidad: 'success',
      texto: `El reporte #${actualizado.idTicket} se actualizó.`,
    })
    setRecarga((actual) => actual + 1)
  }

  const confirmarBorrado = async () => {
    if (!borrando || eliminando) return

    setEliminando(true)
    try {
      await eliminarTicket(borrando.idTicket)
      setAviso({
        severidad: 'success',
        texto: `El reporte #${borrando.idTicket} se eliminó.`,
      })
      setBorrando(null)
      // Si era el último de la página, retrocede para no quedar en una vacía.
      if (tickets.length === 1 && pagina > 1) setPagina(pagina - 1)
      else setRecarga((actual) => actual + 1)
    } catch (fallo) {
      setAviso({
        severidad: 'error',
        texto: fallo.message || 'No se pudo eliminar el reporte.',
      })
    } finally {
      setEliminando(false)
    }
  }

  const mensajeVacio =
    filtro === ''
      ? 'Aún no tienes reportes. Crea uno con el formulario de arriba.'
      : 'No tienes reportes con ese estado.'

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h1">Soporte</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-texto-terciario)' }}>
          Reporta un problema y da seguimiento a tus solicitudes.
        </Typography>
      </Box>

      <Paper elevation={0} sx={estiloPapel}>
        <FormularioTicket alCrear={alCrear} />
      </Paper>

      <Box>
        <Typography variant="h2" sx={{ mb: 1.5 }}>
          Mis reportes
        </Typography>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {FILTROS.map((opcion) => (
            <Chip
              key={opcion.valor || 'todos'}
              label={opcion.texto}
              clickable
              onClick={() => cambiarFiltro(opcion.valor)}
              variant={filtro === opcion.valor ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Stack>
      </Box>

      <Paper elevation={0} sx={estiloPapel}>
        {cargando && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!cargando && error && (
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

        {!cargando && !error && tickets.length === 0 && (
          <Typography variant="body2" sx={{ color: 'var(--color-texto-terciario)' }}>
            {mensajeVacio}
          </Typography>
        )}

        {!cargando && !error && tickets.length > 0 && (
          <Stack spacing={1.5}>
            {tickets.map((ticket) => (
              <Box
                key={ticket.idTicket}
                onClick={() => setSeleccionado(ticket)}
                sx={{
                  p: 2,
                  border: '1px solid var(--color-borde)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 120ms ease',
                  '&:hover': { backgroundColor: 'var(--color-superficie-suave)' },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    #{ticket.idTicket} · {ticket.asunto}
                  </Typography>
                  <EstadoTicket estado={ticket.estado} />
                </Stack>

                <Typography
                  variant="body2"
                  sx={{ color: 'var(--color-texto-terciario)', mt: 0.5 }}
                >
                  {ticket.fechaCreacion
                    ? `${formatearFecha(ticket.fechaCreacion)} · `
                    : ''}
                  {ticket.respuestas?.length ?? 0} respuesta(s)
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        {!cargando && !error && paginacion.totalPaginas > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={paginacion.totalPaginas}
              page={pagina}
              onChange={(_evento, nueva) => setPagina(nueva)}
              color="primary"
              size="small"
            />
          </Box>
        )}
      </Paper>

      <DetalleTicket
        abierto={Boolean(seleccionado)}
        alCerrar={() => setSeleccionado(null)}
        ticket={seleccionado}
        alEditar={abrirEdicion}
        alEliminar={setBorrando}
      />

      <DialogoEditarTicket
        key={editando?.idTicket}
        abierto={Boolean(editando)}
        ticket={editando}
        alCerrar={() => setEditando(null)}
        alGuardar={alGuardarEdicion}
      />

      <Dialog
        open={Boolean(borrando)}
        onClose={() => (eliminando ? null : setBorrando(null))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar reporte</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que quieres eliminar el reporte #{borrando?.idTicket}? Esta
            acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBorrando(null)} disabled={eliminando}>
            Cancelar
          </Button>
          <Button color="error" onClick={confirmarBorrado} disabled={eliminando}>
            {eliminando ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={4000}
        onClose={() => setAviso(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={aviso?.severidad ?? 'success'}
          onClose={() => setAviso(null)}
          variant="filled"
        >
          {aviso?.texto}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default MisTickets
