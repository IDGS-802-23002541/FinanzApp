import { useState } from 'react'
import {
  Box,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material'
import Tarjeta from './Tarjeta.jsx'
import { useTema } from '../../../hooks/useTema.js'

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

// Tarjeta "Preferencias" del mockup. Apariencia funciona con la sesión
// (HU-08.2); los avisos son maqueta de la HU-08.3.
function Preferencias() {
  const { tema, cambiarTema } = useTema()

  const [avisos, setAvisos] = useState({
    presupuesto: true,
    resumen: false,
  })

  const alternar = (clave) => (evento) => {
    setAvisos((actual) => ({ ...actual, [clave]: evento.target.checked }))
  }

  return (
    <Tarjeta
      titulo="Preferencias"
      subtitulo="Elección de tema"
    >
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <FormControlLabel
          sx={sxEtiqueta}
          control={
            <Switch
              checked={avisos.presupuesto}
              onChange={alternar('presupuesto')}
            />
          }
          label="Preferencia número 1"
        />
        <FormControlLabel
          sx={sxEtiqueta}
          control={
            <Switch checked={avisos.resumen} onChange={alternar('resumen')} />
          }
          label="Prefrencia número 2"
        />
        <FormControlLabel
          sx={sxEtiqueta}
          disabled
          control={<Switch disabled />}
          label={
            <>
              Notificaciones push{' '}
              <Typography
                component="span"
                sx={{fontSize: '0.78125rem', color: 'var(--color-texto-terciario)',}}
              >
                (fase 2)
              </Typography>
            </>
          }
        />
      </Box>
    </Tarjeta>
  )
}

export default Preferencias
