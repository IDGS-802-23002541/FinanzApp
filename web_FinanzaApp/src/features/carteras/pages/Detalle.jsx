import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { obtenerCartera } from '../api.js'
import { formatearMonto } from '../../../utils/formato.js'

function DetalleCartera() {
  const { id } = useParams()
  const [cartera, setCartera] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // evita que una respuesta vieja pinte otra cartera al cambiar de ruta
    let vigente = true

    const cargar = async () => {
      setCargando(true)
      setError('')

      try {
        const datos = await obtenerCartera(id)
        if (vigente) setCartera(datos)
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
  }, [id])

  if (cargando) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!cartera) {
    return <Alert severity="info">Cartera no disponible.</Alert>
  }

  // aun no hay transacciones en el sprint, asi que el gasto real queda en cero
  const gastado = 0
  const presupuesto = cartera.presupuestoInicial || 0
  const progreso = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h1">{cartera.nombre}</Typography>
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: 'var(--color-texto-terciario)',
            mt: 0.5,
          }}
        >
          {cartera.categoria} · {cartera.estatus} · {cartera.rol}
        </Typography>

        {cartera.descripcion && (
          <Typography sx={{ mt: 1.5 }}>{cartera.descripcion}</Typography>
        )}

        {cartera.periodo && (
          <Typography
            sx={{
              mt: 1,
              fontSize: '0.875rem',
              color: 'var(--color-texto-secundario)',
            }}
          >
            {cartera.periodo}
          </Typography>
        )}

        {cartera.administrador && (
          <Typography
            sx={{
              mt: 1,
              fontSize: '0.875rem',
              color: 'var(--color-texto-secundario)',
            }}
          >
            Administrador: {cartera.administrador}
          </Typography>
        )}
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: 'var(--color-texto-terciario)',
              textTransform: 'uppercase',
            }}
          >
            Presupuesto
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5 }}>
            {formatearMonto(presupuesto)}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: 'var(--color-texto-terciario)',
              textTransform: 'uppercase',
            }}
          >
            Gastado
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.5 }}>
            {formatearMonto(gastado)}
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Avance del presupuesto</Typography>
        <LinearProgress
          variant="determinate"
          value={progreso}
          sx={{ mt: 1.5, height: 10, borderRadius: 1 }}
        />
        {/* aqui va la grafica de ingresos y gastos cuando existan transacciones */}
      </Paper>
    </Stack>
  )
}

export default DetalleCartera
