import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material'
import Tarjeta from './Tarjeta.jsx'
import CampoContrasena from '../../auth/components/CampoContrasena.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import { ROLES } from '../../../utils/constantes.js'
import { desactivarCuenta, eliminarCuenta } from '../api.js'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'

const sxBoton = {
  px: 2,
  fontSize: '0.875rem',
}

const ACCIONES = {
  desactivar: {
    titulo: '¿Desactivar tu cuenta?',
    texto:
      'Tu cuenta quedará inactiva y cerraremos tu sesión: ya no podrás iniciar (no se borra ningún registro). ' +
      'Si tienes carteras propias, éstas pasarán a inactivas y tus colaboradores perderán acceso. ' +
      'Las transacciones que registraste se conservan.',
    boton: 'Desactivar cuenta',
  },
  eliminar: {
    titulo: '¿Eliminar tu cuenta?',
    texto:
      'Se eliminará el registro de tus datos y cerraremos tu sesión: ya no podrás iniciar. ' +
      'Si tienes carteras propias, éstas se eliminarán y tus colaboradores perderán acceso. ' +
      'Las transacciones que registraste se conservan.',
    boton: 'Eliminar cuenta',
  },
}

function ZonaRiesgo() {
  const { usuario, cerrarSesion } = useAuth()
  const navegar = useNavigate()
  const [accion, setAccion] = useState(null)
  const [contrasenia, setContrasenia] = useState('')
  const [errorContrasenia, setErrorContrasenia] = useState('')
  const [enviando, setEnviando] = useState(false)

  const abrir = (clave) => {
    setAccion(clave)
    setContrasenia('')
    setErrorContrasenia('')
  }

  const cancelar = () => {
    setAccion(null)
    setContrasenia('')
    setErrorContrasenia('')
  }

  const confirmar = async () => {
    if (!contrasenia) {
      setErrorContrasenia('Ingresa tu contraseña para confirmar.')
      return
    }

    setEnviando(true)
    setErrorContrasenia('')

    try {
      if (accion === 'eliminar') {
        await eliminarCuenta(contrasenia)
      } else {
        await desactivarCuenta(contrasenia)
      }

      await cerrarSesion()
      navegar('/login')
    } catch (err) {
      setErrorContrasenia(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (usuario?.rol !== ROLES.CLIENTE) return null

  const detalle = accion ? ACCIONES[accion] : null

  return (
    <Tarjeta
      titulo="Zona de riesgo"
      subtitulo="Revísalas bien: sacan tu cuenta de servicio y afectan a las carteras de las que eres propietario."
    >
      <Box
        sx={{
          borderLeft: '3px solid var(--color-error)',
          backgroundColor: 'var(--color-peligro-fondo)',
          borderRadius: 'var(--radio-sm)',
          p: 1.5,
        }}
      >
        <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-error)' }}>
          Al desactivar o eliminar tu cuenta, tus carteras dejan de estar
          disponibles para ti y para sus colaboradores.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
        <Button
          variant="outlined"
          color="warning"
          onClick={() => abrir('desactivar')}
          sx={sxBoton}
        >
          Desactivar cuenta
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => abrir('eliminar')}
          sx={sxBoton}
        >
          Eliminar cuenta
        </Button>
      </Box>

      <Dialog open={Boolean(detalle)} onClose={cancelar} maxWidth="xs" fullWidth>
        <DialogoTitulo alCerrar={cancelar}>{detalle?.titulo}</DialogoTitulo>
        <DialogContent>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: 'var(--color-texto-secundario)',
            }}
          >
            {detalle?.texto}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <CampoContrasena
              size="small"
              label="Contraseña actual"
              autoComplete="current-password"
              value={contrasenia}
              onChange={(evento) => {
                setContrasenia(evento.target.value)
                setErrorContrasenia('')
              }}
              error={Boolean(errorContrasenia)}
              helperText={errorContrasenia}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelar} sx={sxBoton} disabled={enviando}>
            Cancelar
          </Button>
          <Button
            onClick={confirmar}
            variant="contained"
            color={accion === 'eliminar' ? 'error' : 'warning'}
            disabled={enviando}
            sx={sxBoton}
          >
            {enviando ? 'Procesando…' : detalle?.boton}
          </Button>
        </DialogActions>
      </Dialog>
    </Tarjeta>
  )
}

export default ZonaRiesgo
