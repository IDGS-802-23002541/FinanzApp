import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material'
import { eliminarTrabajador } from '../api.js'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'

const sxBoton = {
  px: 2,
  fontSize: '0.875rem',
  textTransform: 'none',
}

// CA2 y CA3 de HU-11.3: baja lógica con aviso si quedan tickets abiertos.
function DialogoEliminarTrabajador({ trabajador, onCerrar, onEliminado }) {
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)

  const abiertos = (trabajador.tickets ?? []).filter(
    (ticket) => ticket.estado !== 'CERRADO',
  )

  const eliminar = async () => {
    setEnviando(true)
    setErrorEnvio('')

    try {
      await eliminarTrabajador(trabajador.idUsuario)
      onEliminado()
    } catch (err) {
      setErrorEnvio(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="xs">
      <DialogoTitulo alCerrar={onCerrar}>
        ¿Dar de baja a {trabajador.nombre}?
      </DialogoTitulo>

      <DialogContent>
        <Typography variant="body2">
          El trabajador quedará inactivo y ya no podrá iniciar sesión. Su
          registro y los tickets que cerró se conservan.
        </Typography>

        {abiertos.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Tiene {abiertos.length}{' '}
            {abiertos.length === 1 ? 'ticket abierto' : 'tickets abiertos'}. Al
            darlo de baja quedan sin asignar.
          </Alert>
        )}

        {errorEnvio && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorEnvio}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCerrar} disabled={enviando} sx={sxBoton}>
          Cancelar
        </Button>
        <Button
          onClick={eliminar}
          color="error"
          variant="contained"
          disabled={enviando}
          sx={sxBoton}
        >
          {enviando ? 'Dando de baja…' : 'Dar de baja'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogoEliminarTrabajador
