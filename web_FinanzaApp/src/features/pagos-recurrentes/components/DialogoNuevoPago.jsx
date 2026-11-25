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
} from '@mui/material'
import SelectorCategorias from '../../carteras/components/SelectorCategorias.jsx'
import { crearPago, editarPago } from '../api.js'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'

const FRECUENCIAS = [
  { valor: 'DIARIO', texto: 'Diario' },
  { valor: 'SEMANAL', texto: 'Semanal' },
  { valor: 'MENSUAL', texto: 'Mensual' },
  { valor: 'ANUAL', texto: 'Anual' },
]

// Evita que UTC mueva el dia.
function hoyISO() {
  const ahora = new Date()
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

const sxBoton = {
  px: 2,
  fontSize: '0.875rem',
  textTransform: 'none',
}

function validar({ nombre, monto, frecuencia, fechaCorte }) {
  const errores = {}

  if (!nombre.trim()) {
    errores.nombre = 'Escribe el concepto del pago.'
  } else if (nombre.trim().length > 120) {
    errores.nombre = 'El concepto admite máximo 120 caracteres.'
  }

  if (monto === '' || Number.isNaN(Number(monto)) || Number(monto) <= 0) {
    errores.monto = 'Escribe un monto mayor a 0.'
  }

  if (!frecuencia) errores.frecuencia = 'Elige una frecuencia.'
  if (!fechaCorte) errores.fechaCorte = 'Elige la fecha de corte.'

  return errores
}

function valoresIniciales(pago) {
  if (!pago) {
    return {
      nombre: '',
      categoriaId: null,
      monto: '',
      frecuencia: 'MENSUAL',
      fechaCorte: hoyISO(),
    }
  }

  return {
    nombre: pago.nombre ?? '',
    categoriaId: pago.categoriaId ?? null,
    monto: pago.monto != null ? String(pago.monto) : '',
    frecuencia: pago.frecuenciaValor ?? 'MENSUAL',
    fechaCorte: pago.fechaInicio ?? hoyISO(),
  }
}

// Alta/edicion de pago recurrente (HU-07.1 y HU-07.2).
function DialogoNuevoPago({ carteraId, pago, onCerrar, onGuardado }) {
  const tema = useTheme()
  const pantallaChica = useMediaQuery(tema.breakpoints.down('sm'))
  const esEdicion = Boolean(pago)
  const [formulario, setFormulario] = useState(() => valoresIniciales(pago))
  const [errores, setErrores] = useState({})
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)

  const actualizar = (campo) => (evento) => {
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
    setErrorEnvio('')
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
  }

  const enviar = async (evento) => {
    evento.preventDefault()

    const nuevosErrores = validar(formulario)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    setErrorEnvio('')

    try {
      if (esEdicion) {
        await editarPago(pago.id, formulario)
      } else {
        await crearPago({ carteraId, ...formulario })
      }
      onGuardado()
    } catch (err) {
      setErrorEnvio(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open onClose={onCerrar} maxWidth="sm" fullWidth fullScreen={pantallaChica}>
      <Box component="form" noValidate onSubmit={enviar}>
        <DialogoTitulo alCerrar={onCerrar} sx={{ fontWeight: 700 }}>
          {esEdicion ? 'Editar pago recurrente' : 'Nuevo pago recurrente'}
        </DialogoTitulo>

        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              size="small"
              label="Concepto"
              placeholder="Ej. Renta"
              value={formulario.nombre}
              onChange={actualizar('nombre')}
              error={Boolean(errores.nombre)}
              helperText={errores.nombre}
              autoFocus
              slotProps={{ htmlInput: { maxLength: 120 } }}
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
              <Box>
                <SelectorCategorias
                  idCartera={carteraId}
                  tipo="GASTO"
                  value={formulario.categoriaId}
                  onChange={(categoriaId) =>
                    setFormulario((actual) => ({ ...actual, categoriaId }))
                  }
                />
              </Box>

              <TextField
                size="small"
                label="Monto"
                placeholder="$0.00"
                type="number"
                value={formulario.monto}
                onChange={actualizar('monto')}
                error={Boolean(errores.monto)}
                helperText={errores.monto}
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />

              <TextField
                size="small"
                select
                label="Frecuencia"
                value={formulario.frecuencia}
                onChange={actualizar('frecuencia')}
                error={Boolean(errores.frecuencia)}
                helperText={errores.frecuencia}
              >
                {FRECUENCIAS.map((frecuencia) => (
                  <MenuItem key={frecuencia.valor} value={frecuencia.valor}>
                    {frecuencia.texto}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                label="Fecha de corte"
                type="date"
                value={formulario.fechaCorte}
                onChange={actualizar('fechaCorte')}
                error={Boolean(errores.fechaCorte)}
                helperText={errores.fechaCorte}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            {errorEnvio && <Alert severity="error">{errorEnvio}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onCerrar} disabled={enviando} sx={sxBoton}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={enviando} sx={sxBoton}>
            {enviando
              ? 'Guardando…'
              : esEdicion
                ? 'Guardar cambios'
                : 'Guardar pago'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default DialogoNuevoPago
