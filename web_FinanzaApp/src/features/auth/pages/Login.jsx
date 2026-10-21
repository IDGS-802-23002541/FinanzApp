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
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import CampoContrasena from '../components/CampoContrasena.jsx'
import { iniciarSesion as iniciarSesionApi } from '../api.js'
import { useAuth } from '../../../hooks/useAuth.js'
import { IconoFlechaDerecha } from '../../../components/ui/Iconos.jsx'
import { ROLES } from '../../../utils/constantes.js'

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Login() {
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const { iniciarSesion } = useAuth()

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const validar = () => {
    const nuevos = {}

    if (!correo.trim()) {
      nuevos.correo = 'Ingresa tu correo electrónico.'
    } else if (!CORREO_VALIDO.test(correo.trim())) {
      nuevos.correo = 'Ingresa un correo válido.'
    }

    if (!contrasena) {
      nuevos.contrasena = 'Ingresa tu contraseña.'
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
      const sesion = await iniciarSesionApi({
        correo: correo.trim(),
        contrasenia: contrasena,
      })

      iniciarSesion(sesion)
      navegar(sesion.usuario.rol === ROLES.CLIENTE ? '/carteras' : '/admin', {
        replace: true,
      })
    } catch (err) {
      setError(
        err.status
          ? err.message
          : 'No pudimos iniciar sesión. Revisa tu conexión e intenta de nuevo.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout>
      <Typography variant="h1" sx={{ color: 'var(--color-texto)' }}>
        Inicia sesión
      </Typography>
      <Typography
        sx={{ mt: 1, color: 'var(--color-texto-terciario)' }}
      >
        Accede al panel web para consultar tus carteras, estadísticas y
        balances.
      </Typography>

      {ubicacion.state?.mensaje && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {ubicacion.state.mensaje}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" noValidate onSubmit={manejarEnvio} sx={{ mt: 4 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            value={correo}
            onChange={(evento) => setCorreo(evento.target.value)}
            error={Boolean(errores.correo)}
            helperText={errores.correo}
          />

          <CampoContrasena
            label="Contraseña"
            autoComplete="current-password"
            value={contrasena}
            onChange={(evento) => setContrasena(evento.target.value)}
            error={Boolean(errores.contrasena)}
            helperText={errores.contrasena}
          />
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Link component={RouterLink} to="/recuperar" sx={{ fontSize: '0.875rem' }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={enviando}
          endIcon={<IconoFlechaDerecha />}
          sx={{ mt: 3 }}
        >
          {enviando ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </Button>
      </Box>

      <Typography
        sx={{ mt: 4, textAlign: 'center', color: 'var(--color-texto-secundario)' }}
      >
        ¿Aún no tienes cuenta?{' '}
        <Link component={RouterLink} to="/registro">
          Regístrate gratis
        </Link>
      </Typography>
    </AuthLayout>
  )
}

export default Login
