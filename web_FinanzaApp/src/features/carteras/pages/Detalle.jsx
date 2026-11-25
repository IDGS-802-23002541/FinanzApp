import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { obtenerCartera } from '../api.js'
import { IconoFlechaIzquierda } from '../../../components/ui/Iconos.jsx'
import { aparienciaCategoria } from '../aparienciaCategoria.js'
import DialogoNuevaTransaccion from '../components/DialogoNuevaTransaccion.jsx'

const SECCIONES = [
  { valor: 'resumen', etiqueta: 'Resumen' },
  { valor: 'transacciones', etiqueta: 'Transacciones' },
  { valor: 'contribuyentes', etiqueta: 'Contribuyentes' },
  { valor: 'pagos', etiqueta: 'Pagos recurrentes' },
  { valor: 'invitacion', etiqueta: 'Invitación QR' },
  { valor: 'cierre', etiqueta: 'Cierre y balance' },
]

function DetalleCartera() {
  const { id } = useParams()
  const navegar = useNavigate()
  const location = useLocation()
  const [cartera, setCartera] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [recarga, setRecarga] = useState(0)
  const primeraCarga = useRef(true)

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      if (primeraCarga.current) setCargando(true)
      setError('')

      try {
        const datos = await obtenerCartera(id)
        if (vigente) setCartera(datos)
      } catch (err) {
        if (vigente) setError(err.message)
      } finally {
        if (vigente) {
          setCargando(false)
          primeraCarga.current = false
        }
      }
    }

    cargar()
    return () => {
      vigente = false
    }
  }, [id, recarga])

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

  // Viaje/Evento son finitos: no manejan pagos recurrentes.
  const sinPagos = cartera.categoria === 'Viaje' || cartera.categoria === 'Evento'
  // Cierre y balance solo aplica a carteras con fecha de término.
  const esHogar = cartera.categoria === 'Hogar'
  const secciones = SECCIONES.filter(
    (s) =>
      (s.valor !== 'pagos' || !sinPagos) && (s.valor !== 'cierre' || !esHogar),
  )

  const segmento = location.pathname.split('/').pop()
  const seccion = secciones.some((s) => s.valor === segmento)
    ? segmento
    : 'resumen'
  const recargar = () => setRecarga((n) => n + 1)
  const apariencia = aparienciaCategoria(cartera.categoria)

  return (
    <Stack spacing={3}>
      <Button
        size="small"
        startIcon={<IconoFlechaIzquierda sx={{ fontSize: 16 }} />}
        onClick={() => navegar('/carteras')}
        sx={{
          alignSelf: 'flex-start',
          px: 0,
          color: 'var(--color-texto-secundario)',
          fontWeight: 600,
        }}
      >
        Volver a carteras
      </Button>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: apariencia.fondo,
            color: apariencia.icono,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <apariencia.Icono sx={{ fontSize: 22 }} />
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
          {cartera.administrador && (
            <Typography
              sx={{
                fontSize: '0.8125rem',
                color: 'var(--color-texto-terciario)',
              }}
            >
              Administrada por {cartera.administrador}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          onClick={() => setModalAbierto(true)}
          disabled={cartera.estatus !== 'Activa'}
          sx={{ ml: 'auto' }}
        >
          Registrar transacción
        </Button>
      </Box>

      <Tabs
        value={seccion}
        onChange={(_evento, valor) => navegar(`/carteras/${id}/${valor}`)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ borderBottom: '1px solid var(--color-borde)' }}
      >
        {secciones.map((item) => (
          <Tab key={item.valor} value={item.valor} label={item.etiqueta} />
        ))}
      </Tabs>

      <Outlet context={{ cartera, id, recarga, recargar }} />

      {modalAbierto && (
        <DialogoNuevaTransaccion
          idCartera={id}
          onCerrar={() => setModalAbierto(false)}
          onGuardada={() => {
            setModalAbierto(false)
            recargar()
          }}
        />
      )}
    </Stack>
  )
}

export default DetalleCartera
