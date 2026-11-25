import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { actualizarTicket } from '../api.js'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'

const CATEGORIAS = [
  { valor: 'GENERAL', texto: 'General' },
  { valor: 'CUENTA', texto: 'Mi cuenta' },
  { valor: 'CARTERA', texto: 'Carteras' },
  { valor: 'PAGOS', texto: 'Pagos' },
  { valor: 'ERROR', texto: 'Error de la aplicación' },
  { valor: 'OTRO', texto: 'Otro' },
]

// Edición de un reporte pendiente (HU-09.3). El padre lo monta con
// key={ticket.idTicket} para que el formulario arranque con los datos actuales.
function DialogoEditarTicket({ ticket, abierto, alCerrar, alGuardar }) {
  const [formulario, setFormulario] = useState({
    asunto: ticket?.asunto ?? '',
    descripcion: ticket?.descripcion ?? '',
    categoria: ticket?.categoria ?? 'GENERAL',
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiar = (campo) => (evento) => {
    setError('')
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
  }

  const completo =
    formulario.asunto.trim() !== '' && formulario.descripcion.trim() !== ''

  const guardar = async () => {
    if (!completo || guardando) return

    setGuardando(true)
    setError('')
    try {
      const actualizado = await actualizarTicket(ticket.idTicket, {
        asunto: formulario.asunto.trim(),
        descripcion: formulario.descripcion.trim(),
        categoria: formulario.categoria,
      })
      if (alGuardar) alGuardar(actualizado)
    } catch (fallo) {
      setError(fallo.message || 'No se pudo actualizar el reporte.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Dialog open={abierto} onClose={alCerrar} fullWidth maxWidth="sm">
      <DialogoTitulo alCerrar={alCerrar}>
        Editar reporte #{ticket?.idTicket}
      </DialogoTitulo>

      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Asunto"
            size="small"
            required
            value={formulario.asunto}
            onChange={cambiar('asunto')}
            inputProps={{ maxLength: 150 }}
            helperText={`${formulario.asunto.length}/150`}
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

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={alCerrar} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={guardar}
          disabled={!completo || guardando}
        >
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogoEditarTicket
