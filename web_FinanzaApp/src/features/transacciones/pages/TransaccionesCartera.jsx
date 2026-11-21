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
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { formatearFecha, formatearMonto } from '../../../utils/formato.js'
import { eliminarTransaccion, listarTransacciones } from '../api.js'
import { listarPeriodos } from '../../carteras/api.js'
import DialogoNuevaTransaccion from '../../carteras/components/DialogoNuevaTransaccion.jsx'

function TransaccionesCartera() {
  const { cartera, id, recarga, recargar } = useOutletContext()
  const [items, setItems] = useState([])
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    porPagina: 10,
    total: 0,
    totalPaginas: 0,
  })
  const [totales, setTotales] = useState({
    totalIngresos: 0,
    totalGastos: 0,
    balance: 0,
  })
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)
  const [periodoId, setPeriodoId] = useState('')
  const [periodos, setPeriodos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [errorEliminar, setErrorEliminar] = useState('')

  const esHogar = cartera.categoria === 'Hogar'
  const puedeEditar =
    cartera.rol === 'Propietario' && cartera.estatus === 'Activa'

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      setCargando(true)
      setError('')
      try {
        const datos = await listarTransacciones(id, {
          pagina,
          porPagina,
          periodoId: periodoId || undefined,
        })
        if (vigente) {
          setItems(datos?.items ?? [])
          setPaginacion(
            datos?.paginacion ?? {
              pagina,
              porPagina,
              total: 0,
              totalPaginas: 0,
            },
          )
          setTotales(
            datos?.totales ?? {
              totalIngresos: 0,
              totalGastos: 0,
              balance: 0,
            },
          )
        }
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
  }, [id, pagina, porPagina, periodoId, recarga])

  useEffect(() => {
    if (!esHogar) return undefined

    let vigente = true
    listarPeriodos(id)
      .then((datos) => {
        if (vigente) setPeriodos(datos ?? [])
      })
      .catch(() => {
        // El filtro es opcional; si falla, se puede listar sin periodo.
      })

    return () => {
      vigente = false
    }
  }, [id, esHogar])

  const cambiarPeriodo = (evento) => {
    setPeriodoId(evento.target.value)
    setPagina(1)
  }

  const confirmarEliminar = async () => {
    setErrorEliminar('')
    try {
      await eliminarTransaccion(eliminando.idTransaccion)
      setEliminando(null)
      recargar()
    } catch (err) {
      setErrorEliminar(err.message)
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid var(--color-borde)',
        borderRadius: '16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Transacciones
        </Typography>

        {esHogar && (
          <TextField
            size="small"
            select
            label="Periodo"
            value={periodoId}
            onChange={cambiarPeriodo}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Todos los periodos</MenuItem>
            {periodos.map((periodo) => (
              <MenuItem key={periodo.idPeriodo} value={String(periodo.idPeriodo)}>
                {periodo.nombre}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2, flexWrap: 'wrap' }}>
        <Chip
          label={`Ingresos: ${formatearMonto(totales.totalIngresos)}`}
          sx={{
            backgroundColor: 'var(--color-superficie-suave)',
            color: 'var(--color-exito)',
            fontWeight: 700,
          }}
        />
        <Chip
          label={`Gastos: ${formatearMonto(totales.totalGastos)}`}
          sx={{
            backgroundColor: 'var(--color-seleccion)',
            color: 'var(--color-error)',
            fontWeight: 700,
          }}
        />
        <Chip
          label={`Balance: ${formatearMonto(totales.balance)}`}
          sx={{
            backgroundColor: 'var(--color-superficie)',
            border: '1px solid var(--color-borde)',
            fontWeight: 700,
          }}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {cargando ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <TableContainer sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Autor</TableCell>
                  {puedeEditar && <TableCell align="right">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={puedeEditar ? 7 : 6}
                      align="center"
                      sx={{ py: 4, color: 'var(--color-texto-secundario)' }}
                    >
                      Sin transacciones.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.idTransaccion} hover>
                      <TableCell>{formatearFecha(item.fecha)}</TableCell>
                      <TableCell>
                        {item.descripcion || 'Sin descripción'}
                      </TableCell>
                      <TableCell>{item.categoria?.nombre ?? '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.tipo === 'INGRESO' ? 'Ingreso' : 'Gasto'}
                          sx={{
                            fontWeight: 700,
                            backgroundColor:
                              item.tipo === 'INGRESO'
                                ? 'var(--color-superficie-suave)'
                                : 'var(--color-seleccion)',
                            color:
                              item.tipo === 'INGRESO'
                                ? 'var(--color-exito)'
                                : 'var(--color-error)',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatearMonto(item.monto)}
                      </TableCell>
                      <TableCell>{item.autor?.nombre ?? '—'}</TableCell>
                      {puedeEditar && (
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{ justifyContent: 'flex-end' }}
                          >
                            <Button
                              size="small"
                              onClick={() => setEditando(item)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => {
                                setErrorEliminar('')
                                setEliminando(item)
                              }}
                            >
                              Eliminar
                            </Button>
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={paginacion.total ?? 0}
            page={Math.max(0, (paginacion.pagina ?? 1) - 1)}
            rowsPerPage={porPagina}
            rowsPerPageOptions={[5, 10, 20]}
            onPageChange={(_evento, nuevaPagina) =>
              setPagina(nuevaPagina + 1)
            }
            onRowsPerPageChange={(evento) => {
              setPorPagina(Number(evento.target.value))
              setPagina(1)
            }}
            labelRowsPerPage="Filas por página"
          />
        </>
      )}

      {editando && (
        <DialogoNuevaTransaccion
          idCartera={id}
          transaccion={editando}
          onCerrar={() => setEditando(null)}
          onGuardada={() => {
            setEditando(null)
            recargar()
          }}
        />
      )}

      {eliminando && (
        <Dialog
          open
          onClose={() => setEliminando(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Eliminar transacción</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Eliminar “{eliminando.descripcion || 'Sin descripción'}” por{' '}
              {formatearMonto(eliminando.monto)}?
            </Typography>
            {errorEliminar && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorEliminar}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEliminando(null)}>Cancelar</Button>
            <Button color="error" variant="contained" onClick={confirmarEliminar}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  )
}

export default TransaccionesCartera
