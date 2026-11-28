import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { actualizarMonitoreo, obtenerMonitoreo } from '../api.js'
import EncabezadoPagina from '../../../components/ui/EncabezadoPagina.jsx'
import { formatearFecha } from '../../../utils/formato.js'

const sxTarjeta = {
  p: 2.5,
  border: '1px solid var(--color-borde)',
  borderRadius: 'var(--radio-lg)',
}

function Tarjeta({ etiqueta, valor, detalle }) {
  return (
    <Paper elevation={0} sx={sxTarjeta}>
      <Typography
        sx={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em' }}
      >
        {etiqueta}
      </Typography>
      <Typography sx={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>
        {valor}
      </Typography>
      {detalle && (
        <Typography
          variant="body2"
          sx={{ color: 'var(--color-texto-terciario)' }}
        >
          {detalle}
        </Typography>
      )}
    </Paper>
  )
}

function Monitoreo() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true

    obtenerMonitoreo()
      .then((respuesta) => {
        if (vigente) setDatos(respuesta)
      })
      .catch((err) => {
        if (vigente) setError(err.message)
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [])

  const actualizar = async () => {
    setActualizando(true)
    setError('')
    try {
      setDatos(await actualizarMonitoreo())
    } catch (err) {
      setError(err.message)
    } finally {
      setActualizando(false)
    }
  }

  if (cargando) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  const metricas = datos?.metricas

  return (
    <Stack spacing={3}>
      <EncabezadoPagina
        titulo="Monitoreo"
        descripcion="Estado de la base de datos y métricas de la plataforma. Los datos se guardan 60 segundos."
      >
        <Button variant="outlined" onClick={actualizar} disabled={actualizando}>
          {actualizando ? 'Actualizando…' : 'Actualizar indicadores'}
        </Button>
      </EncabezadoPagina>

      {error && <Alert severity="error">{error}</Alert>}

      {!metricas && !error && (
        <Alert severity="info">No hay indicadores disponibles.</Alert>
      )}

      {metricas && (
        <>
          <Box>
            <Typography variant="h2" sx={{ mb: 1.5 }}>
              Base de datos
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2,
              }}
            >
              <Tarjeta
                etiqueta="Estado"
                valor={datos.sonda.ok ? 'En línea' : 'Sin respuesta'}
                detalle={`Base ${datos.base ?? 'desconocida'}`}
              />
              <Tarjeta
                etiqueta="Latencia de la sonda"
                valor={`${datos.sonda.duracion_ms} ms`}
                detalle={
                  datos.cacheado
                    ? 'Dato en caché'
                    : `Medido ${formatearFecha(datos.actualizado_en)}`
                }
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="h2" sx={{ mb: 1.5 }}>
              Plataforma
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              <Tarjeta
                etiqueta="Clientes totales"
                valor={metricas.clientes.total}
              />
              <Tarjeta
                etiqueta="Trabajadores activos"
                valor={metricas.trabajadores.activos}
              />
              <Tarjeta
                etiqueta="Tickets totales"
                valor={metricas.tickets.total}
              />
            </Box>
          </Box>
        </>
      )}
    </Stack>
  )
}

export default Monitoreo
