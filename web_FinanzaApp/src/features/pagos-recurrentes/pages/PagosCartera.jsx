import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import { listarPagos } from '../api.js'
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
  const [recarga, setRecarga] = useState(0)

  const esPropietario = cartera?.rol === 'Propietario'

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
    setRecarga((actual) => actual + 1)
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
                {COLUMNAS.map((columna) => (
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
    </Stack>
  )
}

export default PagosCartera
