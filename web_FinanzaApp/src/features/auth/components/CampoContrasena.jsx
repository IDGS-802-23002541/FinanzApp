import { useState } from 'react'
import {
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material'
import {
  IconoVisibilidad,
  IconoVisibilidadOculto,
} from '../../../components/ui/Iconos.jsx'

// Campo de contraseña con botón para mostrar u ocultar el texto.
function CampoContrasena({
  label,
  value,
  onChange,
  error,
  helperText,
  autoComplete,
  size,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      label={label}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      size={size}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setVisible((valor) => !valor)}
                edge="end"
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {visible ? <IconoVisibilidadOculto /> : <IconoVisibilidad />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}

export default CampoContrasena
