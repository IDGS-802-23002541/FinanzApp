import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import { obtenerCartera } from '../api.js'
import TarjetaResumen from '../components/TarjetaResumen.jsx'
import GraficaBarras from '../components/GraficaBarras.jsx'
import GraficaDona from '../components/GraficaDona.jsx'
import {
  IconoArchivo,
  IconoCartera,
  IconoCasa,
  IconoEstrella,
} from '../../../components/ui/Iconos.jsx'

function DetalleCartera() {
  const { id } = useParams()
  const navegar = useNavigate()
  const [cartera, setCartera] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
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

  const { resumen, series, colaboradores } = cartera
  const sinMovimientos = resumen.totalIngresos === 0 && resumen.totalGastos === 0

  const gruposBarras = series.ingresosVsEgresos.slice(-6).map((fila) => ({
    etiqueta: fila.nombre,
    valores: { gastos: fila.gastos, ingresos: fila.ingresos },
  }))

  return (
    <Stack spacing={3}>
      <Button
        onClick={() => navegar('/carteras')}
        sx={{
          alignSelf: 'flex-start',
          minHeight: 0,
          px: 0,
          color: 'var(--color-texto-terciario)',
        }}
      >
        ← Volver a carteras
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'var(--color-primario)',
            color: 'var(--color-sobre-primario)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconoCasa sx={{ fontSize: 22 }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h1">{cartera.nombre}</Typography>
          <Chip
            label={cartera.categoria}
            size="small"
            sx={{
              alignSelf: 'flex-start',
              backgroundColor: 'var(--color-superficie-suave)',
              color: 'var(--color-texto-secundario)',
              fontWeight: 700,
            }}
          />
        </Box>
      </Box>

      {colaboradores.length > 0 && (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {colaboradores.map((persona) => (
            <Chip
              key={persona.idUsuario}
              avatar={
                <Avatar
                  sx={{
                    backgroundColor: 'var(--color-primario)',
                    color: 'var(--color-sobre-primario)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {persona.iniciales}
                </Avatar>
              }
              label={`${persona.nombre} · ${persona.rol}`}
              sx={{
                backgroundColor: 'var(--color-superficie)',
                border: '1px solid var(--color-borde)',
                fontWeight: 600,
              }}
            />
          ))}
        </Stack>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 2,
        }}
      >
        <TarjetaResumen
          etiqueta="Presupuesto"
          monto={resumen.presupuestoInicial}
          Icono={IconoCartera}
          fondo="var(--color-superficie-suave)"
        />
        <TarjetaResumen
          etiqueta="Gastado"
          monto={resumen.totalGastos}
          Icono={IconoArchivo}
          fondo="var(--color-seleccion)"
        />
        <TarjetaResumen
          etiqueta="Disponible"
          monto={resumen.saldo}
          Icono={IconoEstrella}
          fondo="var(--color-acento)"
        />
      </Box>

      {sinMovimientos && (
        <Alert severity="info">
          Esta cartera todavía no tiene transacciones.
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr' },
          gap: 2.5,
        }}
      >
        <GraficaBarras
          titulo="Últimos 6 meses"
          grupos={gruposBarras}
          series={[
            {
              clave: 'gastos',
              nombre: 'Gastos por mes',
              color: 'var(--color-primario)',
            },
            {
              clave: 'ingresos',
              nombre: 'Ingresos',
              color: 'var(--color-borde-fuerte)',
            },
          ]}
        />
        <GraficaDona
          titulo="Gasto por categoría"
          datos={series.gastosPorCategoria}
        />
      </Box>
    </Stack>
  )
}

export default DetalleCartera