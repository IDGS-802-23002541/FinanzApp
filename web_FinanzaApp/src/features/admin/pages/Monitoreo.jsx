import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { actualizarMonitoreo, obtenerMonitoreo } from '../api.js'
import EncabezadoPagina from '../../../components/ui/EncabezadoPagina.jsx'

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

function Grafica({ muestras }) {
  const maximo = Math.max(1, ...muestras.map((m) => m.duracion_ms))

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2px',
          height: 120,
          p: 1,
          border: '1px solid var(--color-borde)',
          borderRadius: 'var(--radio-lg)',
        }}
      >
        {muestras.map((m) => (
          <Box
            key={m.minuto}
            title={`${formatearHora(m.minuto)} · ${m.ok ? 'En línea' : 'Caída'} · ${m.duracion_ms} ms`}
            sx={{
              flex: 1,
              minWidth: 2,
              height: `${Math.max(6, (m.duracion_ms / maximo) * 100)}%`,
              borderRadius: '2px',
              backgroundColor: m.ok
                ? 'var(--color-primario)'
                : 'var(--color-error, #b3261e)',
            }}
          />
        ))}
      </Box>
      <Typography variant="body2" sx={{ color: 'var(--color-texto-terciario)' }}>
        Cada barra es un minuto del último periodo; la altura es el tiempo de
        respuesta y el color indica si la base respondió.
      </Typography>
    </Stack>
  )
}

function formatearHora(iso) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  const muestras = datos?.historial ?? []
  const ultimas = [...muestras].reverse().slice(0, 20)

  return (
    <Stack spacing={3}>
      <EncabezadoPagina
        titulo="Monitoreo"
        descripcion="Estado de la base de datos y métricas de la plataforma. La app guarda una muestra cada minuto."
      >
        <Button variant="outlined" onClick={actualizar} disabled={actualizando}>
          {actualizando ? 'Actualizando…' : 'Actualizar indicadores'}
        </Button>
      </EncabezadoPagina>

      {error && <Alert severity="error">{error}</Alert>}

      {datos?.sonda && (
        <Box>
          <Typography variant="h2" sx={{ mb: 1.5 }}>
            Estado actual
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <Tarjeta
              etiqueta="Base de datos"
              valor={datos.sonda.ok ? 'En línea' : 'Sin respuesta'}
              detalle={`Base ${datos.base ?? 'desconocida'}`}
            />
            <Tarjeta
              etiqueta="Tiempo de respuesta"
              valor={`${datos.sonda.duracion_ms} ms`}
              detalle="Milisegundos que tardan las consultas de prueba a la BD"
            />
          </Box>
        </Box>
      )}

      {metricas && (
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
            <Tarjeta etiqueta="Clientes totales" valor={metricas.clientes.total} />
            <Tarjeta
              etiqueta="Trabajadores activos"
              valor={metricas.trabajadores.activos}
            />
            <Tarjeta etiqueta="Tickets totales" valor={metricas.tickets.total} />
          </Box>
        </Box>
      )}

      <Box>
        <Typography variant="h2" sx={{ mb: 1.5 }}>
          Estado a través del tiempo
        </Typography>
        {muestras.length === 0 ? (
          <Alert severity="info">
            Aún no hay muestras guardadas. Se registran cada minuto.
          </Alert>
        ) : (
          <Grafica muestras={muestras} />
        )}
      </Box>

      <Box>
        <Typography variant="h2" sx={{ mb: 1.5 }}>
          Últimos registros
        </Typography>
        {ultimas.length === 0 ? (
          <Alert severity="info">Sin registros todavía.</Alert>
        ) : (
          <Paper
            elevation={0}
            sx={{ border: '1px solid var(--color-borde)', overflow: 'auto' }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha y hora</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Respuesta</TableCell>
                  <TableCell>Base</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ultimas.map((m) => (
                  <TableRow key={m.minuto}>
                    <TableCell>{formatearHora(m.minuto)}</TableCell>
                    <TableCell>{m.ok ? 'En línea' : 'Caída'}</TableCell>
                    <TableCell align="right">{m.duracion_ms} ms</TableCell>
                    <TableCell>{m.base ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
    </Stack>
  )
}

export default Monitoreo
