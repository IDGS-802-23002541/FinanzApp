import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { obtenerMetricas } from '../api.js'
import EncabezadoPagina from '../../../components/ui/EncabezadoPagina.jsx'

const sxTarjeta = {
  p: 2.5,
  height: '100%',
  border: '1px solid var(--color-borde)',
  borderRadius: '14px',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  gap: 0.5,
}

function Tarjeta({ etiqueta, valor, detalle, a }) {
  const contenido = (
    <>
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
    </>
  )

  if (!a) {
    return (
      <Paper elevation={0} sx={sxTarjeta}>
        {contenido}
      </Paper>
    )
  }

  return (
    <Paper
      elevation={0}
      component={RouterLink}
      to={a}
      sx={{
        ...sxTarjeta,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.2s ease, transform 0.2s ease',
        '&:hover': {
          borderColor: 'var(--color-borde-fuerte)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {contenido}
      <Typography
        variant="body2"
        sx={{ mt: 1, color: 'var(--color-primario)', fontWeight: 700 }}
      >
        Ver detalle →
      </Typography>
    </Paper>
  )
}

function InicioAdmin() {
  const [metricas, setMetricas] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      setCargando(true)
      setError('')
      try {
        const datos = await obtenerMetricas()
        if (vigente) setMetricas(datos)
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
  }, [])

  if (cargando) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!metricas) {
    return <Alert severity="info">No hay métricas disponibles.</Alert>
  }

  const { clientes, trabajadores, tickets } = metricas
  const pendientes = tickets.abiertos + tickets.enProceso + tickets.enEspera

  return (
    <Stack spacing={3}>
      <EncabezadoPagina
        titulo="Inicio"
        descripcion="Resumen del uso de la plataforma y de la capacidad de soporte."
      />

      <Box>
        <Typography variant="h2" sx={{ mb: 1.5 }}>
          Clientes
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          <Tarjeta etiqueta="Total de clientes" valor={clientes.total} />
          <Tarjeta etiqueta="Clientes activos" valor={clientes.activos} />
          <Tarjeta etiqueta="Clientes inactivos" valor={clientes.inactivos} />
        </Box>
      </Box>

      <Box>
        <Typography variant="h2" sx={{ mb: 1.5 }}>
          Soporte
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
            gap: 2,
          }}
        >
          <Tarjeta
            etiqueta="Trabajadores activos"
            valor={trabajadores.activos}
            a="/admin/trabajadores"
          />
          <Tarjeta
            etiqueta="Tickets totales"
            valor={tickets.total}
            a="/admin/tickets"
          />
          <Tarjeta
            etiqueta="Pendientes"
            valor={pendientes}
            detalle="Abiertos, en proceso y en espera"
            a="/admin/tickets"
          />
          <Tarjeta
            etiqueta="Respondidos"
            valor={tickets.resueltos}
            a="/admin/tickets"
          />
          <Tarjeta
            etiqueta="Cerrados"
            valor={tickets.cerrados}
            a="/admin/tickets"
          />
        </Box>
      </Box>

      <Button
        component={RouterLink}
        to="/admin/tickets"
        variant="outlined"
        sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
      >
        Ir a soporte
      </Button>
    </Stack>
  )
}

export default InicioAdmin
