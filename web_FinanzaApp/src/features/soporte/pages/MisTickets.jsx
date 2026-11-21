import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Pagination,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import FormularioTicket from '../components/FormularioTicket.jsx'
import DetalleTicket from '../components/DetalleTicket.jsx'
import EstadoTicket from '../components/EstadoTicket.jsx'
import { listarTickets } from '../api.js'
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

// Pantalla de soporte del cliente: alta de reportes y seguimiento (tickets #208 y #212).
function MisTickets() {
  const [filtro, setFiltro] = useState('')
  const [pagina, setPagina] = useState(1)
  const [tickets, setTickets] = useState([])
  const [paginacion, setPaginacion] = useState({ total: 0, totalPaginas: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recarga, setRecarga] = useState(0)
  const [seleccionado, setSeleccionado] = useState(null)

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
      />
    </Stack>
  )
}

export default MisTickets
