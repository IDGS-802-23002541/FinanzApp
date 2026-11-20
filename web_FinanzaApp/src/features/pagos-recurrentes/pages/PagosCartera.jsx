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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { listarCategorias } from '../../carteras/api.js'
import { eliminarPago, listarPagos } from '../api.js'
import { formatearFecha, formatearMonto } from '../../../utils/formato.js'
import DialogoNuevoPago from '../components/DialogoNuevoPago.jsx'
import { IconoMas } from '../../../components/ui/Iconos.jsx'

const COLUMNAS = [
  'Concepto',
  'Categoría',
  'Monto',
  'Frecuencia',
  'Próximo vencimiento',
  'Estado',
]

const sxBoton = {
  minHeight: 0,
  py: 0.5,
  px: 2,
  borderRadius: '12px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
}

// Pagos recurrentes de una cartera (HU-07.1).
function PagosCartera() {
  const { cartera, id } = useOutletContext()
  const [pagos, setPagos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [porEliminar, setPorEliminar] = useState(null)
  const [errorEliminar, setErrorEliminar] = useState('')
  const [eliminando, setEliminando] = useState(false)
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

  const manejarGuardado = () => {
    setDialogoAbierto(false)
    setEditando(null)
    setRecarga((actual) => actual + 1)
  }

  const abrirEliminar = (pago) => {
    setErrorEliminar('')
    setPorEliminar(pago)
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
            borderRadius: '16px',
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
      ) : (
        <TableContainer
          sx={{
            border: '1px solid var(--color-borde)',
            borderRadius: '16px',
            backgroundColor: 'var(--color-superficie)',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                {columnas.map((columna) => (
                  <TableCell
                    key={columna}
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
                  <TableCell>{formatearMonto(pago.monto)}</TableCell>
                  <TableCell>{pago.frecuencia}</TableCell>
                  <TableCell>
                    {pago.proximaEjecucion
                      ? formatearFecha(pago.proximaEjecucion)
                      : 'Sin fecha'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pago.estado}
                      size="small"
                      sx={{
                        backgroundColor: 'var(--color-superficie-suave)',
                        color: 'var(--color-texto-secundario)',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  {esPropietario && (
                    <TableCell>
                      {pago.estado !== 'Cancelado' && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
          <DialogTitle sx={{ fontWeight: 700 }}>Eliminar pago recurrente</DialogTitle>
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
                borderRadius: '8px',
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
