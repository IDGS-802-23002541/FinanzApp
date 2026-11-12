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
import { filtrarCarteras, listarPeriodos } from '../../carteras/api.js'
import GraficaBarras from '../../carteras/components/GraficaBarras.jsx'
import GraficaDona from '../../carteras/components/GraficaDona.jsx'
import { formatearMonto } from '../../../utils/formato.js'
import { descargarReporte, obtenerVistaPreviaReporte } from '../api.js'

const TIPOS = [
  { valor: '', etiqueta: 'Todos los tipos' },
  { valor: 'HOGAR', etiqueta: 'Hogar' },
  { valor: 'VIAJE', etiqueta: 'Viaje' },
  { valor: 'EVENTO', etiqueta: 'Evento' },
  { valor: 'OTRO', etiqueta: 'Otro' },
]

const FILTROS_INICIALES = {
  carteraId: '',
  tipo: '',
  periodoId: '',
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
        borderRadius: '16px',
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
  const [periodos, setPeriodos] = useState([])
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

  useEffect(() => {
    if (!filtros.carteraId) return undefined

    let vigente = true
    listarPeriodos(filtros.carteraId)
      .then((lista) => {
        if (vigente) setPeriodos(lista)
      })
      .catch(() => {
        if (vigente) setPeriodos([])
      })

    return () => {
      vigente = false
    }
  }, [filtros.carteraId])

  const cargarVistaPrevia = async () => {
    setCargando(true)
    setError('')

    try {
      const datos = await obtenerVistaPreviaReporte(filtros)
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
    if (campo === 'carteraId') setPeriodos([])
    setFiltros((actuales) => ({
      ...actuales,
      [campo]: valor,
      ...(campo === 'carteraId' ? { periodoId: '' } : {}),
    }))
  }

  const exportar = async (formato) => {
    setExportando(formato)
    setError('')

    try {
      await descargarReporte(filtros, formato)
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
      <Box>
        <Typography variant="h1">Reportes</Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: 'var(--color-texto-secundario)' }}>
          Filtra tus carteras, revisa la vista previa y descarga el reporte en CSV o PDF.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: '1px solid var(--color-borde)',
          borderRadius: '16px',
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
              label="Cartera"
              value={filtros.carteraId}
              onChange={cambiarFiltro('carteraId')}
              size="small"
            >
              <MenuItem value="">Todas mis carteras</MenuItem>
              {carteras.map((cartera) => (
                <MenuItem key={cartera.id} value={cartera.id}>
                  {cartera.nombre}
                </MenuItem>
              ))}
            </TextField>

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
              label="Periodo"
              value={filtros.periodoId}
              onChange={cambiarFiltro('periodoId')}
              size="small"
              disabled={!filtros.carteraId || periodos.length === 0}
            >
              <MenuItem value="">Sin periodo</MenuItem>
              {periodos.map((periodo) => (
                <MenuItem key={periodo.idPeriodo} value={periodo.idPeriodo}>
                  {periodo.nombre}
                </MenuItem>
              ))}
            </TextField>

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
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="contained" onClick={cargarVistaPrevia} disabled={cargando}>
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
          Selecciona los filtros y presiona "Actualizar vista previa".
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
