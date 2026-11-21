import { useState } from 'react'
import {
  Alert,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { crearComentario } from '../api.js'

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const CAMPOS_VACIOS = { nombre: '', correo: '', comentario: '' }

function validar({ nombre, correo, comentario }) {
  const errores = {}

  if (!nombre.trim()) {
    errores.nombre = 'Ingresa tu nombre.'
  } else if (nombre.trim().length > 120) {
    errores.nombre = 'El nombre no puede exceder los 120 caracteres.'
  }

  if (!correo.trim()) {
    errores.correo = 'Ingresa tu correo electrónico.'
  } else if (correo.trim().length > 254) {
    errores.correo = 'El correo no puede exceder los 254 caracteres.'
  } else if (!CORREO_VALIDO.test(correo.trim())) {
    errores.correo = 'Ingresa un correo válido.'
  }

  if (!comentario.trim()) {
    errores.comentario = 'Escribe tu comentario.'
  } else if (comentario.trim().length > 2000) {
    errores.comentario = 'El comentario no puede exceder los 2000 caracteres.'
  }

  return errores
}

function FormularioComentarios() {
  const [datos, setDatos] = useState(CAMPOS_VACIOS)
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const cambiar = (campo) => (evento) => {
    setDatos((actual) => ({ ...actual, [campo]: evento.target.value }))
    setErrores((actual) => ({ ...actual, [campo]: undefined }))
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setError('')
    setEnviado(false)

    const nuevosErrores = validar(datos)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    try {
      await crearComentario(datos)
      setDatos(CAMPOS_VACIOS)
      setEnviado(true)
    } catch (err) {
      setError(
        err.status
          ? err.message
          : 'No pudimos enviar tu comentario. Revisa tu conexión e intenta de nuevo.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Paper
      component="form"
      noValidate
      onSubmit={manejarEnvio}
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 4 },
        border: '1px solid var(--color-borde)',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Typography variant="h2" sx={{ fontSize: '1.4rem', fontWeight: 800 }}>
        Déjanos tu comentario
      </Typography>
      <Typography
        sx={{ mt: 0.5, color: 'var(--color-texto-secundario)' }}
      >
        Cuéntanos qué opinas o qué te gustaría ver en FinanzApp.
      </Typography>

      {enviado && (
        <Alert severity="success" sx={{ mt: 3 }}>
          ¡Gracias! Recibimos tu comentario.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2.5} sx={{ mt: 3 }}>
        <TextField
          label="Nombre"
          value={datos.nombre}
          onChange={cambiar('nombre')}
          error={Boolean(errores.nombre)}
          helperText={errores.nombre}
          slotProps={{ htmlInput: { maxLength: 120 } }}
        />

        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={datos.correo}
          onChange={cambiar('correo')}
          error={Boolean(errores.correo)}
          helperText={errores.correo}
          slotProps={{ htmlInput: { maxLength: 254 } }}
        />

        <TextField
          label="Comentario"
          multiline
          minRows={4}
          value={datos.comentario}
          onChange={cambiar('comentario')}
          error={Boolean(errores.comentario)}
          helperText={errores.comentario}
          slotProps={{ htmlInput: { maxLength: 2000 } }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={enviando}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
        >
          {enviando ? 'Enviando…' : 'Enviar comentario'}
        </Button>
      </Stack>
    </Paper>
  )
}

export default FormularioComentarios
