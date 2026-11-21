import {useState} from 'react'
import{
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
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material'
import { crearTransaccion } from '../api.js'
import { actualizarTransaccion } from '../../transacciones/api.js'
import SelectorCategorias from './SelectorCategorias.jsx'

const METODOS_PAGO = [
  { valor: 'EFECTIVO', etiqueta: 'Efectivo' },
  { valor: 'TARJETA', etiqueta: 'Tarjeta' },
  { valor: 'TRANSFERENCIA', etiqueta: 'Transferencia' },
]

// evita que UTC mueva el dia 
function hoyISO(){
    const ahora = new Date()
    const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 10)
}

// Valida lo minimo en el borde; el backend revalida y devuelve el motivo.
function validar({ tipo, monto, fecha, categoriaId }) {
  const errores = {}
  const valor = Number(monto)

  if (!monto || Number.isNaN(valor) || valor <= 0) {
    errores.monto = 'Escribe un monto mayor a 0.'
  }
  if (!fecha) errores.fecha = 'Elige la fecha del movimiento.'
  if (tipo === 'GASTO' && !categoriaId) {
    errores.categoriaId = 'Elige una categoría para el gasto.'
  }

  return errores
}

// formulario de ingreso/gasto (HU-05.1). Se monta limpio en cada apertura.
function DialogoNuevaTransaccion({ idCartera, onCerrar, onGuardada, transaccion }) {
  const [formulario, setFormulario] = useState({
    tipo: transaccion?.tipo ?? 'GASTO',
    monto: transaccion?.monto != null ? String(transaccion.monto) : '',
    fecha: transaccion?.fecha ?? hoyISO(),
    categoriaId: transaccion?.categoriaId ?? null,
    metodoPago: transaccion?.metodoPago ?? 'EFECTIVO',
    descripcion: transaccion?.descripcion ?? '',
  })
  const esEdicion = Boolean(transaccion)
  const [errores, setErrores] = useState({})
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)

  const actualizar = (campo) => (evento) => {
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
    setErrorEnvio('')
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
  }
  // Al cambiar a ingreso se limpia la categoria, porque no aplica.
  const cambiarTipo = (_evento, nuevo) => {
    if (!nuevo) return
    setErrores((actuales) => ({ ...actuales, categoriaId: undefined }))
    setErrorEnvio('')
    setFormulario((actual) => ({
      ...actual,
      tipo: nuevo,
      categoriaId: null,
    }))
  }
  const cambiarCategoria = (categoriaId) => {
    setErrores((actuales) => ({ ...actuales, categoriaId: undefined }))
    setErrorEnvio('')
    setFormulario((actual) => ({ ...actual, categoriaId }))
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
        await actualizarTransaccion(transaccion.idTransaccion, formulario)
      } else {
        await crearTransaccion(idCartera, formulario)
      }
      onGuardada()
    } catch (err) {
      setErrorEnvio(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open onClose={onCerrar} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={enviar}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {esEdicion ? 'Editar movimiento' : 'Nuevo movimiento'}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={formulario.tipo}
              onChange={cambiarTipo}
              sx={{ width: '100%' }}
            >
              <ToggleButton value="GASTO" sx={{ flex: 1 }}>
                Gasto
              </ToggleButton>
              <ToggleButton value="INGRESO" sx={{ flex: 1 }}>
                Ingreso
              </ToggleButton>
            </ToggleButtonGroup>

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
                label="Monto"
                placeholder="$0.00"
                type="number"
                value={formulario.monto}
                onChange={actualizar('monto')}
                error={Boolean(errores.monto)}
                helperText={errores.monto}
                autoFocus
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />

              <TextField
                size="small"
                label="Fecha"
                type="date"
                value={formulario.fecha}
                onChange={actualizar('fecha')}
                error={Boolean(errores.fecha)}
                helperText={errores.fecha}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            {formulario.tipo === 'GASTO' && (
              <Box>
                <SelectorCategorias
                  idCartera={idCartera}
                  tipo="GASTO"
                  value={formulario.categoriaId}
                  onChange={cambiarCategoria}
                />
                {errores.categoriaId && (
                  <Typography
                    sx={{
                      mt: 0.5,
                      ml: 1.75,
                      fontSize: '0.75rem',
                      color: 'var(--color-error)',
                    }}
                  >
                    {errores.categoriaId}
                  </Typography>
                )}
              </Box>
            )}

            <TextField
              size="small"
              select
              label="Método de pago"
              value={formulario.metodoPago}
              onChange={actualizar('metodoPago')}
            >
              {METODOS_PAGO.map((metodo) => (
                <MenuItem key={metodo.valor} value={metodo.valor}>
                  {metodo.etiqueta}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              label="Descripción"
              placeholder="¿De qué fue el movimiento?"
              multiline
              minRows={2}
              value={formulario.descripcion}
              onChange={actualizar('descripcion')}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />

            {errorEnvio && <Alert severity="error">{errorEnvio}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onCerrar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={enviando}>
            {enviando
              ? 'Guardando…'
              : esEdicion
                ? 'Guardar cambios'
                : 'Guardar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default DialogoNuevaTransaccion

