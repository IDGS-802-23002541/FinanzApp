import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import TarjetaCartera from '../components/TarjetaCartera.jsx'
import DialogoNuevaCartera from '../components/DialogoNuevaCartera.jsx'
import { filtrarCarteras, inactivarCartera } from '../api.js'
import EncabezadoPagina from '../../../components/ui/EncabezadoPagina.jsx'
import {
  IconoArchivo,
  IconoBuscar,
  IconoCartera,
  IconoCasa,
  IconoCheck,
  IconoEstrella,
  IconoMas,
  IconoOtro,
  IconoPin,
} from '../../../components/ui/Iconos.jsx'
import DialogoTitulo from '../../../components/ui/DialogoTitulo.jsx'

// "tipo" es el enum que espera la API; el texto es lo que ve el usuario.
const FILTROS_TIPO = [
  { texto: 'Todas', tipo: '' },
  { texto: 'Hogar', tipo: 'HOGAR', Icono: IconoCasa },
  { texto: 'Viaje', tipo: 'VIAJE', Icono: IconoPin },
  { texto: 'Evento', tipo: 'EVENTO', Icono: IconoEstrella },
  { texto: 'Otro', tipo: 'OTRO', Icono: IconoOtro },
]

// Por defecto se muestran las activas y la pestaña "Mis carteras" (CA1 de HU-03.3).
const FILTROS_INICIALES = {
  estado: 'ACTIVA',
  tipo: '',
  rol: 'PROPIETARIO',
  busqueda: '',
}

const sxBotonContorneado = {
  px: 1.5,
  borderRadius: 'var(--radio-md)',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  whiteSpace: 'nowrap',
}

const sxBotonPrimario = {
  px: 2,
  borderRadius: 'var(--radio-md)',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  whiteSpace: 'nowrap',
}

const sxChip = {
  height: 'var(--altura-control-sm)',
  px: 1.5,
  borderRadius: 'var(--radio-pill)',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'none',
  whiteSpace: 'nowrap',
}

// Dashboard de carteras: tarjetas (HU-03.2), filtros combinables (HU-03.3)
// y creación (HU-03.1).
function ListaCarteras() {
  const navegar = useNavigate()
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [carteras, setCarteras] = useState([])
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recarga, setRecarga] = useState(0)
  const [totales, setTotales] = useState(null)
  const [editando, setEditando] = useState(null)
  const [porInactivar, setPorInactivar] = useState(null)
  const [errorInactivar, setErrorInactivar] = useState('')
  const [inactivando, setInactivando] = useState(false)

  // La búsqueda espera a que dejes de escribir para no pedir por cada tecla.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setFiltros((actual) => {
        const busqueda = texto.trim()
        return actual.busqueda === busqueda ? actual : { ...actual, busqueda }
      })
    }, 300)

    return () => clearTimeout(temporizador)
  }, [texto])

  useEffect(() => {
    // Evita que una respuesta vieja pinte la lista de un filtro anterior.
    let vigente = true

    const cargarCarteras = async () => {
      setCargando(true)
      setError('')

      try {
        const datos = await filtrarCarteras(filtros)
        if (vigente) setCarteras(datos)
      } catch (err) {
        if (vigente) setError(err.message)
      } finally {
        if (vigente) setCargando(false)
      }
    }

    cargarCarteras()

    return () => {
      vigente = false
    }
  }, [filtros, recarga])

  // Contadores de las pestañas: se piden aparte porque el listado principal va
  // filtrado por tipo y búsqueda. Por eso un useEffect similar
  useEffect(() => {
    let vigente = true

    const cargarTotales = async () => {
      try {
        const datos = await filtrarCarteras({ estado: filtros.estado })
        if (!vigente) return

        setTotales({
          propias: datos.filter((cartera) => cartera.rol === 'Propietario')
            .length,
          compartidas: datos.filter((cartera) => cartera.rol === 'Colaborador')
            .length,
        })
      } catch {
        // Si falla el conteo, las pestañas se quedan sin número.
        if (vigente) setTotales(null)
      }
    }

    cargarTotales()

    return () => {
      vigente = false
    }
  }, [filtros.estado, recarga])

  // Se compara contra el estado inicial: "Mis carteras" ya es un filtro por defecto.
  const hayFiltros =
    filtros.estado !== FILTROS_INICIALES.estado ||
    filtros.tipo !== FILTROS_INICIALES.tipo ||
    filtros.rol !== FILTROS_INICIALES.rol ||
    filtros.busqueda !== FILTROS_INICIALES.busqueda

  const cambiarFiltro = (cambio) =>
    setFiltros((actual) => ({ ...actual, ...cambio }))

  // Volver a pulsar la pestaña activa quita el filtro (vuelve a "todas").
  const alternarRol = (rol) =>
    setFiltros((actual) => ({
      ...actual,
      rol: actual.rol === rol ? '' : rol,
    }))

  // Volver a pulsar el estado activo regresa a las carteras activas.
  const alternarEstado = (estado) =>
    setFiltros((actual) => ({
      ...actual,
      estado: actual.estado === estado ? 'ACTIVA' : estado,
    }))

  const limpiarFiltros = () => {
    setTexto('')
    setFiltros(FILTROS_INICIALES)
  }

  // CA3 de HU-03.1: al crear, se cierra el modal y la cartera aparece luego.
  const manejarCreada = () => {
    setDialogoAbierto(false)
    limpiarFiltros()
    setRecarga((actual) => actual + 1)
  }

  // HU-04.5: editar refresca la lista y los contadores del dashboard.
  const manejarEditada = () => {
    setEditando(null)
    setRecarga((actual) => actual + 1)
  }

  const abrirInactivar = (cartera) => {
    setErrorInactivar('')
    setPorInactivar(cartera)
  }

  // La baja es logica: el backend cambia el estado a ARCHIVADA.
  const confirmarInactivar = async () => {
    setInactivando(true)
    setErrorInactivar('')

    try {
      await inactivarCartera(porInactivar.id)
      setPorInactivar(null)
      setRecarga((actual) => actual + 1)
    } catch (err) {
      setErrorInactivar(err.message)
    } finally {
      setInactivando(false)
    }
  }

  return (
    <Stack spacing={3}>
      <EncabezadoPagina
        titulo="Carteras"
        descripcion="Administra las carteras que creaste y consulta aquellas en las que participas como contribuyente."
      >
        <Button
          variant="contained"
          startIcon={<IconoMas sx={{ fontSize: 16 }} />}
          onClick={() => setDialogoAbierto(true)}
          sx={sxBotonPrimario}
        >
          Nueva cartera
        </Button>
      </EncabezadoPagina>

      <Box
        sx={{
          width: '100%',
          maxWidth: 560,
          p: 0.75,
          display: 'flex',
          gap: 0.75,
          borderRadius: '48px',
          backgroundColor: 'var(--color-superficie-suave)',
        }}
      >
        {[
          { texto: 'Mis carteras', rol: 'PROPIETARIO', total: totales?.propias },
          {
            texto: 'Compartidas',
            rol: 'COLABORADOR',
            total: totales?.compartidas,
          },
        ].map((pestana) => {
          const activa = filtros.rol === pestana.rol

          return (
            <Button
              key={pestana.rol}
              startIcon={<IconoCartera sx={{ fontSize: 16 }} />}
              onClick={() => alternarRol(pestana.rol)}
              sx={{
                flex: 1,
                height: 'var(--altura-control-md)',
                gap: 1,
                px: { xs: 0.5, sm: 2 },
                borderRadius: 'var(--radio-pill)',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: { xs: '0.8125rem', sm: '0.85rem' },
                whiteSpace: 'nowrap',
                backgroundColor: activa
                  ? 'var(--color-superficie)'
                  : 'transparent',
                color: activa
                  ? 'var(--color-texto)'
                  : 'var(--color-texto-terciario)',
                boxShadow: activa ? '0 1px 1px rgba(0, 0, 0, 0.08)' : 'none',
                '&:hover': { backgroundColor: 'var(--color-superficie)' },
              }}
            >
              {pestana.texto}
              {pestana.total !== undefined && (
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: '999px',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    backgroundColor: activa
                      ? 'var(--color-acento)'
                      : 'var(--color-borde)',
                    color: activa
                      ? 'var(--color-primario)'
                      : 'var(--color-texto-secundario)',
                  }}
                >
                  {pestana.total}
                </Box>
              )}
            </Button>
          )
        })}
      </Box>

      <Stack spacing={2.5}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {FILTROS_TIPO.map((filtro) => {
              const Icono = filtro.Icono
              const activo = filtros.tipo === filtro.tipo

              return (
                <Button
                  key={filtro.texto}
                  startIcon={Icono ? <Icono sx={{ fontSize: 14 }} /> : undefined}
                  onClick={() => cambiarFiltro({ tipo: filtro.tipo })}
                  sx={{
                    ...sxChip,
                    border: '1px solid',
                    borderColor: activo
                      ? 'var(--color-primario)'
                      : 'var(--color-borde)',
                    backgroundColor: activo
                      ? 'var(--color-primario)'
                      : 'var(--color-superficie)',
                    color: activo
                      ? 'var(--color-sobre-primario)'
                      : 'var(--color-texto-secundario)',
                  }}
                >
                  {filtro.texto}
                </Button>
              )
            })}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant={filtros.estado === 'ARCHIVADA' ? 'contained' : 'outlined'}
              startIcon={<IconoArchivo sx={{ fontSize: 15 }} />}
              onClick={() => alternarEstado('ARCHIVADA')}
              sx={
                filtros.estado === 'ARCHIVADA'
                  ? sxBotonPrimario
                  : sxBotonContorneado
              }
            >
              Inactivas
            </Button>
            <Button
              size="small"
              variant={filtros.estado === 'FINALIZADA' ? 'contained' : 'outlined'}
              startIcon={<IconoCheck sx={{ fontSize: 15 }} />}
              onClick={() => alternarEstado('FINALIZADA')}
              sx={
                filtros.estado === 'FINALIZADA'
                  ? sxBotonPrimario
                  : sxBotonContorneado
              }
            >
              Finalizadas
            </Button>
            <TextField
              size="small"
              placeholder="Buscar cartera…"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              sx={{
                width: { xs: '100%', sm: 260 },
                maxWidth: 288,
                '& .MuiOutlinedInput-root': { minHeight: 40 },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconoBuscar sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {hayFiltros && (
              <Button
                onClick={limpiarFiltros}
                sx={{
                  ...sxChip,
                  border: '1px solid var(--color-borde)',
                  backgroundColor: 'var(--color-superficie)',
                  color: 'var(--color-texto-secundario)',
                }}
              >
                Limpiar
              </Button>
            )}
          </Box>
        </Box>

        {cargando ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setRecarga((actual) => actual + 1)}
              >
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        ) : carteras.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              py: 6,
              border: '1px dashed var(--color-borde-fuerte)',
              borderRadius: '16px',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: 'var(--color-texto-secundario)',
              }}
            >
              {hayFiltros
                ? 'Sin resultados con los filtros aplicados.'
                : 'Aún no tienes carteras activas.'}
            </Typography>

            {hayFiltros ? (
              <Button
                variant="outlined"
                onClick={limpiarFiltros}
                sx={sxBotonContorneado}
              >
                Limpiar filtros
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<IconoMas sx={{ fontSize: 16 }} />}
                onClick={() => setDialogoAbierto(true)}
                sx={sxBotonPrimario}
              >
                Crear cartera
              </Button>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 2.5,
            }}
          >
            {carteras.map((cartera) => (
              <TarjetaCartera
                key={cartera.id}
                {...cartera}
                onAbrir={() => navegar(`/carteras/${cartera.id}`)}
                onEditar={() => setEditando(cartera)}
                onInactivar={() => abrirInactivar(cartera)}
              />
            ))}
          </Box>
        )}
      </Stack>

      {dialogoAbierto && (
        <DialogoNuevaCartera
          onCerrar={() => setDialogoAbierto(false)}
          onGuardada={manejarCreada}
        />
      )}

      {editando && (
        <DialogoNuevaCartera
          cartera={editando}
          onCerrar={() => setEditando(null)}
          onGuardada={manejarEditada}
        />
      )}

      {porInactivar && (
        <Dialog
          open
          onClose={() => setPorInactivar(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogoTitulo alCerrar={() => setPorInactivar(null)} sx={{ fontWeight: 700 }}>
            Eliminar cartera
          </DialogoTitulo>
          <DialogContent>
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: 'var(--color-texto-secundario)',
              }}
            >
              Se dará de baja {porInactivar.nombre} y sus miembros dejarán de
              verla. El historial se conserva.
            </Typography>

            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderLeft: '3px solid var(--color-alerta)',
                backgroundColor: 'var(--color-superficie-suave)',
                borderRadius: '8px',
              }}
            >
              <Typography
                sx={{ fontSize: '0.8125rem', color: 'var(--color-alerta)' }}
              >
                La baja es lógica: no se borra información físicamente.
              </Typography>
            </Box>

            {errorInactivar && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorInactivar}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => setPorInactivar(null)}
              disabled={inactivando}
            >
              Cancelar
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={confirmarInactivar}
              disabled={inactivando}
            >
              {inactivando ? 'Eliminando…' : 'Eliminar cartera'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  )
}

export default ListaCarteras
