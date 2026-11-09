import { useState } from 'react'
import { Alert, Box, Button, TextField } from '@mui/material'
import Tarjeta from './Tarjeta.jsx'
import Dato from './Dato.jsx'
import { AvatarUsuario, IconoCheck } from '../../../components/ui/Iconos.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import { formatearFecha } from '../../../utils/formato.js'

const sxCampo = { gridColumn: '1 / -1' }
const sxBoton = {
  minHeight: 0,
  py: 0.75,
  px: 2,
  fontSize: '0.875rem',
}

// Tarjeta "Perfil" (mockup): los datos de la cuenta viven aquí, incluida la
// fecha de registro en solo lectura. La edición es la HU-08.1.
function FormularioPerfil() {
  const { usuario } = useAuth()

  const formularioInicial = {
    nombreUsuario: usuario?.nombreUsuario ?? '',
    apaterno: usuario?.apaterno ?? '',
    amaterno: usuario?.amaterno ?? '',
    telefono: '',
    correo: usuario?.correo ?? '',
  }

  const [formulario, setFormulario] = useState(formularioInicial)
  const [aviso, setAviso] = useState('')

  const hayCambios =
    JSON.stringify(formulario) !== JSON.stringify(formularioInicial)

  const actualizar = (campo) => (evento) => {
    setAviso('')
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
  }

  const guardar = (evento) => {
    evento.preventDefault()
    if (!hayCambios) return
    setAviso('Pendiente del backend: aún no existe el endpoint para editar el perfil (HU-08.1).')
  }

  const iniciales = [usuario?.nombreUsuario, usuario?.apaterno]
    .filter(Boolean)
    .map((parte) => parte.charAt(0))
    .join('')
    .toUpperCase()

  return (
    <Tarjeta
      titulo="Perfil"
      subtitulo="Tu nombre y contacto se reflejan en toda la app."
      avatar={
        <AvatarUsuario
          nombreUsuario={usuario?.nombreUsuario}
          iniciales={iniciales}
          tamano={44}
        />
      }
    >
      <Box component="form" noValidate onSubmit={guardar}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 2,
          }}
        >
          <TextField
            size="small"
            label="Nombre"
            autoComplete="given-name"
            value={formulario.nombreUsuario}
            onChange={actualizar('nombreUsuario')}
          />
          <TextField
            size="small"
            label="Apellido paterno"
            autoComplete="family-name"
            value={formulario.apaterno}
            onChange={actualizar('apaterno')}
          />
          <TextField
            size="small"
            label="Apellido materno"
            value={formulario.amaterno}
            onChange={actualizar('amaterno')}
          />
          <TextField
            size="small"
            label="Teléfono"
            value={formulario.telefono}
            onChange={actualizar('telefono')}
          />
          <TextField
            size="small"
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            value={formulario.correo}
            onChange={actualizar('correo')}
            sx={sxCampo}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Dato
            etiqueta="Fecha de registro"
            valor={formatearFecha(usuario?.fechaRegistro)}
          />
        </Box>

        {aviso && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {aviso}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          startIcon={<IconoCheck />}
          disabled={!hayCambios}
          sx={{ mt: 2, ...sxBoton }}
        >
          Guardar cambios
        </Button>
      </Box>
    </Tarjeta>
  )
}

export default FormularioPerfil
