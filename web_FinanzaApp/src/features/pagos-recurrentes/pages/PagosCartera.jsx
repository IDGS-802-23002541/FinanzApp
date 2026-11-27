import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { listarCategorias } from '../../carteras/api.js'
import { eliminarPago, listarPagos, marcarPagoHecho } from '../api.js'
import { formatearFecha, formatearMonto } from '../../../utils/formato.js'
import DialogoNuevoPago from '../components/DialogoNuevoPago.jsx'
import { IconoCheck, IconoMas } from '../../../components/ui/Iconos.jsx'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'

const COLUMNAS = [
  'Concepto',
  'Categoría',
  'Monto',
  'Frecuencia',
  'Próximo vencimiento',
  'Estado',
]

// El backend devuelve el enum; la tabla y las tarjetas muestran el texto.
const FRECUENCIAS_TEXTO = {
  DIARIO: 'Diario',
  SEMANAL: 'Semanal',
  QUINCENAL: 'Quincenal',
  MENSUAL: 'Mensual',
  ANUAL: 'Anual',
}

const textoFrecuencia = (frecuencia) =>
  FRECUENCIAS_TEXTO[frecuencia] ?? frecuencia

const sxBoton = {
  px: 2,
  borderRadius: 'var(--radio-md)',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
}

function hoyISO() {
  const ahora = new Date()
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

// Vence hoy o antes -> se puede marcar como hecho.
function venceHoyOAntes(fecha, hoy) {
  if (!fecha) return true
  return String(fecha).slice(0, 10) <= hoy
}

// Pagos recurrentes de una cartera (HU-07.1).
function PagosCartera() {
  const { cartera, id } = useOutletContext()
  const tema = useTheme()
  const esMovil = useMediaQuery(tema.breakpoints.down('md'))
  const [pagos, setPagos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [porEliminar, setPorEliminar] = useState(null)
  const [errorEliminar, setErrorEliminar] = useState('')
  const [eliminando, setEliminando] = useState(false)
  const [marcandoId, setMarcandoId] = useState(null)
  const [aviso, setAviso] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [recarga, setRecarga] = useState(0)

  const esPropietario = cartera?.rol === 'Propietario'
  const columnas = esPropietario ? [...COLUMNAS, 'Acciones'] : COLUMNAS

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      setCargando(true)
      setError('')

      try {
        const [datos, listaCategorias] = await Promise.all([
          listarPagos(id),
          listarCategorias(id, 'GASTO'),
        ])
        if (!vigente) return
        setPagos(datos.pagos)
        setCategorias(listaCategorias)
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
  }, [id, recarga])

  const nombreCategoria = (categoriaId) =>
    categorias.find((categoria) => categoria.idCategoria === categoriaId)?.nombre ??
    'Sin categoría'

  const hoy = hoyISO()

  const manejarGuardado = () => {
    setDialogoAbierto(false)
    setEditando(null)
    setRecarga((actual) => actual + 1)
  }

  const abrirEliminar = (pago) => {
    setErrorEliminar('')
    setPorEliminar(pago)
  }

  const marcarHecho = async (pago) => {
    if (marcandoId != null) return

    setMarcandoId(pago.id)
    setErrorAccion('')
    setAviso('')

    try {
      await marcarPagoHecho(pago.id)
      setAviso(`Pago “${pago.nombre}” marcado como hecho.`)
      setRecarga((actual) => actual + 1)
    } catch (err) {
      setErrorAccion(err.message)
    } finally {
      setMarcandoId(null)
    }
  }

  const confirmarEliminar = async () => {
    setEliminando(true)
    setErrorEliminar('')

    try {
      await eliminarPago(porEliminar.id)
      setPorEliminar(null)
      setRecarga((actual) => actual + 1)
    } catch (err) {
      setErrorEliminar(err.message)
    } finally {
      setEliminando(false)
    }
  }

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h2">Pagos recurrentes</Typography>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: 'var(--color-texto-terciario)',
              mt: 0.5,
            }}
          >
            Registra los pagos fijos de esta cartera y consulta su próximo
            vencimiento.
          </Typography>
        </Box>

        {esPropietario && (
          <Button
            variant="contained"
            startIcon={<IconoMas sx={{ fontSize: 16 }} />}
            onClick={() => setDialogoAbierto(true)}
            sx={sxBoton}
          >
            Nuevo pago
          </Button>
        )}
      </Box>

      {aviso && (
        <Alert severity="success" onClose={() => setAviso('')}>
          {aviso}
        </Alert>
      )}

      {errorAccion && (
        <Alert severity="error" onClose={() => setErrorAccion('')}>
          {errorAccion}
        </Alert>
      )}

      {cargando ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={32} />
        </Box>
      ) : error ? (
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
      ) : pagos.length === 0 ? (
        <Box
          sx={{
            py: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            border: '1px dashed var(--color-borde-fuerte)',
            borderRadius: 'var(--radio-lg)',
          }}
        >
          <Typography
            sx={{ fontSize: '0.875rem', color: 'var(--color-texto-secundario)' }}
          >
            Aún no hay pagos recurrentes en esta cartera.
          </Typography>
          {esPropietario && (
            <Button
              variant="contained"
              startIcon={<IconoMas sx={{ fontSize: 16 }} />}
              onClick={() => setDialogoAbierto(true)}
              sx={sxBoton}
            >
              Registrar el primero
            </Button>
          )}
        </Box>
      ) : esMovil ? (
        /* En móvil cada pago recurrente se lee como tarjeta. */
        <Stack spacing={1.25}>
          {pagos.map((pago) => (
            <Box
              key={pago.id}
              sx={{
                p: 2,
                border: '1px solid var(--color-borde)',
                borderRadius: 'var(--radio-lg)',
                backgroundColor: 'var(--color-superficie)',
              }}
            >
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 700 }}>
                    {pago.nombre}
                  </Typography>
                  <Typography
                    sx={{ mt: 0.25, fontSize: '0.75rem', color: 'var(--color-texto-terciario)' }}
                  >
                    {nombreCategoria(pago.categoriaId)} · {textoFrecuencia(pago.frecuencia)}
                  </Typography>
                  <Typography
                    sx={{ fontSize: '0.75rem', color: 'var(--color-texto-terciario)' }}
                  >
                    {pago.proximaEjecucion
                      ? `Próximo: ${formatearFecha(pago.proximaEjecucion)}`
                      : 'Sin fecha'}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                  {formatearMonto(pago.monto)}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                sx={{ alignItems: 'center', gap: 1, mt: 1.5, flexWrap: 'wrap' }}
              >
                <Chip
                  label={
                    pago.estado === 'Pendiente' &&
                    !venceHoyOAntes(pago.proximaEjecucion, hoy)
                      ? 'Programado'
                      : pago.estado
                  }
                  size="small"
                  sx={{
                    backgroundColor: 'var(--color-superficie-suave)',
                    color:
                      pago.estado === 'Pendiente' &&
                      venceHoyOAntes(pago.proximaEjecucion, hoy)
                        ? 'var(--color-primario)'
                        : 'var(--color-texto-secundario)',
                    fontWeight: 600,
                  }}
                />
                <Box sx={{ flex: 1 }} />
                {esPropietario && pago.estado !== 'Cancelado' && (
                  <>
                    {pago.estado === 'Pendiente' && (
                      <Tooltip
                        title={
                          !venceHoyOAntes(pago.proximaEjecucion, hoy)
                            ? `Disponible el ${formatearFecha(pago.proximaEjecucion)}`
                            : ''
                        }
                      >
                        <span>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => marcarHecho(pago)}
                            disabled={
                              marcandoId === pago.id ||
                              !venceHoyOAntes(pago.proximaEjecucion, hoy)
                            }
                            sx={sxBoton}
                          >
                            {marcandoId === pago.id ? 'Marcando…' : 'Marcar'}
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                    <Button size="small" onClick={() => setEditando(pago)} sx={sxBoton}>
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => abrirEliminar(pago)}
                      sx={sxBoton}
                    >
                      Eliminar
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <TableContainer
          sx={{
            border: '1px solid var(--color-borde)',
            borderRadius: 'var(--radio-lg)',
            backgroundColor: 'var(--color-superficie)',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                {columnas.map((columna) => (
                  <TableCell
                    key={columna}
                    align={columna === 'Monto' ? 'right' : 'left'}
                    sx={{
                      fontWeight: 700,
                      color: 'var(--color-texto-secundario)',
                      backgroundColor: 'var(--color-superficie-suave)',
                    }}
                  >
                    {columna}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagos.map((pago) => (
                <TableRow key={pago.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{pago.nombre}</TableCell>
                  <TableCell>{nombreCategoria(pago.categoriaId)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {formatearMonto(pago.monto)}
                  </TableCell>
                  <TableCell>{textoFrecuencia(pago.frecuencia)}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.875rem' }}>
                      {pago.proximaEjecucion
                        ? formatearFecha(pago.proximaEjecucion)
                        : 'Sin fecha'}
                    </Typography>
                    {pago.ultimaEjecucion?.fechaProgramada && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 0.25,
                        }}
                      >
                        <IconoCheck
                          sx={{ fontSize: 13, color: 'var(--color-exito)' }}
                        />
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            color: 'var(--color-texto-terciario)',
                          }}
                        >
                          Último pago:{' '}
                          {formatearFecha(
                            pago.ultimaEjecucion.fechaProgramada,
                          )}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        pago.estado === 'Pendiente' &&
                        !venceHoyOAntes(pago.proximaEjecucion, hoy)
                          ? 'Programado'
                          : pago.estado
                      }
                      size="small"
                      sx={{
                        backgroundColor: 'var(--color-superficie-suave)',
                        color:
                          pago.estado === 'Pendiente' &&
                          venceHoyOAntes(pago.proximaEjecucion, hoy)
                            ? 'var(--color-primario)'
                            : 'var(--color-texto-secundario)',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  {esPropietario && (
                    <TableCell>
                      {pago.estado !== 'Cancelado' && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 0.5,
                          }}
                        >
                          {pago.estado === 'Pendiente' && (
                            <Tooltip
                              title={
                                !venceHoyOAntes(pago.proximaEjecucion, hoy)
                                  ? `Disponible el ${formatearFecha(pago.proximaEjecucion)}`
                                  : ''
                              }
                            >
                              <span>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<IconoCheck sx={{ fontSize: 15 }} />}
                                  onClick={() => marcarHecho(pago)}
                                  disabled={
                                    marcandoId === pago.id ||
                                    !venceHoyOAntes(pago.proximaEjecucion, hoy)
                                  }
                                  sx={{ ...sxBoton, fontSize: '0.8125rem' }}
                                >
                                  {marcandoId === pago.id
                                    ? 'Marcando…'
                                    : 'Marcar hecho'}
                                </Button>
                              </span>
                            </Tooltip>
                          )}

                          <Button
                            size="small"
                            onClick={() => setEditando(pago)}
                            sx={sxBoton}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => abrirEliminar(pago)}
                            sx={sxBoton}
                          >
                            Eliminar
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {dialogoAbierto && (
        <DialogoNuevoPago
          carteraId={id}
          onCerrar={() => setDialogoAbierto(false)}
          onGuardado={manejarGuardado}
        />
      )}

      {editando && (
        <DialogoNuevoPago
          carteraId={id}
          pago={editando}
          onCerrar={() => setEditando(null)}
          onGuardado={manejarGuardado}
        />
      )}

      {porEliminar && (
        <Dialog
          open
          onClose={() => setPorEliminar(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogoTitulo alCerrar={() => setPorEliminar(null)} sx={{ fontWeight: 700 }}>
            Eliminar pago recurrente
          </DialogoTitulo>
          <DialogContent>
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: 'var(--color-texto-secundario)',
              }}
            >
              Se cancelará la regla “{porEliminar.nombre}”. Dejará de generar
              recordatorios y las transacciones ya registradas se conservan.
            </Typography>

            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderLeft: '3px solid var(--color-alerta)',
                backgroundColor: 'var(--color-superficie-suave)',
                borderRadius: 'var(--radio-sm)',
              }}
            >
              <Typography
                sx={{ fontSize: '0.8125rem', color: 'var(--color-alerta)' }}
              >
                La baja es lógica: no se borra el historial.
              </Typography>
            </Box>

            {errorEliminar && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorEliminar}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => setPorEliminar(null)}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={confirmarEliminar}
              disabled={eliminando}
            >
              {eliminando ? 'Eliminando…' : 'Eliminar pago'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  )
}

export default PagosCartera
