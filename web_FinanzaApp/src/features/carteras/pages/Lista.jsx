import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import TarjetaCartera from '../components/TarjetaCartera.jsx'
import DialogoNuevaCartera from '../components/DialogoNuevaCartera.jsx'
import { crearCartera, filtrarCarteras } from '../api.js'
import {
  IconoArchivo,
  IconoBuscar,
  IconoCartera,
  IconoCasa,
  IconoEstrella,
  IconoMas,
  IconoOtro,
  IconoPin,
} from '../../../components/ui/Iconos.jsx'

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
  minHeight: 0,
  py: 0.5,
  px: 1.5,
  borderRadius: '12px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  whiteSpace: 'nowrap',
}

const sxBotonPrimario = {
  minHeight: 0,
  py: 0.5,
  px: 2,
  borderRadius: '12px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  whiteSpace: 'nowrap',
}

const sxChip = {
  minHeight: 0,
  py: 0.75,
  px: 1.5,
  borderRadius: '999px',
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
  const manejarCrear = async (formulario) => {
    await crearCartera(formulario)
    setDialogoAbierto(false)
    limpiarFiltros()
    setRecarga((actual) => actual + 1)
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography variant="h1">Carteras</Typography>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: 'var(--color-texto-terciario)',
              maxWidth: 720,
            }}
          >
            Administra las carteras que creaste y consulta aquellas en las que
            participas como contribuyente.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <Button
            variant={filtros.estado === 'ARCHIVADA' ? 'contained' : 'outlined'}
            startIcon={<IconoArchivo sx={{ fontSize: 16 }} />}
            onClick={() => alternarEstado('ARCHIVADA')}
            sx={
              filtros.estado === 'ARCHIVADA'
                ? sxBotonPrimario
                : sxBotonContorneado
            }
          >
            Carteras Inactivas
          </Button>
          <Button
            variant={filtros.estado === 'FINALIZADA' ? 'contained' : 'outlined'}
            startIcon={<IconoArchivo sx={{ fontSize: 16 }} />}
            onClick={() => alternarEstado('FINALIZADA')}
            sx={
              filtros.estado === 'FINALIZADA'
                ? sxBotonPrimario
                : sxBotonContorneado
            }
          >
            Carteras Finalizadas
          </Button>
          <Button
            variant="contained"
            startIcon={<IconoMas sx={{ fontSize: 16 }} />}
            onClick={() => setDialogoAbierto(true)}
            sx={sxBotonPrimario}
          >
            Nueva cartera
          </Button>
        </Box>
      </Box>

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
                minHeight: 0,
                py: 1.25,
                gap: 1,
                borderRadius: '36px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Buscar cartera…"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              sx={{
                width: '100%',
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
              />
            ))}
          </Box>
        )}
      </Stack>

      {dialogoAbierto && (
        <DialogoNuevaCartera
          onCerrar={() => setDialogoAbierto(false)}
          onCrear={manejarCrear}
        />
      )}
    </Stack>
  )
}

export default ListaCarteras
