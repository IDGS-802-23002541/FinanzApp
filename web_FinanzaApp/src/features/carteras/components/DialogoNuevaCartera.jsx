import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { admitePeriodo } from '../api.js'

const CATEGORIAS = ['Hogar', 'Viaje', 'Evento', 'Otro']
const FORMULARIO_VACIO = {
  nombre: '',
  descripcion: '',
  categoria: '',
  presupuesto: '',
  fechaInicio: '',
  fechaFin: '',
}

const sxBoton = {
  minHeight: 0,
  py: 0.75,
  px: 2,
  fontSize: '0.875rem',
  textTransform: 'none',
}

// CA2 de HU-03.1: nombre y categoría son obligatorios.
function validar({ nombre, categoria, presupuesto, fechaInicio, fechaFin }) {
  const errores = {}
  const nombreLimpio = nombre.trim()

  if (!nombreLimpio) {
    errores.nombre = 'Escribe el nombre de la cartera.'
  } else if (nombreLimpio.length > 100) {
    errores.nombre = 'El nombre admite máximo 100 caracteres.'
  }

  if (!categoria) {
    errores.categoria = 'Elige una categoría.'
  }

  // Las carteras de Hogar no manejan presupuesto ni fechas.
  if (!admitePeriodo(categoria)) return errores

  if (presupuesto !== '' && Number(presupuesto) < 0) {
    errores.presupuesto = 'El presupuesto no puede ser negativo.'
  }

  if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
    errores.fechaFin = 'La fecha fin no puede ser anterior a la fecha inicio.'
  }

  return errores
}

// Formulario de crear cartera (HU-03.1). Se monta al abrir el modal, así que
// siempre arranca limpio; el guardado lo hace la página.
function DialogoNuevaCartera({ onCerrar, onCrear }) {
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [errores, setErrores] = useState({})
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)

  const actualizar = (campo) => (evento) => {
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
    setErrorEnvio('')
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
  }

  // Al elegir Hogar se descartan presupuesto y fechas, porque no aplican.
  const cambiarCategoria = (evento) => {
    const categoria = evento.target.value

    setErrores((actuales) => ({ ...actuales, categoria: undefined }))
    setErrorEnvio('')
    setFormulario((actual) => ({
      ...actual,
      categoria,
      ...(admitePeriodo(categoria)
        ? {}
        : { presupuesto: '', fechaInicio: '', fechaFin: '' }),
    }))
  }

  const conPeriodo = Boolean(formulario.categoria) && admitePeriodo(formulario.categoria)

  const enviar = async (evento) => {
    evento.preventDefault()

    const nuevosErrores = validar(formulario)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    setErrorEnvio('')

    try {
      await onCrear(formulario)
    } catch (err) {
      // El backend valida lo mismo y devuelve el motivo; el modal sigue abierto.
      setErrorEnvio(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open onClose={onCerrar} maxWidth="md" fullWidth>
      <Box component="form" noValidate onSubmit={enviar}>
        <DialogTitle sx={{ fontWeight: 700 }}>Nueva cartera</DialogTitle>

        <DialogContent dividers>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: 'var(--color-texto-secundario)',
              mb: 2,
            }}
          >
            Dale un nombre y elige el tipo de cartera; podrás agregar miembros
            después.
          </Typography>

          <Stack spacing={2}>
            <TextField
              size="small"
              label="Nombre de la cartera"
              placeholder="Ej. Casa Borja"
              value={formulario.nombre}
              onChange={actualizar('nombre')}
              error={Boolean(errores.nombre)}
              helperText={errores.nombre}
              autoFocus
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />

            <TextField
              size="small"
              label="Descripción"
              placeholder="¿Para qué se usa esta cartera?"
              multiline
              minRows={2}
              value={formulario.descripcion}
              onChange={actualizar('descripcion')}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              <TextField
                size="small"
                select
                label="Categoría"
                value={formulario.categoria}
                onChange={cambiarCategoria}
                error={Boolean(errores.categoria)}
                helperText={errores.categoria}
                slotProps={{
                  select: { displayEmpty: true },
                  // Con displayEmpty el label se encimaba al texto del placeholder.
                  inputLabel: { shrink: true },
                }}
              >
                <MenuItem value="" disabled>
                  Selecciona una categoría
                </MenuItem>
                {CATEGORIAS.map((categoria) => (
                  <MenuItem key={categoria} value={categoria}>
                    {categoria}
                  </MenuItem>
                ))}
              </TextField>

              {conPeriodo && (
                <TextField
                  size="small"
                  label="Presupuesto inicial"
                  placeholder="$0.00"
                  type="number"
                  value={formulario.presupuesto}
                  onChange={actualizar('presupuesto')}
                  error={Boolean(errores.presupuesto)}
                  helperText={errores.presupuesto}
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                />
              )}

              {conPeriodo && (
                <>
                  <TextField
                    size="small"
                    label="Fecha de inicio"
                    type="date"
                    value={formulario.fechaInicio}
                    onChange={actualizar('fechaInicio')}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    size="small"
                    label="Fecha de fin"
                    type="date"
                    value={formulario.fechaFin}
                    onChange={actualizar('fechaFin')}
                    error={Boolean(errores.fechaFin)}
                    helperText={errores.fechaFin}
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { min: formulario.fechaInicio || undefined },
                    }}
                  />
                </>
              )}
            </Box>

            {formulario.categoria === 'Hogar' && (
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-texto-terciario)',
                }}
              >
                Las carteras de Hogar no manejan presupuesto ni fechas de
                vigencia.
              </Typography>
            )}

            {errorEnvio && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errorEnvio}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onCerrar} sx={sxBoton}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={enviando} sx={sxBoton}>
            {enviando ? 'Creando…' : 'Crear cartera'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default DialogoNuevaCartera
