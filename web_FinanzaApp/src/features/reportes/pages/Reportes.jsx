import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { filtrarCarteras } from '../../carteras/api.js'
import GraficaBarras from '../../carteras/components/GraficaBarras.jsx'
import GraficaDona from '../../carteras/components/GraficaDona.jsx'
import EncabezadoPagina from '../../../components/ui/EncabezadoPagina.jsx'
import { fechasDePreset, formatearMonto } from '../../../utils/formato.js'
import { descargarReporte, obtenerVistaPreviaReporte } from '../api.js'

const TIPOS = [
  { valor: '', etiqueta: 'Todos los tipos' },
  { valor: 'HOGAR', etiqueta: 'Hogar' },
  { valor: 'VIAJE', etiqueta: 'Viaje' },
  { valor: 'EVENTO', etiqueta: 'Evento' },
  { valor: 'OTRO', etiqueta: 'Otro' },
]

const PRESETS = [
  { valor: 'mes', etiqueta: 'Último mes' },
  { valor: '3m', etiqueta: 'Últimos 3 meses' },
  { valor: '6m', etiqueta: 'Últimos 6 meses' },
  { valor: 'personalizado', etiqueta: 'Personalizado' },
]

const FILTROS_INICIALES = {
  tipo: '',
  carteraId: '',
  preset: 'mes',
  fechaInicio: '',
  fechaFin: '',
}

function TarjetaIndicador({ etiqueta, valor }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        flex: 1,
        minWidth: 150,
        border: '1px solid var(--color-borde)',
        borderRadius: 'var(--radio-lg)',
      }}
    >
      <Typography variant="caption" sx={{ color: 'var(--color-texto-terciario)' }}>
        {etiqueta}
      </Typography>
      <Typography sx={{ mt: 0.5, fontSize: '1.15rem', fontWeight: 800 }}>
        {valor}
      </Typography>
    </Paper>
  )
}

function Reportes() {
  const [carteras, setCarteras] = useState([])
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [reporte, setReporte] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [exportando, setExportando] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true

    Promise.all([
      filtrarCarteras({ estado: 'ACTIVA' }),
      filtrarCarteras({ estado: 'FINALIZADA' }),
    ])
      .then(([activas, finalizadas]) => {
        if (!vigente) return
        // Los reportes incluyen activas y finalizadas, solo del propietario.
        const unicas = new Map()
        for (const cartera of [...activas, ...finalizadas]) {
          if (cartera.rol === 'Propietario') unicas.set(cartera.id, cartera)
        }
        setCarteras([...unicas.values()])
      })
      .catch(() => {
        if (vigente) setCarteras([])
      })

    return () => {
      vigente = false
    }
  }, [])

  const carterasFiltradas = filtros.tipo
    ? carteras.filter((cartera) => cartera.tipo === filtros.tipo)
    : carteras

  const conFechas = () => {
    const rango = fechasDePreset(filtros.preset)
    return {
      ...filtros,
      fechaInicio: rango?.desde ?? '',
      fechaFin: rango?.hasta ?? '',
    }
  }

  const cargarVistaPrevia = async () => {
    if (!filtros.carteraId) return

    setCargando(true)
    setError('')

    try {
      const datos = await obtenerVistaPreviaReporte(conFechas())
      setReporte(datos)
    } catch (err) {
      setError(err.message)
      setReporte(null)
    } finally {
      setCargando(false)
    }
  }

  const cambiarFiltro = (campo) => (evento) => {
    const valor = evento.target.value
    setReporte(null)
    setError('')
    setFiltros((actual) => {
      if (campo === 'tipo') {
        return {
          ...actual,
          tipo: valor,
          carteraId: '',
          preset: 'mes',
          fechaInicio: '',
          fechaFin: '',
        }
      }
      return { ...actual, [campo]: valor }
    })
  }

  const exportar = async (formato) => {
    setExportando(formato)
    setError('')

    try {
      await descargarReporte(conFechas(), formato)
    } catch (err) {
      setError(err.message)
    } finally {
      setExportando('')
    }
  }

  const series = [
    { clave: 'ingresos', nombre: 'Ingresos', color: 'var(--color-primario)' },
    { clave: 'gastos', nombre: 'Gastos', color: 'var(--color-error)' },
  ]
  const grupos = (reporte?.graficas?.ingresosVsEgresos ?? []).map((fila) => ({
    etiqueta: fila.periodo,
    valores: { ingresos: fila.ingresos, gastos: fila.gastos },
  }))
  const gastosCategoria = (reporte?.graficas?.gastosPorCategoria ?? []).map(
    (fila) => ({ nombre: fila.categoria, total: fila.monto }),
  )

  return (
    <Stack spacing={3}>
      <EncabezadoPagina
        titulo="Reportes"
        descripcion="Elige tipo, cartera y periodo; revisa la vista previa y descarga en CSV o PDF."
      />
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: '1px solid var(--color-borde)',
          borderRadius: 'var(--radio-lg)',
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            <TextField
              select
              label="Tipo"
              value={filtros.tipo}
              onChange={cambiarFiltro('tipo')}
              size="small"
            >
              {TIPOS.map((tipo) => (
                <MenuItem key={tipo.valor || 'todos'} value={tipo.valor}>
                  {tipo.etiqueta}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Cartera"
              value={filtros.carteraId}
              onChange={cambiarFiltro('carteraId')}
              size="small"
              helperText={
                carterasFiltradas.length === 0
                  ? 'No hay carteras de este tipo.'
                  : 'Elige una cartera.'
              }
            >
              {carterasFiltradas.map((cartera) => (
                <MenuItem key={cartera.id} value={cartera.id}>
                  {cartera.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Periodo"
              value={filtros.preset}
              onChange={cambiarFiltro('preset')}
              size="small"
            >
              {PRESETS.map((preset) => (
                <MenuItem key={preset.valor} value={preset.valor}>
                  {preset.etiqueta}
                </MenuItem>
              ))}
            </TextField>

            {filtros.preset === 'personalizado' && (
              <>
                <TextField
                  label="Desde"
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={cambiarFiltro('fechaInicio')}
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label="Hasta"
                  type="date"
                  value={filtros.fechaFin}
                  onChange={cambiarFiltro('fechaFin')}
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </>
            )}
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              onClick={cargarVistaPrevia}
              disabled={cargando || !filtros.carteraId}
            >
              {cargando ? 'Consultando...' : 'Actualizar vista previa'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => exportar('CSV')}
              disabled={Boolean(exportando) || !reporte?.hayDatos}
            >
              {exportando === 'CSV' ? 'Generando...' : 'Exportar CSV'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => exportar('PDF')}
              disabled={Boolean(exportando) || !reporte?.hayDatos}
            >
              {exportando === 'PDF' ? 'Generando...' : 'Exportar PDF'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      {!cargando && !reporte && !error && (
        <Alert severity="info">
          {filtros.carteraId
            ? 'Presiona "Actualizar vista previa" para consultar el reporte.'
            : 'Selecciona una cartera para generar el reporte.'}
        </Alert>
      )}

      {cargando ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={32} />
        </Box>
      ) : reporte && !reporte.hayDatos ? (
        <Alert severity="info">No hay datos para los filtros seleccionados.</Alert>
      ) : reporte ? (
        <>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TarjetaIndicador
              etiqueta="Ingresos"
              valor={formatearMonto(reporte.indicadores.totalIngresos)}
            />
            <TarjetaIndicador
              etiqueta="Gastos"
              valor={formatearMonto(reporte.indicadores.totalGastos)}
            />
            <TarjetaIndicador
              etiqueta="Ahorro"
              valor={formatearMonto(reporte.indicadores.ahorro)}
            />
            <TarjetaIndicador
              etiqueta="Movimientos"
              valor={reporte.indicadores.movimientos}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' },
              gap: 3,
            }}
          >
            <GraficaBarras
              titulo="Ingresos vs egresos"
              grupos={grupos}
              series={series}
            />
            <GraficaDona titulo="Gastos por categoría" datos={gastosCategoria} />
          </Box>
        </>
      ) : null}
    </Stack>
  )
}

export default Reportes
