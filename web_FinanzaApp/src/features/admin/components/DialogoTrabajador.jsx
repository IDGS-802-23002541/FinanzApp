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
import { editarTrabajador, crearTrabajador } from '../api.js'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'

const CORREO_VALIDO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const sxBoton = {
  px: 2,
  fontSize: '0.875rem',
  textTransform: 'none',
}

// CA1 de HU-11.1 y HU-11.3: mismas validaciones al crear y al editar.
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

function valoresIniciales(trabajador) {
  if (!trabajador) {
    return { nombreUsuario: '', apaterno: '', amaterno: '', correo: '' }
  }

  return {
    nombreUsuario: trabajador.nombreUsuario ?? '',
    apaterno: trabajador.apaterno ?? '',
    amaterno: trabajador.amaterno ?? '',
    correo: trabajador.correo ?? '',
  }
}

function DialogoTrabajador({ trabajador, onCerrar, onGuardado }) {
  const esEdicion = Boolean(trabajador)
  const [formulario, setFormulario] = useState(() =>
    valoresIniciales(trabajador),
  )
  const [errores, setErrores] = useState({})
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [temporal, setTemporal] = useState('')

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
      if (esEdicion) {
        await editarTrabajador(trabajador.idUsuario, formulario)
        onGuardado()
        return
      }

      const { contraseniaTemporal } = await crearTrabajador(formulario)
      setTemporal(contraseniaTemporal)
      onGuardado()
    } catch (err) {
      setErrorEnvio(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="xs">
      <Box component="form" onSubmit={guardar} noValidate>
        <DialogoTitulo alCerrar={onCerrar}>
          {esEdicion ? 'Editar trabajador' : 'Nuevo trabajador'}
        </DialogoTitulo>

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
          <Button onClick={onCerrar} disabled={enviando} sx={sxBoton}>
            {temporal ? 'Listo' : 'Cancelar'}
          </Button>
          {!temporal && (
            <Button
              type="submit"
              variant="contained"
              disabled={enviando}
              sx={sxBoton}
            >
              {enviando
                ? 'Guardando…'
                : esEdicion
                  ? 'Guardar cambios'
                  : 'Crear trabajador'}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default DialogoTrabajador
