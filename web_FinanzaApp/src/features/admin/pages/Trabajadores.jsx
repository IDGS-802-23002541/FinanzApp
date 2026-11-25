import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Pagination,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  editarTrabajador,
  eliminarTrabajador,
  listarTrabajadores,
} from '../api.js'
import DialogoNuevoTrabajador from '../components/DialogoNuevoTrabajador.jsx'
import EncabezadoPagina from '../../../components/ui/EncabezadoPagina.jsx'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'
import EstadoVacio from '../../../components/ui/EstadoVacio.jsx'
import { IconoMas, IconoPersonas } from '../../../components/ui/Iconos.jsx'

const POR_PAGINA = 10

const ESTADOS_TRABAJADOR = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
}

const ESTADOS_TICKET = {
  ABIERTO: 'Abierto',
  EN_PROCESO: 'En proceso',
  ESPERA: 'En espera',
  RESUELTO: 'Resuelto',
  CERRADO: 'Cerrado',
}

function Trabajadores() {
  const [trabajadores, setTrabajadores] = useState([])
  const [paginacion, setPaginacion] = useState(null)
  const [pagina, setPagina] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recarga, setRecarga] = useState(0)
  const [editando, setEditando] = useState(null)
  const [formulario, setFormulario] = useState(null)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [borrando, setBorrando] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [altaAbierta, setAltaAbierta] = useState(false)

  useEffect(() => {
    let vigente = true

    const cargar = async () => {
      setCargando(true)
      setError('')
      try {
        const datos = await listarTrabajadores({
          pagina,
          porPagina: POR_PAGINA,
        })
        if (!vigente) return

        // Al vaciarse la última página se retrocede para no quedar en blanco.
        if (datos.trabajadores.length === 0 && pagina > 1) {
          setPagina((actual) => actual - 1)
          return
        }
        setTrabajadores(datos.trabajadores)
        setPaginacion(datos.paginacion)
      } catch (err) {
        if (vigente) setError(err.message)
      } finally {
        if (vigente) setCargando(false)
      }
    }

    cargar()
    return () => {
      vigente = false
    }
  }, [pagina, recarga])

  // Al volver a la pestaña se refrescan los tickets asignados.
  useEffect(() => {
    const alVolver = () => {
      if (document.visibilityState === 'visible') {
        setRecarga((actual) => actual + 1)
      }
    }

    document.addEventListener('visibilitychange', alVolver)
    return () => document.removeEventListener('visibilitychange', alVolver)
  }, [])

  const abrirEdicion = (trabajador) => {
    setEditando(trabajador)
    setErrorFormulario('')
    setFormulario({
      nombreUsuario: trabajador.nombreUsuario ?? '',
      apaterno: trabajador.apaterno ?? '',
      amaterno: trabajador.amaterno ?? '',
      correo: trabajador.correo ?? '',
    })
  }

  const cambiarCampo = (campo) => (evento) => {
    setErrorFormulario('')
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
  }

  const guardarEdicion = async () => {
    if (!editando || guardando) return

    if (
      !formulario.nombreUsuario.trim() ||
      !formulario.apaterno.trim() ||
      !formulario.correo.trim()
    ) {
      setErrorFormulario('Completa nombre, apellido paterno y correo.')
      return
    }

    setGuardando(true)
    setErrorFormulario('')
    try {
      await editarTrabajador(editando.idUsuario, formulario)
      setEditando(null)
      setAviso('Trabajador actualizado correctamente.')
      setRecarga((actual) => actual + 1)
    } catch (err) {
      setErrorFormulario(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const confirmarBaja = async () => {
    if (!borrando || eliminando) return

    setEliminando(true)
    try {
      await eliminarTrabajador(borrando.idUsuario)
      setBorrando(null)
      setAviso('Trabajador dado de baja correctamente.')
      setRecarga((actual) => actual + 1)
    } catch (err) {
      setError(err.message)
      setBorrando(null)
    } finally {
      setEliminando(false)
    }
  }

  return (
    <Stack spacing={3}>
      <EncabezadoPagina
        titulo="Trabajadores"
        descripcion="Personal de soporte y los tickets que tiene asignados."
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<IconoMas sx={{ fontSize: 16 }} />}
          onClick={() => setAltaAbierta(true)}
          sx={{ fontSize: '0.875rem', textTransform: 'none' }}
        >
          Nuevo trabajador
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setRecarga((actual) => actual + 1)}
          disabled={cargando}
        >
          Actualizar
        </Button>
      </EncabezadoPagina>

      {error && <Alert severity="error">{error}</Alert>}

      {cargando ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      ) : trabajadores.length === 0 ? (
        <EstadoVacio
          Icono={IconoPersonas}
          titulo="Sin trabajadores registrados"
          descripcion="Cuando se dé de alta personal de soporte aparecerá aquí con sus tickets asignados."
        />
      ) : (
        <Stack spacing={1.5}>
          {trabajadores.map((trabajador) => {
            const tickets = trabajador.tickets ?? []

            return (
              <Paper
                key={trabajador.idUsuario}
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid var(--color-borde)',
                  borderRadius: 'var(--radio-md)',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {trabajador.nombre}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--color-texto-terciario)' }}
                    >
                      {trabajador.correo}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip
                      label={
                        ESTADOS_TRABAJADOR[trabajador.estatus] ??
                        trabajador.estatus
                      }
                      size="small"
                      sx={{
                        backgroundColor: 'var(--color-superficie-suave)',
                        color: 'var(--color-texto-secundario)',
                        fontWeight: 700,
                      }}
                    />
                    <Button size="small" onClick={() => abrirEdicion(trabajador)}>
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setBorrando(trabajador)}
                      disabled={trabajador.estatus === 'INACTIVO'}
                    >
                      Eliminar
                    </Button>
                  </Stack>
                </Stack>

                <Box sx={{ mt: 1.5 }}>
                  {tickets.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ color: 'var(--color-texto-terciario)' }}
                    >
                      Sin ticket asignado
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {tickets.map((ticket) => (
                        <Stack
                          key={ticket.idTicket}
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            #{ticket.idTicket}
                          </Typography>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              color: 'var(--color-texto-secundario)',
                            }}
                          >
                            {ticket.asunto}
                          </Typography>
                          <Chip
                            label={
                              ESTADOS_TICKET[ticket.estado] ?? ticket.estado
                            }
                            size="small"
                            sx={{
                              backgroundColor: 'var(--color-superficie-suave)',
                              color: 'var(--color-texto-secundario)',
                              fontWeight: 600,
                            }}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Paper>
            )
          })}
        </Stack>
      )}

      {paginacion && paginacion.totalPaginas > 1 && (
        <Pagination
          count={paginacion.totalPaginas}
          page={pagina}
          onChange={(_evento, valor) => setPagina(valor)}
          color="primary"
          sx={{ alignSelf: 'center' }}
        />
      )}

      <Dialog
        open={Boolean(editando)}
        onClose={() => (guardando ? null : setEditando(null))}
        fullWidth
        maxWidth="sm"
      >
        <DialogoTitulo alCerrar={() => !guardando && setEditando(null)}>
          Editar trabajador
        </DialogoTitulo>
        <DialogContent dividers>
          {formulario && (
            <Stack spacing={2}>
              <TextField
                label="Nombre"
                size="small"
                value={formulario.nombreUsuario}
                onChange={cambiarCampo('nombreUsuario')}
                slotProps={{ htmlInput: { maxLength: 80 } }}
              />
              <TextField
                label="Apellido paterno"
                size="small"
                value={formulario.apaterno}
                onChange={cambiarCampo('apaterno')}
                slotProps={{ htmlInput: { maxLength: 80 } }}
              />
              <TextField
                label="Apellido materno"
                size="small"
                value={formulario.amaterno}
                onChange={cambiarCampo('amaterno')}
                slotProps={{ htmlInput: { maxLength: 80 } }}
              />
              <TextField
                label="Correo electrónico"
                type="email"
                size="small"
                value={formulario.correo}
                onChange={cambiarCampo('correo')}
                slotProps={{ htmlInput: { maxLength: 254 } }}
              />
              {errorFormulario && <Alert severity="error">{errorFormulario}</Alert>}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditando(null)} disabled={guardando}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={guardarEdicion} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(borrando)}
        onClose={() => (eliminando ? null : setBorrando(null))}
        maxWidth="xs"
        fullWidth
      >
        <DialogoTitulo alCerrar={() => !eliminando && setBorrando(null)}>
          Dar de baja trabajador
        </DialogoTitulo>
        <DialogContent>
          <DialogContentText>
            ¿Dar de baja a {borrando?.nombre}? Su cuenta quedará inactiva y no
            podrá iniciar sesión.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBorrando(null)} disabled={eliminando}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmarBaja}
            disabled={eliminando}
          >
            {eliminando ? 'Dando de baja…' : 'Dar de baja'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(aviso)}
        autoHideDuration={4000}
        onClose={() => setAviso('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setAviso('')}>
          {aviso}
        </Alert>
      </Snackbar>

      <DialogoNuevoTrabajador
        abierto={altaAbierta}
        onCerrar={() => setAltaAbierta(false)}
        onCreado={() => setRecarga((actual) => actual + 1)}
      />
    </Stack>
  )
}

export default Trabajadores

