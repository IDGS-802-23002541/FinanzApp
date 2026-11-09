import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import CampoContrasena from '../components/CampoContrasena.jsx'
import { registrar } from '../api.js'
import { CONTRASENIA_VALIDA, CORREO_VALIDO } from '../../../utils/constantes.js'
import { IconoFlechaDerecha } from '../../../components/ui/Iconos.jsx'


function Registro() {
  const navegar = useNavigate()

  const [formulario, setFormulario] = useState({
    nombreUsuario: '',
    apaterno: '',
    amaterno: '',
    correo: '',
    contrasenia: '',
    confirmarContrasenia: '',
  })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const actualizarCampo = (campo) => (evento) => {
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
  }

  const validar = () => {
    const nuevos = {}

    if (!formulario.nombreUsuario.trim()) {
      nuevos.nombreUsuario = 'Ingresa tu nombre.'
    }
    if (!formulario.apaterno.trim()) {
      nuevos.apaterno = 'Ingresa tu apellido paterno.'
    }
    if (!formulario.correo.trim()) {
      nuevos.correo = 'Ingresa tu correo electrónico.'
    } else if (!CORREO_VALIDO.test(formulario.correo.trim())) {
      nuevos.correo = 'Ingresa un correo válido.'
    }
    if (!formulario.contrasenia) {
      nuevos.contrasenia = 'Ingresa una contraseña.'
    } else if (!CONTRASENIA_VALIDA.test(formulario.contrasenia)) {
      nuevos.contrasenia =
        'Usa al menos 8 caracteres, una mayúscula y un número.'
    }
    if (formulario.confirmarContrasenia !== formulario.contrasenia) {
      nuevos.confirmarContrasenia = 'Las contraseñas no coinciden.'
    }

    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setError('')

    if (!validar()) return

    setEnviando(true)
    try {
      await registrar({
        nombreUsuario: formulario.nombreUsuario.trim(),
        apaterno: formulario.apaterno.trim(),
        amaterno: formulario.amaterno.trim(),
        correo: formulario.correo.trim(),
        contrasenia: formulario.contrasenia,
      })

      navegar('/login', {
        state: { mensaje: 'Tu cuenta se creó correctamente. Inicia sesión.' },
      })
    } catch (fallo) {
      setError(
        fallo.status
          ? fallo.message
          : 'No pudimos crear tu cuenta. Revisa tu conexión e intenta de nuevo.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout>
      <Typography variant="h1" sx={{ color: 'var(--color-texto)' }}>
        Crea tu cuenta
      </Typography>
      <Typography sx={{ mt: 1, color: 'var(--color-texto-terciario)' }}>
        Registra tus datos para empezar a organizar tus carteras.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" noValidate onSubmit={manejarEnvio} sx={{ mt: 4 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Nombre(s)"
            autoComplete="given-name"
            value={formulario.nombreUsuario}
            onChange={actualizarCampo('nombreUsuario')}
            error={Boolean(errores.nombreUsuario)}
            helperText={errores.nombreUsuario}
          />

          <TextField
            label="Apellido paterno"
            autoComplete="family-name"
            value={formulario.apaterno}
            onChange={actualizarCampo('apaterno')}
            error={Boolean(errores.apaterno)}
            helperText={errores.apaterno}
          />

          <TextField
            label="Apellido materno (opcional)"
            value={formulario.amaterno}
            onChange={actualizarCampo('amaterno')}
          />

          <TextField
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            value={formulario.correo}
            onChange={actualizarCampo('correo')}
            error={Boolean(errores.correo)}
            helperText={errores.correo}
          />

          <CampoContrasena
            label="Contraseña"
            autoComplete="new-password"
            value={formulario.contrasenia}
            onChange={actualizarCampo('contrasenia')}
            error={Boolean(errores.contrasenia)}
            helperText={errores.contrasenia}
          />

          <CampoContrasena
            label="Confirmar contraseña"
            autoComplete="new-password"
            value={formulario.confirmarContrasenia}
            onChange={actualizarCampo('confirmarContrasenia')}
            error={Boolean(errores.confirmarContrasenia)}
            helperText={errores.confirmarContrasenia}
          />
        </Stack>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={enviando}
          endIcon={<IconoFlechaDerecha />}
          sx={{ mt: 3 }}
        >
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </Box>

      <Typography
        sx={{ mt: 4, textAlign: 'center', color: 'var(--color-texto-secundario)' }}
      >
        ¿Ya tienes cuenta?{' '}
        <Link component={RouterLink} to="/login">
          Inicia sesión
        </Link>
      </Typography>
    </AuthLayout>
  )
}

export default Registro
