import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
import EncabezadoPagina from '../../../components/ui/EncabezadoPagina.jsx'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'
import {
  IconoFlechaDerecha,
  IconoMas,
  IconoPersonas,
} from '../../../components/ui/Iconos.jsx'
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

// Textos visibles de la categoría; el backend usa enums en mayúsculas.
const CATEGORIAS = {
  GENERAL: 'General',
  CUENTA: 'Mi cuenta',
  CARTERA: 'Carteras',
  PAGOS: 'Pagos',
  ERROR: 'Error de la aplicación',
  OTRO: 'Otro',
}

const POR_PAGINA = 10

const estiloPapel = {
  p: 3,
  border: '1px solid var(--color-borde)',
  borderRadius: 'var(--radio-lg)',
  backgroundColor: 'var(--color-superficie)',
}

// Pantalla de soporte del cliente: alta, seguimiento, edición y baja de
// reportes (tickets #208, #212 y #288).
function MisTickets() {
  const [filtro, setFiltro] = useState('')
  const [pagina, setPagina] = useState(1)
  const [tickets, setTickets] = useState([])
  const [paginacion, setPaginacion] = useState({ total: 0, totalPaginas: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recarga, setRecarga] = useState(0)
  const [formularioAbierto, setFormularioAbierto] = useState(false)
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

  const alCrear = (ticket) => {
    setFormularioAbierto(false)
    setAviso({
      severidad: 'success',
      texto: ticket?.idTicket
        ? `El reporte #${ticket.idTicket} se creó. Ya puedes seguirlo aquí.`
        : 'Tu reporte se creó correctamente.',
    })
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
      ? 'Aún no tienes reportes. Cuéntanos si algo no funciona o tienes una duda.'
      : 'No tienes reportes con ese estado.'

  const desde = paginacion.total === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1
  const hasta = Math.min(pagina * POR_PAGINA, paginacion.total)

  return (
    <Stack spacing={3}>
      <EncabezadoPagina
        titulo="Soporte"
        descripcion="Reporta un problema y da seguimiento a tus solicitudes."
      >
        <Button
          variant="contained"
          startIcon={<IconoMas sx={{ fontSize: 16 }} />}
          onClick={() => setFormularioAbierto(true)}
        >
          Nuevo reporte
        </Button>
      </EncabezadoPagina>

      <Box>
        <Typography variant="h2" sx={{ mb: 1.5 }}>
          Mis reportes
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1 }}>
            {FILTROS.map((opcion) => {
              const activo = filtro === opcion.valor

              return (
                <Button
                  key={opcion.valor || 'todos'}
                  size="small"
                  variant={activo ? 'contained' : 'outlined'}
                  onClick={() => cambiarFiltro(opcion.valor)}
                  sx={{
                    height: 'var(--altura-control-sm)',
                    px: 2,
                    borderRadius: 'var(--radio-pill)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    borderColor: activo
                      ? 'var(--color-primario)'
                      : 'var(--color-borde)',
                    backgroundColor: activo
                      ? 'var(--color-primario)'
                      : 'var(--color-superficie)',
                    color: activo
                      ? 'var(--color-sobre-primario)'
                      : 'var(--color-texto-secundario)',
                  }}
                >
                  {opcion.texto}
                </Button>
              )
            })}
          </Stack>

          {!cargando && !error && (
            <Typography
              sx={{ fontSize: '0.8125rem', color: 'var(--color-texto-secundario)' }}
            >
              {paginacion.total === 1
                ? '1 reporte'
                : `${paginacion.total} reportes`}
            </Typography>
          )}
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
          <Stack
            spacing={2}
            sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'var(--color-superficie-suave)',
                color: 'var(--color-texto-secundario)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconoPersonas sx={{ fontSize: 22 }} />
            </Box>
            <Typography
              sx={{ maxWidth: 380, fontSize: '0.875rem', color: 'var(--color-texto-secundario)' }}
            >
              {mensajeVacio}
            </Typography>
            {filtro === '' ? (
              <Button
                variant="contained"
                startIcon={<IconoMas sx={{ fontSize: 16 }} />}
                onClick={() => setFormularioAbierto(true)}
              >
                Nuevo reporte
              </Button>
            ) : (
              <Button variant="outlined" onClick={() => cambiarFiltro('')}>
                Ver todos
              </Button>
            )}
          </Stack>
        )}

        {!cargando && !error && tickets.length > 0 && (
          <Stack spacing={1.5}>
            {tickets.map((ticket) => (
              <ButtonBase
                key={ticket.idTicket}
                onClick={() => setSeleccionado(ticket)}
                aria-label={`Abrir el reporte ${ticket.idTicket}: ${ticket.asunto}`}
                sx={{
                  display: 'block',
                  width: '100%',
                  p: 2,
                  textAlign: 'left',
                  border: '1px solid var(--color-borde)',
                  borderRadius: 'var(--radio-md)',
                  transition: 'background-color 120ms ease, border-color 120ms ease',
                  '&:hover': {
                    backgroundColor: 'var(--color-superficie-suave)',
                    borderColor: 'var(--color-borde-fuerte)',
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center' }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}
                    >
                      #{ticket.idTicket} · {ticket.asunto}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.75 }}
                    >
                      <EstadoTicket estado={ticket.estado} />
                      <Chip
                        size="small"
                        label={CATEGORIAS[ticket.categoria] ?? ticket.categoria}
                        sx={{
                          backgroundColor: 'var(--color-superficie-suave)',
                          color: 'var(--color-texto-secundario)',
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: 'var(--color-texto-terciario)',
                        }}
                      >
                        {ticket.fechaCreacion
                          ? formatearFecha(ticket.fechaCreacion)
                          : ''}
                        {` · ${ticket.respuestas?.length ?? 0} respuesta(s)`}
                      </Typography>
                    </Stack>
                  </Box>

                  <IconoFlechaDerecha
                    sx={{ fontSize: 18, color: 'var(--color-texto-terciario)' }}
                  />
                </Stack>
              </ButtonBase>
            ))}
          </Stack>
        )}

        {!cargando && !error && paginacion.totalPaginas > 1 && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              mt: 2.5,
            }}
          >
            <Typography
              sx={{ fontSize: '0.8125rem', color: 'var(--color-texto-secundario)' }}
            >
              Mostrando {desde}–{hasta} de {paginacion.total}
            </Typography>
            <Pagination
              count={paginacion.totalPaginas}
              page={pagina}
              onChange={(_evento, nueva) => setPagina(nueva)}
              color="primary"
              size="small"
            />
          </Stack>
        )}
      </Paper>

      <Dialog
        open={formularioAbierto}
        onClose={() => setFormularioAbierto(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogoTitulo alCerrar={() => setFormularioAbierto(false)}>
          Nuevo reporte
        </DialogoTitulo>
        <DialogContent dividers>
          <FormularioTicket alCrear={alCrear} />
        </DialogContent>
      </Dialog>

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
        <DialogoTitulo alCerrar={() => setBorrando(null)}>
          Eliminar reporte
        </DialogoTitulo>
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
