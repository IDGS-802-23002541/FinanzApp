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
import { restablecerContrasenia, solicitarCodigo } from '../api.js'
import { CONTRASENIA_VALIDA, CORREO_VALIDO} from '../../../utils/constantes.js'
import { IconoFlechaDerecha } from '../../../components/ui/Iconos.jsx'

const TEXTOS_PASO = {
  1: {
    titulo: 'Recupera tu contraseña',
    descripcion: 'Escribe el correo de tu cuenta y te enviaremos un código.',
  },
  2: {
    titulo: 'Ingresa el código',
    descripcion: 'Revisa tu correo y escribe el código de validación.',
  },
  3: {
    titulo: 'Crea una nueva contraseña',
    descripcion: 'Define la contraseña con la que entrarás de ahora en adelante.',
  },
}

function RecuperarContrasena() {
  const navegar = useNavigate()

  const [paso, setPaso] = useState(1)
  const [correo, setCorreo] = useState('')
  const [codigo, setCodigo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const validarPaso = () => {
    const nuevos = {}

    if (paso === 1) {
      if (!correo.trim()) {
        nuevos.correo = 'Ingresa tu correo electrónico.'
      } else if (!CORREO_VALIDO.test(correo.trim())) {
        nuevos.correo = 'Ingresa un correo válido.'
      }
    }

    if (paso === 2 && !codigo.trim()) {
      nuevos.codigo = 'Ingresa el código que recibiste.'
    }

    if (paso === 3) {
      if (!contrasena) {
        nuevos.contrasena = 'Ingresa una contraseña.'
      } else if (!CONTRASENIA_VALIDA.test(contrasena)) {
        nuevos.contrasena =
          'Usa al menos 8 caracteres, una mayúscula y un número.'
      }
      if (confirmarContrasena !== contrasena) {
        nuevos.confirmarContrasena = 'Las contraseñas no coinciden.'
      }
    }

    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setError('')

    if (!validarPaso()) return

    if (paso === 2) {
      setPaso(3)
      return
    }

    setEnviando(true)
    try {
      if (paso === 1) {
        await solicitarCodigo(correo.trim())
        setPaso(2)
      } else {
        await restablecerContrasenia({
          correo: correo.trim(),
          codigo: codigo.trim(),
          contrasenia: contrasena,
        })
        navegar('/login', {
          state: {
            mensaje: 'Tu contraseña se actualizó. Ya puedes iniciar sesión.',
          },
        })
      }
    } catch (fallo) {
      if (paso === 1) {
        setError(
          fallo.status === 404
            ? 'No encontramos una cuenta con ese correo.'
            : 'No pudimos enviar el código. Intenta de nuevo.',
        )
      } else {
        setError(
          fallo.status === 400
            ? 'El código no es válido o ya expiró.'
            : 'No pudimos cambiar tu contraseña. Intenta de nuevo.',
        )
      }
    } finally {
      setEnviando(false)
    }
  }

  const usarOtroCorreo = () => {
    setPaso(1)
    setCodigo('')
    setContrasena('')
    setConfirmarContrasena('')
    setErrores({})
    setError('')
  }

  return (
    <AuthLayout>
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-texto-terciario)',
        }}
      >
        Paso {paso} de 3
      </Typography>

      <Typography variant="h1" sx={{ color: 'var(--color-texto)' }}>
        {TEXTOS_PASO[paso].titulo}
      </Typography>
      <Typography sx={{ mt: 1, color: 'var(--color-texto-terciario)' }}>
        {TEXTOS_PASO[paso].descripcion}
      </Typography>

      {paso > 1 && (
        <Typography sx={{ mt: 2, color: 'var(--color-texto-secundario)' }}>
          Código enviado a <strong>{correo.trim()}</strong>
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" noValidate onSubmit={manejarEnvio} sx={{ mt: 4 }}>
        <Stack spacing={2.5}>
          {paso === 1 && (
            <TextField
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(evento) => setCorreo(evento.target.value)}
              error={Boolean(errores.correo)}
              helperText={errores.correo}
            />
          )}

          {paso === 2 && (
            <TextField
              label="Código de validación"
              autoComplete="one-time-code"
              value={codigo}
              onChange={(evento) => setCodigo(evento.target.value)}
              error={Boolean(errores.codigo)}
              helperText={errores.codigo}
            />
          )}

          {paso === 3 && (
            <>
              <CampoContrasena
                label="Nueva contraseña"
                autoComplete="new-password"
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
                error={Boolean(errores.contrasena)}
                helperText={errores.contrasena}
              />
              <CampoContrasena
                label="Confirmar contraseña"
                autoComplete="new-password"
                value={confirmarContrasena}
                onChange={(evento) =>
                  setConfirmarContrasena(evento.target.value)
                }
                error={Boolean(errores.confirmarContrasena)}
                helperText={errores.confirmarContrasena}
              />
            </>
          )}
        </Stack>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={enviando}
          endIcon={<IconoFlechaDerecha />}
          sx={{ mt: 3 }}
        >
          {paso === 1 && (enviando ? 'Enviando…' : 'Enviar código')}
          {paso === 2 && 'Continuar'}
          {paso === 3 && (enviando ? 'Guardando…' : 'Cambiar contraseña')}
        </Button>

        {paso > 1 && (
          <Button
            type="button"
            fullWidth
            variant="text"
            onClick={usarOtroCorreo}
            sx={{ mt: 1, color: 'var(--color-texto-secundario)' }}
          >
            Usar otro correo
          </Button>
        )}
      </Box>

      <Typography
        sx={{ mt: 4, textAlign: 'center', color: 'var(--color-texto-secundario)' }}
      >
        ¿Ya la recordaste?{' '}
        <Link component={RouterLink} to="/login">
          Inicia sesión
        </Link>
      </Typography>
    </AuthLayout>
  )
}

export default RecuperarContrasena
