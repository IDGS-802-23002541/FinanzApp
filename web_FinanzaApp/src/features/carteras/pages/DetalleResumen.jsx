import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Box,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { listarTransacciones } from '../../transacciones/api.js'
import TarjetaResumen from '../components/TarjetaResumen.jsx'
import GraficaBarras from '../components/GraficaBarras.jsx'
import GraficaDona from '../components/GraficaDona.jsx'
import UltimasTransacciones from '../components/UltimasTransacciones.jsx'
import {
  IconoArchivo,
  IconoCartera,
  IconoEstrella,
} from '../../../components/ui/Iconos.jsx'

// Opciones del filtro por periodo del resumen (vista previa, aún sin conectar).
const RANGOS = [
  { valor: 'mes', texto: 'Este mes' },
  { valor: '3m', texto: 'Últimos 3 meses' },
  { valor: '6m', texto: 'Últimos 6 meses' },
  { valor: 'todo', texto: 'Todo el historial' },
]

function DetalleResumen() {
  const { cartera, id, recarga } = useOutletContext()
  const [ultimas, setUltimas] = useState([])
  const [errorUltimas, setErrorUltimas] = useState('')

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      setErrorUltimas('')
      try {
        const datos = await listarTransacciones(id, { porPagina: 5 })
        if (vigente) setUltimas(datos?.items ?? [])
      } catch (err) {
        if (vigente) setErrorUltimas(err.message)
      }
    }

    cargar()
    return () => {
      vigente = false
    }
  }, [id, recarga])

  if (!cartera) return null

  const { resumen, series, colaboradores } = cartera
  const esHogar = cartera.categoria === 'Hogar'
  const sinMovimientos =
    resumen.totalIngresos === 0 && resumen.totalGastos === 0

  const gruposBarras = series.ingresosVsEgresos.slice(-6).map((fila) => ({
    etiqueta: fila.nombre,
    valores: { gastos: fila.gastos, ingresos: fila.ingresos },
  }))

  return (
    <Stack spacing={3}>
      {/* Vista previa del filtro por periodo. El rango de fechas se conectará
          cuando el backend lo calcule en el resumen; por eso aún va deshabilitado. */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{ fontSize: '0.875rem', color: 'var(--color-texto-secundario)' }}
          >
            Resumen de la cartera completa
          </Typography>
          <Typography
            sx={{ fontSize: '0.75rem', color: 'var(--color-texto-terciario)' }}
          >
            El filtro por periodo se activa al conectar el rango de fechas.
          </Typography>
        </Box>
        <TextField
          select
          size="small"
          label="Periodo"
          defaultValue="todo"
          disabled
          sx={{ width: { xs: '100%', sm: 250 } }}
        >
          {RANGOS.map((rango) => (
            <MenuItem key={rango.valor} value={rango.valor}>
              {rango.texto}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {colaboradores.length > 0 && (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {colaboradores.map((persona) => (
            <Chip
              key={persona.idUsuario}
              avatar={
                <Avatar
                  sx={{
                    backgroundColor: 'var(--paleta-petroleo)',
                    color: 'var(--paleta-blanco)',
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
        {esHogar ? (
          <TarjetaResumen
            etiqueta="Ingresos"
            monto={resumen.totalIngresos}
            Icono={IconoCartera}
            fondo="var(--color-superficie-suave)"
          />
        ) : (
          <TarjetaResumen
            etiqueta="Presupuesto"
            monto={resumen.presupuestoInicial}
            Icono={IconoCartera}
            fondo="var(--color-superficie-suave)"
          />
        )}
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
          colorIcono="var(--paleta-petroleo)"
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

      <UltimasTransacciones items={ultimas} error={errorUltimas} />
    </Stack>
  )
}

export default DetalleResumen
