import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import Tarjeta from './Tarjeta.jsx'
import CampoContrasena from '../../auth/components/CampoContrasena.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import { ROLES } from '../../../utils/constantes.js'
import { desactivarCuenta } from '../api.js'

//COMENTARIO
//DESACTIVAR y ELIMINAR hacen la misma acción de desactivar la cuenta, pero el backend aún no tiene el endpoint para eliminarla 

const sxBoton = {
  minHeight: 0,
  py: 0.75,
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
    aviso:
      'Pendiente del backend: aún no existe el endpoint para eliminar la cuenta (HU-02.5b).',
  },
}

function ZonaRiesgo() {
  const { usuario, cerrarSesion } = useAuth()
  const navegar = useNavigate()
  const [accion, setAccion] = useState(null)
  const [contrasenia, setContrasenia] = useState('')
  const [errorContrasenia, setErrorContrasenia] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)

  const abrir = (clave) => {
    setAccion(clave)
    setContrasenia('')
    setErrorContrasenia('')
    setAviso('')
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

    if (accion === 'eliminar') {
      setAviso(ACCIONES.eliminar.aviso)
      cancelar()
      return
    }

    setEnviando(true)
    setErrorContrasenia('')

    try {
      await desactivarCuenta(contrasenia)

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
          borderLeft: '3px solid var(--color-alerta)',
          backgroundColor: 'var(--color-superficie-suave)',
          borderRadius: '8px',
          p: 1.5,
        }}
      >
        <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-alerta)' }}>
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

      {aviso && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {aviso}
        </Alert>
      )}

      <Dialog open={Boolean(detalle)} onClose={cancelar} maxWidth="xs" fullWidth>
        <DialogTitle>{detalle?.titulo}</DialogTitle>
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
