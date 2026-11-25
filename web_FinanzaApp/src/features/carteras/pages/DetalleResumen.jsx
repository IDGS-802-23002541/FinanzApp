import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Alert,
  Box,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { listarTransacciones } from '../../transacciones/api.js'
import TarjetaResumen from '../components/TarjetaResumen.jsx'
import BarraPresupuesto from '../components/BarraPresupuesto.jsx'
import GraficaBarras from '../components/GraficaBarras.jsx'
import GraficaDona from '../components/GraficaDona.jsx'
import UltimasTransacciones from '../components/UltimasTransacciones.jsx'
import {
  AvatarUsuario,
  IconoArchivo,
  IconoCartera,
  IconoEstrella,
  IconoPersonas,
} from '../../../components/ui/Iconos.jsx'
import { fechasDePreset } from '../../../utils/formato.js'

// Opciones del filtro por periodo del resumen.
const RANGOS = [
  { valor: 'mes', texto: 'Este mes' },
  { valor: '3m', texto: 'Últimos 3 meses' },
  { valor: '6m', texto: 'Últimos 6 meses' },
  { valor: 'todo', texto: 'Todo el historial' },
]

function DetalleResumen() {
  const { cartera, id, recarga, rango, cambiarRango } = useOutletContext()
  const [ultimas, setUltimas] = useState([])
  const [errorUltimas, setErrorUltimas] = useState('')

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      setErrorUltimas('')
      try {
        const fechas = fechasDePreset(rango) ?? {}
        const datos = await listarTransacciones(id, {
          porPagina: 5,
          ...fechas,
        })
        if (vigente) setUltimas(datos?.items ?? [])
      } catch (err) {
        if (vigente) setErrorUltimas(err.message)
      }
    }

    cargar()
    return () => {
      vigente = false
    }
  }, [id, recarga, rango])

  if (!cartera) return null

  const { resumen, series, colaboradores } = cartera
  const esHogar = cartera.categoria === 'Hogar'
  const presupuestoInicial = resumen.presupuestoInicial ?? 0
  // En Hogar el disponible es el saldo real; en el resto es lo que queda del
  // presupuesto (guía de gasto), sin sumar las aportaciones.
  const disponible = esHogar
    ? resumen.saldo
    : presupuestoInicial - resumen.totalGastos
  const sinMovimientos =
    resumen.totalIngresos === 0 && resumen.totalGastos === 0

  const gruposBarras = series.ingresosVsEgresos.slice(-6).map((fila) => ({
    etiqueta: fila.nombre,
    valores: { gastos: fila.gastos, ingresos: fila.ingresos },
  }))

  return (
    <Stack spacing={3}>
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
            Resumen por periodo
          </Typography>
          <Typography
            sx={{ fontSize: '0.75rem', color: 'var(--color-texto-terciario)' }}
          >
            Elige el rango para recalcular el resumen y las transacciones.
          </Typography>
        </Box>
        <TextField
          select
          size="small"
          label="Periodo"
          value={rango}
          onChange={(evento) => cambiarRango(evento.target.value)}
          sx={{ width: { xs: '100%', sm: 250 } }}
        >
          {RANGOS.map((opcion) => (
            <MenuItem key={opcion.valor} value={opcion.valor}>
              {opcion.texto}
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
                <AvatarUsuario iniciales={persona.iniciales} tamano={24} />
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
          <>
            <TarjetaResumen
              etiqueta="Presupuesto"
              monto={presupuestoInicial}
              Icono={IconoCartera}
              fondo="var(--color-superficie-suave)"
            />
            <TarjetaResumen
              etiqueta="Aportado"
              monto={resumen.totalIngresos}
              Icono={IconoPersonas}
              fondo="var(--color-seleccion)"
            />
          </>
        )}
        <TarjetaResumen
          etiqueta="Gastado"
          monto={resumen.totalGastos}
          Icono={IconoArchivo}
          fondo="var(--color-seleccion)"
        />
        <TarjetaResumen
          etiqueta="Disponible"
          monto={disponible}
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
          gridTemplateColumns: { xs: '1fr', md: esHogar ? '1.6fr 1fr' : '1fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* En Hogar el eje es el flujo por mes; en el resto, el presupuesto. */}
        {esHogar ? (
          <GraficaBarras
            titulo="Últimos 6 meses"
            grupos={gruposBarras}
            series={[
              {
                clave: 'gastos',
                nombre: 'Gastos por mes',
                color: 'var(--color-negativo)',
              },
              {
                clave: 'ingresos',
                nombre: 'Ingresos',
                color: 'var(--color-primario)',
              },
            ]}
          />
        ) : (
          <BarraPresupuesto
            presupuesto={presupuestoInicial}
            gastado={resumen.totalGastos}
          />
        )}
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
