import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Box,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { listarPeriodos } from '../api.js'
import { listarTransacciones } from '../../transacciones/api.js'
import TarjetaResumen from '../components/TarjetaResumen.jsx'
import BarraPresupuesto from '../components/BarraPresupuesto.jsx'
import GraficaBarras from '../components/GraficaBarras.jsx'
import GraficaDona from '../components/GraficaDona.jsx'
import UltimasTransacciones from '../components/UltimasTransacciones.jsx'
import EstadoVacio from '../../../components/ui/EstadoVacio.jsx'
import {
  AvatarUsuario,
  IconoArchivo,
  IconoCartera,
  IconoEstrella,
  IconoPersonas,
} from '../../../components/ui/Iconos.jsx'

function DetalleResumen() {
  const { cartera, id, recarga, periodoId, setPeriodoId } = useOutletContext()
  const [ultimas, setUltimas] = useState([])
  const [errorUltimas, setErrorUltimas] = useState('')
  const [periodos, setPeriodos] = useState([])

  useEffect(() => {
    let vigente = true

    listarPeriodos(id)
      .then((datos) => {
        if (vigente) setPeriodos(datos ?? [])
      })
      .catch(() => {
        if (vigente) setPeriodos([])
      })

    return () => {
      vigente = false
    }
  }, [id, recarga])

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      setErrorUltimas('')
      try {
        const datos = await listarTransacciones(id, {
          porPagina: 5,
          periodoId: periodoId || undefined,
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
  }, [id, recarga, periodoId])

  if (!cartera) return null

  const { resumen, series, colaboradores, resumenPeriodo } = cartera
  const esHogar = cartera.categoria === 'Hogar'
  const presupuestoInicial = resumen.presupuestoInicial ?? 0

  // Con un periodo elegido se muestran sus totales; sin él, el histórico.
  const ingresos = resumenPeriodo?.totalIngresos ?? resumen.totalIngresos
  const gastos = resumenPeriodo?.totalGastos ?? resumen.totalGastos
  const disponible = esHogar
    ? ingresos - gastos
    : presupuestoInicial - gastos
  const sinMovimientos = ingresos === 0 && gastos === 0
  const periodoElegido = periodos.find(
    (periodo) => String(periodo.idPeriodo) === String(periodoId),
  )

  const gruposBarras = series.ingresosVsEgresos.slice(-6).map((fila) => ({
    etiqueta: fila.nombre,
    valores: { gastos: fila.gastos, ingresos: fila.ingresos },
  }))

  const selectorPeriodo = (
    <TextField
      select
      size="small"
      label="Periodo"
      value={periodoId}
      onChange={(evento) => setPeriodoId(evento.target.value)}
      slotProps={{
        select: { displayEmpty: true },
        inputLabel: { shrink: true },
      }}
      sx={{ width: { xs: '100%', sm: 250 } }}
    >
      <MenuItem value="">Todo el historial</MenuItem>
      {periodos.map((periodo) => (
        <MenuItem key={periodo.idPeriodo} value={String(periodo.idPeriodo)}>
          {periodo.nombre}
        </MenuItem>
      ))}
    </TextField>
  )

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
            {periodoElegido
              ? `Periodo: ${periodoElegido.nombre}`
              : 'Resumen de la cartera completa'}
          </Typography>
          <Typography
            sx={{ fontSize: '0.75rem', color: 'var(--color-texto-terciario)' }}
          >
            {periodos.length === 0
              ? 'Esta cartera todavía no tiene periodos.'
              : 'Las tarjetas, gráficas y movimientos responden al periodo elegido.'}
          </Typography>
        </Box>
        {selectorPeriodo}
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
            monto={ingresos}
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
              monto={ingresos}
              Icono={IconoPersonas}
              fondo="var(--color-seleccion)"
            />
          </>
        )}
        <TarjetaResumen
          etiqueta="Gastado"
          monto={gastos}
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
        <EstadoVacio
          Icono={IconoArchivo}
          titulo={
            periodoElegido
              ? `Sin movimientos en ${periodoElegido.nombre}`
              : 'Esta cartera todavía no tiene transacciones'
          }
          descripcion={
            periodoElegido
              ? 'Elige otro periodo o vuelve a "Todo el historial".'
              : 'Cuando registres el primer movimiento verás aquí las gráficas.'
          }
        />
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
