import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { eliminarColaborador, salirCartera } from '../api.js'
import { IconoPapelera } from '../../../components/ui/Iconos.jsx'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'

function Contribuyentes() {
  const { cartera, id, recargar } = useOutletContext()
  const navegar = useNavigate()
  const [porEliminar, setPorEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [confirmarSalida, setConfirmarSalida] = useState(false)
  const [saliendo, setSaliendo] = useState(false)
  const [error, setError] = useState('')

  const colaboradores = cartera.colaboradores ?? []
  const esPropietario = cartera.rol === 'Propietario'
  const puedeEliminar = esPropietario && cartera.estatus === 'Activa'
  const puedeSalir = !esPropietario && cartera.estatus === 'Activa'

  const eliminar = async () => {
    setEliminando(true)
    setError('')
    try {
      await eliminarColaborador(id, porEliminar.idUsuario)
      setPorEliminar(null)
      recargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setEliminando(false)
    }
  }

  const salir = async () => {
    setSaliendo(true)
    setError('')
    try {
      await salirCartera(id)
      navegar('/carteras')
    } catch (err) {
      setError(err.message)
      setSaliendo(false)
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid var(--color-borde)',
        borderRadius: '16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Stack spacing={2.5}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Contribuyentes
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--color-texto-secundario)' }}
            >
              Personas con acceso a esta cartera.
            </Typography>
          </Box>
          {puedeSalir && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setConfirmarSalida(true)}
            >
              Salir de la cartera
            </Button>
          )}
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {colaboradores.length === 0 ? (
          <Alert severity="info">
            Esta cartera todavía no tiene contribuyentes.
          </Alert>
        ) : (
          <Stack spacing={1.5}>
            {colaboradores.map((persona) => (
              <Box
                key={persona.idUsuario}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  border: '1px solid var(--color-borde)',
                  borderRadius: '12px',
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: 'var(--color-primario)',
                    color: 'var(--color-sobre-primario)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {persona.iniciales}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {persona.nombre}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ flexWrap: 'wrap', mt: 0.5 }}
                  >
                    <Chip
                      label={persona.rol}
                      size="small"
                      sx={{
                        backgroundColor: 'var(--color-superficie-suave)',
                        color: 'var(--color-texto-secundario)',
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      label="Activo"
                      size="small"
                      sx={{
                        backgroundColor: 'var(--color-seleccion)',
                        color: 'var(--color-texto-secundario)',
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                </Box>

                {puedeEliminar && persona.rol === 'Colaborador' && (
                  <Tooltip title="Eliminar contribuyente">
                    <IconButton
                      onClick={() => setPorEliminar(persona)}
                      aria-label={`Eliminar a ${persona.nombre}`}
                      sx={{ color: 'var(--color-texto-terciario)' }}
                    >
                      <IconoPapelera />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

      <Dialog
        open={confirmarSalida}
        onClose={() => setConfirmarSalida(false)}
      >
        <DialogoTitulo alCerrar={() => setConfirmarSalida(false)}>
          Salir de la cartera
        </DialogoTitulo>
        <DialogContent>
          <DialogContentText>
            ¿Deseas salir de esta cartera? Dejarás de tener acceso, pero tus
            transacciones se conservarán.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarSalida(false)} disabled={saliendo}>
            Cancelar
          </Button>
          <Button
            onClick={salir}
            color="error"
            variant="contained"
            disabled={saliendo}
          >
            {saliendo ? 'Saliendo…' : 'Salir'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(porEliminar)} onClose={() => setPorEliminar(null)}>
        <DialogoTitulo alCerrar={() => setPorEliminar(null)}>
          Eliminar contribuyente
        </DialogoTitulo>
        <DialogContent>
          <DialogContentText>
            ¿Deseas eliminar a {porEliminar?.nombre} de esta cartera? Perderá el
            acceso, pero sus transacciones se conservarán.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPorEliminar(null)} disabled={eliminando}>
            Cancelar
          </Button>
          <Button
            onClick={eliminar}
            color="error"
            variant="contained"
            disabled={eliminando}
          >
            {eliminando ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default Contribuyentes
