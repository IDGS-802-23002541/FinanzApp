import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material'
import Tarjeta from './Tarjeta.jsx'
import { useTema } from '../../../hooks/useTema.js'
import { guardarPreferencias, obtenerPreferencias } from '../api.js'

const sxEtiqueta = {
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: 'var(--color-texto)',
  },
}
const estiloSeccion = {
  fontSize: '0.875rem',
  fontWeight: 700,
  color: 'var(--color-texto)',
}

// Interruptores de la HU-08.3; el backend los devuelve todos en true por defecto.
const AVISOS = [
  { campo: 'notificacionesMovimientos', etiqueta: 'Movimientos en cartera' },
  { campo: 'notificacionesSistema', etiqueta: 'Recordatorios del sistema' },
  { campo: 'notificacionesPagos', etiqueta: 'Recordatorios de pagos recurrentes' },
]

const AVISOS_INICIALES = {
  notificacionesMovimientos: true,
  notificacionesSistema: true,
  notificacionesPagos: true,
}

// Tarjeta "Preferencias": el tema vive en la sesión (HU-08.2) y los avisos
// se guardan de inmediato contra /auth/preferencias (HU-08.3).
function Preferencias() {
  const { tema, cambiarTema } = useTema()

  const [avisos, setAvisos] = useState(AVISOS_INICIALES)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true

    async function cargar() {
      try {
        const datos = await obtenerPreferencias()
        if (!vigente) return
        setAvisos({
          notificacionesMovimientos: Boolean(datos.notificacionesMovimientos),
          notificacionesSistema: Boolean(datos.notificacionesSistema),
          notificacionesPagos: Boolean(datos.notificacionesPagos),
        })
      } catch (fallo) {
        if (!vigente) return
        setError(fallo.message || 'No se pudieron cargar tus preferencias.')
      } finally {
        if (vigente) setCargando(false)
      }
    }

    cargar()
    return () => {
      vigente = false
    }
  }, [])

  const alternar = (campo) => async (evento) => {
    const valor = evento.target.checked
    const anterior = avisos[campo]

    setError('')
    setAvisos((actual) => ({ ...actual, [campo]: valor }))
    setGuardando(campo)

    try {
      await guardarPreferencias({ [campo]: valor })
    } catch (fallo) {
      setAvisos((actual) => ({ ...actual, [campo]: anterior }))
      setError(fallo.message || 'No se pudo guardar la preferencia.')
    } finally {
      setGuardando('')
    }
  }

  return (
    <Tarjeta titulo="Preferencias" subtitulo="Tema y avisos">
      <FormControlLabel
        sx={sxEtiqueta}
        control={
          <Switch
            checked={tema === 'oscuro'}
            onChange={(evento) =>
              cambiarTema(evento.target.checked ? 'oscuro' : 'claro')
            }
          />
        }
        label="Modo oscuro"
      />
      <Divider sx={{ my: 1.5, borderColor: 'var(--color-borde)' }} />

      <Typography sx={estiloSeccion}>Avisos</Typography>

      {cargando ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={22} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {AVISOS.map((aviso) => (
            <FormControlLabel
              key={aviso.campo}
              sx={sxEtiqueta}
              control={
                <Switch
                  checked={avisos[aviso.campo]}
                  onChange={alternar(aviso.campo)}
                  disabled={guardando === aviso.campo}
                />
              }
              label={aviso.etiqueta}
            />
          ))}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error}
        </Alert>
      )}
    </Tarjeta>
  )
}

export default Preferencias
