import { useState } from 'react'
import { Box, FormControlLabel, Switch, Typography } from '@mui/material'
import Tarjeta from './Tarjeta.jsx'

const sxEtiqueta = {
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: 'var(--color-texto)',
  },
}

// Tarjeta "Preferencias" del mockup (Pendiente con la HU-08.3)
function Preferencias() {
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
      subtitulo="Se guardan en este dispositivo para la demo."
    >
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
                sx={{ fontSize: '0.78125rem', color: 'var(--color-texto-terciario)' }}
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
