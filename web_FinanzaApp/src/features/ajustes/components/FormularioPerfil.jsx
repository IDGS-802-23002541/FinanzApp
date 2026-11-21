import { useState } from 'react'
import { Alert, Box, Button, TextField } from '@mui/material'
import Tarjeta from './Tarjeta.jsx'
import Dato from './Dato.jsx'
import { AvatarUsuario, IconoCheck } from '../../../components/ui/Iconos.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import { editarCuenta } from '../api.js'
import { formatearFecha } from '../../../utils/formato.js'
import { CORREO_VALIDO } from '../../../utils/constantes.js'

const sxCampo = { gridColumn: '1 / -1' }
const sxBoton = {
  minHeight: 0,
  py: 0.75,
  px: 2,
  fontSize: '0.875rem',
}

function datosDeUsuario(usuario) {
  return {
    nombreUsuario: usuario?.nombreUsuario ?? '',
    apaterno: usuario?.apaterno ?? '',
    amaterno: usuario?.amaterno ?? '',
    correo: usuario?.correo ?? '',
  }
}

function validar({ nombreUsuario, apaterno, amaterno, correo }) {
  const errores = {}

  if (!nombreUsuario.trim()) {
    errores.nombreUsuario = 'Ingresa tu nombre.'
  } else if (nombreUsuario.trim().length > 80) {
    errores.nombreUsuario = 'El nombre no puede exceder los 80 caracteres.'
  }

  if (apaterno.trim().length > 80) {
    errores.apaterno = 'El apellido no puede exceder los 80 caracteres.'
  }

  if (amaterno.trim().length > 80) {
    errores.amaterno = 'El apellido no puede exceder los 80 caracteres.'
  }

  if (!correo.trim()) {
    errores.correo = 'Ingresa tu correo electrónico.'
  } else if (correo.trim().length > 254) {
    errores.correo = 'El correo no puede exceder los 254 caracteres.'
  } else if (!CORREO_VALIDO.test(correo.trim())) {
    errores.correo = 'Ingresa un correo válido.'
  }

  return errores
}

// Tarjeta "Perfil": edita nombre, apellidos y correo (HU-08.1). La fecha de
// registro se muestra en solo lectura.
function FormularioPerfil() {
  const { usuario, actualizarUsuario } = useAuth()

  const formularioInicial = datosDeUsuario(usuario)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [errores, setErrores] = useState({})
  const [aviso, setAviso] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const hayCambios =
    JSON.stringify(formulario) !== JSON.stringify(formularioInicial)

  const actualizar = (campo) => (evento) => {
    setAviso(null)
    setErrores((actual) => ({ ...actual, [campo]: undefined }))
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
  }

  const guardar = async (evento) => {
    evento.preventDefault()
    if (!hayCambios || guardando) return

    const nuevosErrores = validar(formulario)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setGuardando(true)
    setAviso(null)
    try {
      const datos = await editarCuenta(formulario)
      actualizarUsuario(datos)
      setFormulario(datosDeUsuario(datos))
      setAviso({
        tipo: 'success',
        texto: 'Tus datos se actualizaron correctamente.',
      })
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message })
    } finally {
      setGuardando(false)
    }
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
            error={Boolean(errores.nombreUsuario)}
            helperText={errores.nombreUsuario}
            slotProps={{ htmlInput: { maxLength: 80 } }}
          />
          <TextField
            size="small"
            label="Apellido paterno"
            autoComplete="family-name"
            value={formulario.apaterno}
            onChange={actualizar('apaterno')}
            error={Boolean(errores.apaterno)}
            helperText={errores.apaterno}
            slotProps={{ htmlInput: { maxLength: 80 } }}
          />
          <TextField
            size="small"
            label="Apellido materno"
            value={formulario.amaterno}
            onChange={actualizar('amaterno')}
            error={Boolean(errores.amaterno)}
            helperText={errores.amaterno}
            slotProps={{ htmlInput: { maxLength: 80 } }}
          />
          <TextField
            size="small"
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            value={formulario.correo}
            onChange={actualizar('correo')}
            error={Boolean(errores.correo)}
            helperText={errores.correo}
            slotProps={{ htmlInput: { maxLength: 254 } }}
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
          <Alert severity={aviso.tipo} sx={{ mt: 2 }}>
            {aviso.texto}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          startIcon={<IconoCheck />}
          disabled={!hayCambios || guardando}
          sx={{ mt: 2, ...sxBoton }}
        >
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </Box>
    </Tarjeta>
  )
}

export default FormularioPerfil
