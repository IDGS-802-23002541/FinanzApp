import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { crearTicket } from '../api.js'

// Catálogo que acepta el backend en POST /soporte/tickets.
// La prioridad NO se pide al cliente: la asigna el personal de soporte.
const CATEGORIAS = [
  { valor: 'GENERAL', texto: 'General' },
  { valor: 'CUENTA', texto: 'Mi cuenta' },
  { valor: 'CARTERA', texto: 'Carteras' },
  { valor: 'PAGOS', texto: 'Pagos' },
  { valor: 'ERROR', texto: 'Error de la aplicación' },
  { valor: 'OTRO', texto: 'Otro' },
]

const VACIO = { asunto: '', descripcion: '', categoria: 'GENERAL' }

// Formulario de alta de reporte de ayuda (ticket #208). Vive dentro del diálogo
// "Nuevo reporte", así que el título lo pone el diálogo.
function FormularioTicket({ alCrear }) {
  const [formulario, setFormulario] = useState(VACIO)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cambiar = (campo) => (evento) => {
    setError('')
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
  }

  const completo =
    formulario.asunto.trim() !== '' && formulario.descripcion.trim() !== ''

  const enviar = async (evento) => {
    evento.preventDefault()
    if (!completo || enviando) return

    setEnviando(true)
    setError('')
    try {
      const ticket = await crearTicket({
        asunto: formulario.asunto.trim(),
        descripcion: formulario.descripcion.trim(),
        categoria: formulario.categoria,
      })
      setFormulario(VACIO)
      alCrear?.(ticket)
    } catch (fallo) {
      setError(fallo.message || 'No se pudo crear el reporte.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Box component="form" noValidate onSubmit={enviar}>
      <Typography
        variant="body2"
        sx={{ color: 'var(--color-texto-secundario)', mb: 2 }}
      >
        Cuéntanos qué pasó y te responderemos en este mismo apartado.
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Asunto"
          size="small"
          required
          value={formulario.asunto}
          onChange={cambiar('asunto')}
          inputProps={{ maxLength: 150 }}
          helperText={`${formulario.asunto.length}/150`}
          error={Boolean(error) && formulario.asunto.trim() === ''}
        />

        <TextField
          label="Descripción"
          size="small"
          required
          multiline
          minRows={4}
          value={formulario.descripcion}
          onChange={cambiar('descripcion')}
          inputProps={{ maxLength: 3000 }}
          helperText={`${formulario.descripcion.length}/3000`}
          error={Boolean(error) && formulario.descripcion.trim() === ''}
        />

        <TextField
          select
          label="Categoría"
          size="small"
          value={formulario.categoria}
          onChange={cambiar('categoria')}
        >
          {CATEGORIAS.map((categoria) => (
            <MenuItem key={categoria.valor} value={categoria.valor}>
              {categoria.texto}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={!completo || enviando}
        sx={{ mt: 2 }}
      >
        {enviando ? 'Enviando…' : 'Enviar reporte'}
      </Button>
    </Box>
  )
}

export default FormularioTicket
