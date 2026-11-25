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
import {
  confirmarReactivacion,
  solicitarCodigoReactivacion,
} from '../api.js'
import { CORREO_VALIDO } from '../../../utils/constantes.js'
import { IconoFlechaDerecha } from '../../../components/ui/Iconos.jsx'

const TEXTOS_PASO = {
  1: {
    titulo: 'Reactiva tu cuenta',
    descripcion:
      'Escribe el correo de tu cuenta desactivada y te enviaremos un código.',
  },
  2: {
    titulo: 'Ingresa el código',
    descripcion: 'Revisa tu correo y escribe el código que te enviamos.',
  },
}

function ReactivarCuenta() {
  const navegar = useNavigate()

  const [paso, setPaso] = useState(1)
  const [correo, setCorreo] = useState('')
  const [codigo, setCodigo] = useState('')
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

    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setError('')

    if (!validarPaso()) return

    if (paso === 2) {
      setEnviando(true)
      try {
        await confirmarReactivacion({
          correo: correo.trim(),
          codigo: codigo.trim(),
        })
        navegar('/login', {
          state: {
            mensaje: 'Tu cuenta se reactivó. Ya puedes iniciar sesión.',
          },
        })
      } catch (fallo) {
        setError(
          fallo.status === 400
            ? 'El código no es válido o ya expiró.'
            : 'No pudimos reactivar tu cuenta. Intenta de nuevo.',
        )
      } finally {
        setEnviando(false)
      }
      return
    }

    setEnviando(true)
    try {
      await solicitarCodigoReactivacion(correo.trim())
      setPaso(2)
    } catch {
      setError('No pudimos enviar el código. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout volverA="/login" textoVolver="Volver a iniciar sesión">
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-texto-terciario)',
        }}
      >
        Paso {paso} de 2
      </Typography>

      <Typography variant="h1" sx={{ color: 'var(--color-texto)' }}>
        {TEXTOS_PASO[paso].titulo}
      </Typography>

      <Typography sx={{ mt: 1, color: 'var(--color-texto-terciario)' }}>
        {TEXTOS_PASO[paso].descripcion}
      </Typography>

      {paso === 2 && (
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
          {paso === 2 && (enviando ? 'Reactivando…' : 'Reactivar cuenta')}
        </Button>

        {paso === 2 && (
          <Button
            type="button"
            fullWidth
            variant="text"
            onClick={() => {
              setPaso(1)
              setCodigo('')
              setErrores({})
              setError('')
            }}
            sx={{ mt: 1, color: 'var(--color-texto-secundario)' }}
          >
            Usar otro correo
          </Button>
        )}
      </Box>

      <Typography
        sx={{ mt: 4, textAlign: 'center', color: 'var(--color-texto-secundario)' }}
      >
        ¿Ya la reactivaste?{' '}
        <Link component={RouterLink} to="/login">
          Inicia sesión
        </Link>
      </Typography>
    </AuthLayout>
  )
}

export default ReactivarCuenta
