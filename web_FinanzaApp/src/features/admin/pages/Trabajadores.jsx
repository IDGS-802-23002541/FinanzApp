import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Pagination,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { listarTrabajadores } from '../api.js'
import DialogoTrabajador from '../components/DialogoTrabajador.jsx'
import DialogoEliminarTrabajador from '../components/DialogoEliminarTrabajador.jsx'
import EncabezadoPagina from '../../../components/ui/EncabezadoPagina.jsx'
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
  const [editor, setEditor] = useState(null)
  const [porEliminar, setPorEliminar] = useState(null)

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
          onClick={() => setEditor({ trabajador: null })}
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
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', flexShrink: 0 }}
                  >
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
                    <Button
                      size="small"
                      onClick={() => setEditor({ trabajador })}
                      sx={{ textTransform: 'none' }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      disabled={trabajador.estatus === 'INACTIVO'}
                      onClick={() => setPorEliminar(trabajador)}
                      sx={{ textTransform: 'none' }}
                    >
                      Dar de baja
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

      {editor && (
        <DialogoTrabajador
          trabajador={editor.trabajador}
          onCerrar={() => setEditor(null)}
          onGuardado={() => {
            setRecarga((actual) => actual + 1)
            if (editor.trabajador) setEditor(null)
          }}
        />
      )}

      {porEliminar && (
        <DialogoEliminarTrabajador
          trabajador={porEliminar}
          onCerrar={() => setPorEliminar(null)}
          onEliminado={() => {
            setPorEliminar(null)
            setRecarga((actual) => actual + 1)
          }}
        />
      )}
    </Stack>
  )
}

export default Trabajadores

