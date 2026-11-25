import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { crearTrabajador } from '../api.js'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'

const FORMULARIO_VACIO = {
  nombreUsuario: '',
  apaterno: '',
  amaterno: '',
  correo: '',
}

const CORREO_VALIDO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const sxBoton = {
  px: 2,
  fontSize: '0.875rem',
  textTransform: 'none',
}

// CA1 y CA2 de HU-11.1: nombre y correo obligatorios; el correo repetido lo
// rechaza el backend.
function validar({ nombreUsuario, apaterno, correo }) {
  const errores = {}

  if (!nombreUsuario.trim()) errores.nombreUsuario = 'Escribe el nombre.'
  if (!apaterno.trim()) errores.apaterno = 'Escribe el apellido paterno.'

  if (!correo.trim()) {
    errores.correo = 'Escribe el correo.'
  } else if (!CORREO_VALIDO.test(correo.trim())) {
    errores.correo = 'El correo no tiene un formato válido.'
  }

  return errores
}

function DialogoNuevoTrabajador({ abierto, onCerrar, onCreado }) {
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [errores, setErrores] = useState({})
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [temporal, setTemporal] = useState('')

  const cerrar = () => {
    setFormulario(FORMULARIO_VACIO)
    setErrores({})
    setErrorEnvio('')
    setTemporal('')
    onCerrar()
  }

  const actualizar = (campo) => (evento) =>
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))

  const guardar = async (evento) => {
    evento.preventDefault()

    const encontrados = validar(formulario)
    setErrores(encontrados)
    setErrorEnvio('')
    if (Object.keys(encontrados).length > 0) return

    setEnviando(true)
    try {
      const { contraseniaTemporal } = await crearTrabajador(formulario)
      setTemporal(contraseniaTemporal)
      onCreado()
    } catch (err) {
      setErrorEnvio(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={abierto} onClose={cerrar} fullWidth maxWidth="xs">
      <Box component="form" onSubmit={guardar} noValidate>
        <DialogoTitulo alCerrar={cerrar}>Nuevo trabajador</DialogoTitulo>

        <DialogContent>
          {temporal ? (
            <Stack spacing={1.5}>
              <Alert severity="success">
                Trabajador creado. Comparte estos datos con la persona.
              </Alert>
              <Typography variant="body2">
                Contraseña temporal:{' '}
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {temporal}
                </Box>
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--color-texto-terciario)' }}
              >
                Se le pedirá cambiarla al iniciar sesión. Cópiala ahora: no se
                vuelve a mostrar.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                size="small"
                label="Nombre"
                value={formulario.nombreUsuario}
                onChange={actualizar('nombreUsuario')}
                error={Boolean(errores.nombreUsuario)}
                helperText={errores.nombreUsuario}
                autoFocus
              />
              <TextField
                size="small"
                label="Apellido paterno"
                value={formulario.apaterno}
                onChange={actualizar('apaterno')}
                error={Boolean(errores.apaterno)}
                helperText={errores.apaterno}
              />
              <TextField
                size="small"
                label="Apellido materno (opcional)"
                value={formulario.amaterno}
                onChange={actualizar('amaterno')}
              />
              <TextField
                size="small"
                label="Correo"
                type="email"
                value={formulario.correo}
                onChange={actualizar('correo')}
                error={Boolean(errores.correo)}
                helperText={errores.correo}
              />

              {errorEnvio && <Alert severity="error">{errorEnvio}</Alert>}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={cerrar} disabled={enviando} sx={sxBoton}>
            {temporal ? 'Listo' : 'Cancelar'}
          </Button>
          {!temporal && (
            <Button
              type="submit"
              variant="contained"
              disabled={enviando}
              sx={sxBoton}
            >
              {enviando ? 'Creando…' : 'Crear trabajador'}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default DialogoNuevoTrabajador
