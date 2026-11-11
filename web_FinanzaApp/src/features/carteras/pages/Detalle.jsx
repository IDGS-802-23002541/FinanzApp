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
import { IconoCasa } from '../../../components/ui/Iconos.jsx'
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

  const segmento = location.pathname.split('/').pop()
  const seccion = SECCIONES.some((s) => s.valor === segmento)
    ? segmento
    : 'resumen'
  const recargar = () => setRecarga((n) => n + 1)

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
        {SECCIONES.map((item) => (
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
