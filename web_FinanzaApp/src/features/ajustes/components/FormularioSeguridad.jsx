import { useState } from 'react'
import { Alert, Box, Button } from '@mui/material'
import Tarjeta from './Tarjeta.jsx'
import CampoContrasena from '../../auth/components/CampoContrasena.jsx'
import { IconoCandado } from '../../../components/ui/Iconos.jsx'
import { CONTRASENIA_VALIDA } from '../../../utils/constantes.js'
import { cambiarContrasenia } from '../api.js'

const FORMULARIO_VACIO = { actual: '', nueva: '', confirmar: '' }

const sxBoton = {
  minHeight: 0,
  py: 0.75,
  px: 2,
  fontSize: '0.875rem',
  borderColor: 'var(--color-borde-fuerte)',
}

function validar({ actual, nueva, confirmar }) {
  const errores = {}

  if (!actual.trim()) {
    errores.actual = 'Ingresa tu contraseña actual.'
  }

  if (!nueva) {
    errores.nueva = 'Ingresa una contraseña nueva.'
  } else if (!CONTRASENIA_VALIDA.test(nueva)) {
    errores.nueva = 'Usa al menos 8 caracteres, una mayúscula y un número.'
  } else if (nueva === actual) {
    errores.nueva = 'La contraseña nueva debe ser distinta a la actual.'
  }

  if (confirmar !== nueva) {
    errores.confirmar = 'Las contraseñas no coinciden.'
  }

  return errores
}

function FormularioSeguridad() {
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [errores, setErrores] = useState({})
  const [aviso, setAviso] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const actualizar = (campo) => (evento) => {
    setAviso(null)
    setErrores((actual) => ({ ...actual, [campo]: undefined }))
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
  }

  const cambiar = async (evento) => {
    evento.preventDefault()

    const nuevosErrores = validar(formulario)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    setAviso(null)

    try {
      await cambiarContrasenia({
        actual: formulario.actual,
        nueva: formulario.nueva,
      })

      setFormulario(FORMULARIO_VACIO)
      setAviso({
        severidad: 'success',
        texto: 'Contraseña actualizada correctamente.',
      })
    } catch (err) {
      setAviso({ severidad: 'error', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Tarjeta
      titulo="Seguridad"
      subtitulo="La contraseña se pide para confirmar que eres tú."
    >
      <Box component="form" noValidate onSubmit={cambiar}>
        <CampoContrasena
          size="small"
          label="Contraseña actual"
          autoComplete="current-password"
          value={formulario.actual}
          onChange={actualizar('actual')}
          error={Boolean(errores.actual)}
          helperText={errores.actual}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 2,
            mt: 2,
          }}
        >
          <CampoContrasena
            size="small"
            label="Nueva contraseña"
            autoComplete="new-password"
            value={formulario.nueva}
            onChange={actualizar('nueva')}
            error={Boolean(errores.nueva)}
            helperText={errores.nueva}
          />
          <CampoContrasena
            size="small"
            label="Confirmar contraseña"
            autoComplete="new-password"
            value={formulario.confirmar}
            onChange={actualizar('confirmar')}
            error={Boolean(errores.confirmar)}
            helperText={errores.confirmar}
          />
        </Box>

        {aviso && (
          <Alert severity={aviso.severidad} sx={{ mt: 2 }}>
            {aviso.texto}
          </Alert>
        )}

        <Button
          type="submit"
          variant="outlined"
          startIcon={<IconoCandado />}
          disabled={enviando}
          sx={{ mt: 2, ...sxBoton }}
        >
          {enviando ? 'Guardando…' : 'Cambiar contraseña'}
        </Button>
      </Box>
    </Tarjeta>
  )
}

export default FormularioSeguridad
