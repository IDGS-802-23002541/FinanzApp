import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { admitePeriodo, crearCartera, editarCartera } from '../api.js'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'

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
  px: 2,
  fontSize: '0.875rem',
  textTransform: 'none',
}

// Precarga el formulario cuando se edita; en creacion arranca limpio.
function valoresIniciales(cartera) {
  if (!cartera) return FORMULARIO_VACIO

  return {
    nombre: cartera.nombre ?? '',
    descripcion: cartera.descripcion ?? '',
    categoria: cartera.categoria ?? '',
    presupuesto:
      cartera.presupuestoInicial != null
        ? String(cartera.presupuestoInicial)
        : '',
    fechaInicio: cartera.fechaInicio ?? '',
    fechaFin: cartera.fechaFin ?? '',
  }
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

// Formulario de crear/editar cartera (HU-03.1 y HU-04.5). Se monta al abrir el
// modal; si recibe cartera precarga los datos y guarda contra la API.
function DialogoNuevaCartera({ cartera, onCerrar, onGuardada }) {
  const tema = useTheme()
  // En pantallas chicas el formulario ocupa toda la pantalla.
  const pantallaChica = useMediaQuery(tema.breakpoints.down('sm'))
  const esEdicion = Boolean(cartera)
  const [formulario, setFormulario] = useState(() => valoresIniciales(cartera))
  const [errores, setErrores] = useState({})
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)

  const actualizar = (campo) => (evento) => {
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
    setErrorEnvio('')
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
  }

  // Presupuesto: solo dígitos y un punto decimal; descarta cualquier letra o símbolo.
  const actualizarPresupuesto = (evento) => {
    const limpio = evento.target.value.replace(/[^0-9.]/g, '')
    const [entero, ...decimales] = limpio.split('.')
    const valor = decimales.length > 0 ? `${entero}.${decimales.join('')}` : entero

    setErrores((actuales) => ({ ...actuales, presupuesto: undefined }))
    setErrorEnvio('')
    setFormulario((actual) => ({ ...actual, presupuesto: valor }))
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
      if (esEdicion) {
        await editarCartera(cartera.id, formulario)
      } else {
        await crearCartera(formulario)
      }
      onGuardada()
    } catch (err) {
      // El backend valida lo mismo y devuelve el motivo; el modal sigue abierto.
      setErrorEnvio(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open onClose={onCerrar} maxWidth="md" fullWidth fullScreen={pantallaChica}>
      <Box component="form" noValidate onSubmit={enviar}>
        <DialogoTitulo alCerrar={onCerrar} sx={{ fontWeight: 700 }}>
          {esEdicion ? 'Editar cartera' : 'Nueva cartera'}
        </DialogoTitulo>

        <DialogContent dividers>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: 'var(--color-texto-secundario)',
              mb: 2,
            }}
          >
            {esEdicion
              ? 'Actualiza los datos de la cartera. Los cambios aplican a todos sus miembros.'
              : 'Dale un nombre y elige el tipo de cartera; podrás agregar miembros después.'}
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
                disabled={esEdicion}
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
                  type="text"
                  inputMode="decimal"
                  value={formulario.presupuesto}
                  onChange={actualizarPresupuesto}
                  error={Boolean(errores.presupuesto)}
                  helperText={errores.presupuesto}
                  slotProps={{ inputLabel: { shrink: true } }}
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

            {esEdicion && (
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-texto-terciario)',
                }}
              >
                El tipo no se puede modificar una vez creada la cartera.
              </Typography>
            )}

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
            {enviando
              ? 'Guardando…'
              : esEdicion
                ? 'Guardar cambios'
                : 'Crear cartera'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default DialogoNuevaCartera
