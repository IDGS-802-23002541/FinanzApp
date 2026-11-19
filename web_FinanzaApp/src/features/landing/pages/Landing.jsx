import { Box, Button, Chip, Link, Stack, Tooltip, Typography } from '@mui/material'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import FormularioComentarios from '../components/FormularioComentarios.jsx'
import { useAuth } from '../../../hooks/useAuth.js'
import { formatearMonto } from '../../../utils/formato.js'
import { PANEL_POR_ROL } from '../../../utils/constantes.js'
import {
  IconoCalendario,
  IconoCartera,
  IconoCheck,
  IconoEstrella,
  IconoPersonas,
} from '../../../components/ui/Iconos.jsx'

const APK_URL = import.meta.env.VITE_APK_URL ?? ''

const BENEFICIOS = [
  {
    titulo: 'Invita con QR',
    Icono: IconoPersonas,
    texto: 'Suma a quien quieras con una clave de 8 caracteres.',
  },
  {
    titulo: 'Ve tus gastos claros',
    Icono: IconoEstrella,
    texto: 'Gráficas por mes y por categoría, sin hojas de cálculo.',
  },
  {
    titulo: 'Cierra con balance',
    Icono: IconoCalendario,
    texto: 'Al terminar el viaje o evento, obtén el balance por persona.',
  },
]

const COMPARATIVA = [
  {
    titulo: 'Versión web',
    etiqueta: 'Para administrar',
    items: [
      'Panel completo desde el navegador',
      'Reportes y estadísticas detalladas',
      'Gestión de trabajadores y tickets',
    ],
  },
  {
    titulo: 'Versión móvil',
    etiqueta: 'Para el día a día',
    items: [
      'Registra gastos en segundos',
      'Únete a carteras con código QR',
      'Notificaciones de cada movimiento',
    ],
  },
]

const EJEMPLOS = [
  {
    titulo: 'Cartera personal',
    Icono: IconoCartera,
    descripcion:
      'Controla la despensa, los servicios y tu presupuesto mensual en un solo lugar.',
    ejemplos: ['Renta y servicios', 'Súper y despensa', 'Ahorro del mes'],
  },
  {
    titulo: 'Cartera compartida',
    Icono: IconoPersonas,
    descripcion:
      'Organiza los gastos de casa o de la oficina y ve quién aportó y quién gastó.',
    ejemplos: ['Gastos del hogar', 'Fondo común', 'Liquidación por persona'],
  },
  {
    titulo: 'Evento o viaje',
    Icono: IconoCalendario,
    descripcion:
      'Junta los gastos de una fecha especial y cierra la cartera con su balance final.',
    ejemplos: ['Viaje con amigos', 'Cumpleaños', 'Posada o boda'],
  },
]

const MOVIMIENTOS = [
  { nombre: 'Hospedaje', fecha: '12/11/2026', monto: -1800, tipo: 'GASTO' },
  { nombre: 'Aportación Ana', fecha: '13/11/2026', monto: 2500, tipo: 'INGRESO' },
  { nombre: 'Comida', fecha: '14/11/2026', monto: -650, tipo: 'GASTO' },
]

function Tarjeta({ children }) {
  return (
    <Box
      sx={{
        p: 3,
        height: '100%',
        backgroundColor: 'var(--color-superficie)',
        border: '1px solid var(--color-borde)',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(23, 59, 69, 0.06)',
      }}
    >
      {children}
    </Box>
  )
}

function ListaBeneficios({ items, colorIcono }) {
  return (
    <Stack component="ul" spacing={1.25} sx={{ mt: 2, pl: 0, listStyle: 'none' }}>
      {items.map((item) => (
        <Stack
          component="li"
          key={item}
          direction="row"
          spacing={1.25}
          sx={{ alignItems: 'flex-start' }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              mt: '0.15rem',
              borderRadius: '50%',
              backgroundColor: colorIcono,
              color: 'var(--color-sobre-primario)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconoCheck sx={{ fontSize: 13 }} />
          </Box>
          <Typography sx={{ color: 'var(--color-texto-secundario)' }}>
            {item}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}

function SimulacionCartera() {
  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: 'var(--color-superficie)',
        color: 'var(--color-texto)',
        borderRadius: '24px',
        p: { xs: 2.5, sm: 3 },
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.28)',
        transform: { md: 'rotate(-1.5deg)' },
        maxWidth: 400,
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'var(--color-primario)',
            color: 'var(--color-sobre-primario)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconoCartera sx={{ fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800 }}>Viaje a la playa</Typography>
          <Chip
            label="Viaje"
            size="small"
            sx={{
              mt: 0.5,
              backgroundColor: 'var(--color-seleccion)',
              color: 'var(--color-seleccion-texto)',
              fontWeight: 700,
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          mt: 2.5,
          p: 2,
          borderRadius: '16px',
          backgroundColor: 'var(--color-superficie-suave)',
        }}
      >
        <Typography variant="body2" sx={{ color: 'var(--color-texto-secundario)' }}>
          Disponible
        </Typography>
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 800 }}>
          {formatearMonto(4250)}
        </Typography>
      </Box>

      <Stack spacing={1.25} sx={{ mt: 2 }}>
        {MOVIMIENTOS.map((movimiento) => (
          <Box
            key={movimiento.nombre}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }} noWrap>
                {movimiento.nombre}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'var(--color-texto-terciario)' }}
              >
                {movimiento.fecha}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color:
                  movimiento.tipo === 'INGRESO'
                    ? 'var(--color-exito)'
                    : 'var(--color-texto)',
              }}
            >
              {movimiento.tipo === 'INGRESO' ? '+' : '−'}
              {formatearMonto(Math.abs(movimiento.monto))}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

function Landing() {
  const { usuario } = useAuth()

  // CA4: con sesión activa se va directo al inicio del rol.
  if (usuario) {
    return <Navigate to={PANEL_POR_ROL[usuario.rol] ?? '/'} replace />
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-fondo)',
        color: 'var(--color-texto)',
      }}
    >
      <Box
        component="header"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--gradiente-marca)',
          color: 'var(--paleta-blanco)',
          pb: { xs: 10, md: 14 },
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: -180,
            right: -140,
            width: 460,
            height: 460,
            borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            bottom: -220,
            left: -160,
            width: 420,
            height: 420,
            borderRadius: '50%',
            backgroundColor: 'var(--color-acento)',
            opacity: 0.16,
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            maxWidth: 1120,
            mx: 'auto',
            px: { xs: 2.5, md: 4 },
            pt: { xs: 3, md: 4 },
          }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: 'var(--paleta-blanco)',
                  color: 'var(--paleta-petroleo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                }}
              >
                F
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                FinanzApp
              </Typography>
            </Stack>

            <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ alignItems: 'center' }}>
              <Link
                href="#producto"
                underline="none"
                sx={{
                  display: { xs: 'none', sm: 'inline' },
                  color: 'inherit',
                  fontWeight: 600,
                }}
              >
                Producto
              </Link>
              <Link
                href="#ejemplos"
                underline="none"
                sx={{
                  display: { xs: 'none', sm: 'inline' },
                  color: 'inherit',
                  fontWeight: 600,
                }}
              >
                Ejemplos
              </Link>
              <Link
                component={RouterLink}
                to="/login"
                underline="none"
                sx={{ color: 'inherit', fontWeight: 700 }}
              >
                Iniciar sesión
              </Link>
              <Button
                component={RouterLink}
                to="/registro"
                sx={{
                  backgroundColor: 'var(--paleta-blanco)',
                  color: 'var(--paleta-petroleo)',
                  '&:hover': { backgroundColor: 'var(--color-acento)' },
                }}
              >
                Registrarme
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' },
              gap: { xs: 6, md: 8 },
              alignItems: 'center',
              mt: { xs: 6, md: 9 },
            }}
          >
            <Box>
              <Chip
                label="Finanzas compartidas sin enredos"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: 'var(--paleta-blanco)',
                  fontWeight: 700,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              />
              <Typography
                component="h1"
                sx={{
                  mt: 2.5,
                  fontSize: { xs: '2.2rem', md: '3.4rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                }}
              >
                Las cuentas claras también se ven bien
              </Typography>
              <Typography
                sx={{
                  mt: 2.5,
                  maxWidth: 520,
                  fontSize: '1.1rem',
                  color: 'rgba(255, 255, 255, 0.82)',
                }}
              >
                Organiza carteras de hogar, viajes y eventos. Invita a quien
                quieras, registra cada movimiento y cierra con el balance exacto.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ mt: 3.5 }}
              >
                <Button
                  component={RouterLink}
                  to="/registro"
                  sx={{
                    backgroundColor: 'var(--color-acento)',
                    color: 'var(--paleta-petroleo)',
                    fontWeight: 700,
                    '&:hover': { backgroundColor: 'var(--paleta-blanco)' },
                  }}
                >
                  Crear cuenta gratis
                </Button>
                {APK_URL ? (
                  <Button
                    component="a"
                    href={APK_URL}
                    variant="outlined"
                    download
                    sx={{
                      color: 'var(--paleta-blanco)',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': { borderColor: 'var(--paleta-blanco)' },
                    }}
                  >
                    Descargar app
                  </Button>
                ) : (
                  <Tooltip title="La descarga estará disponible pronto.">
                    <span>
                      <Button
                        variant="outlined"
                        disabled
                        sx={{
                          color: 'var(--paleta-blanco)',
                          borderColor: 'rgba(255, 255, 255, 0.35)',
                        }}
                      >
                        Descargar app
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </Stack>

              <Stack
                direction="row"
                spacing={{ xs: 2, sm: 3.5 }}
                sx={{ mt: 4, flexWrap: 'wrap', gap: 1.5 }}
              >
                {['Carteras ilimitadas', 'Invitación con QR', 'Balance automático'].map(
                  (texto) => (
                    <Stack
                      key={texto}
                      direction="row"
                      spacing={0.75}
                      sx={{ alignItems: 'center' }}
                    >
                      <IconoCheck sx={{ fontSize: 16, color: 'var(--color-acento)' }} />
                      <Typography variant="body2">{texto}</Typography>
                    </Stack>
                  ),
                )}
              </Stack>
            </Box>

            <SimulacionCartera />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 1120,
          mx: 'auto',
          px: { xs: 2.5, md: 4 },
        }}
      >
        <Box
          sx={{
            mt: { xs: -6, md: -8 },
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 2.5,
          }}
        >
          {BENEFICIOS.map(({ titulo, Icono, texto }) => (
            <Tarjeta key={titulo}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-superficie-suave)',
                  color: 'var(--color-primario)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icono sx={{ fontSize: 22 }} />
              </Box>
              <Typography sx={{ mt: 2, fontWeight: 800 }}>{titulo}</Typography>
              <Typography
                sx={{ mt: 0.75, color: 'var(--color-texto-secundario)' }}
              >
                {texto}
              </Typography>
            </Tarjeta>
          ))}
        </Box>

        <Box component="section" id="producto" sx={{ mt: { xs: 8, md: 12 } }}>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.6rem', md: '2.15rem' }, fontWeight: 800 }}
          >
            Web y móvil, cada una para lo suyo
          </Typography>
          <Typography sx={{ mt: 1, color: 'var(--color-texto-secundario)' }}>
            Administra desde la computadora y registra gastos desde el celular.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2.5,
              mt: 3,
            }}
          >
            {COMPARATIVA.map((columna, indice) => (
              <Box
                key={columna.titulo}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '20px',
                  border: '1px solid var(--color-borde)',
                  backgroundColor:
                    indice === 1
                      ? 'var(--color-superficie-suave)'
                      : 'var(--color-superficie)',
                }}
              >
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
                    {columna.titulo}
                  </Typography>
                  <Chip
                    label={columna.etiqueta}
                    size="small"
                    sx={{
                      backgroundColor: 'var(--color-seleccion)',
                      color: 'var(--color-seleccion-texto)',
                      fontWeight: 700,
                    }}
                  />
                </Stack>
                <ListaBeneficios
                  items={columna.items}
                  colorIcono={
                    indice === 1
                      ? 'var(--color-acento)'
                      : 'var(--color-primario)'
                  }
                />
              </Box>
            ))}
          </Box>
        </Box>

        <Box component="section" id="ejemplos" sx={{ mt: { xs: 8, md: 12 } }}>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.6rem', md: '2.15rem' }, fontWeight: 800 }}
          >
            Una cartera para cada plan
          </Typography>
          <Typography sx={{ mt: 1, color: 'var(--color-texto-secundario)' }}>
            Elige el tipo de cartera según lo que quieras organizar.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 2.5,
              mt: 3,
            }}
          >
            {EJEMPLOS.map(({ titulo, Icono, descripcion, ejemplos }) => (
              <Tarjeta key={titulo}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    backgroundColor: 'var(--color-seleccion)',
                    color: 'var(--color-seleccion-texto)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icono sx={{ fontSize: 24 }} />
                </Box>
                <Typography sx={{ mt: 2, fontWeight: 800 }}>{titulo}</Typography>
                <Typography
                  sx={{ mt: 1, color: 'var(--color-texto-secundario)' }}
                >
                  {descripcion}
                </Typography>
                <Stack spacing={0.75} sx={{ mt: 2 }}>
                  {ejemplos.map((ejemplo) => (
                    <Typography
                      key={ejemplo}
                      variant="body2"
                      sx={{ color: 'var(--color-texto-terciario)' }}
                    >
                      · {ejemplo}
                    </Typography>
                  ))}
                </Stack>
              </Tarjeta>
            ))}
          </Box>
        </Box>

        <Box
          component="section"
          id="contacto"
          sx={{
            mt: { xs: 8, md: 12 },
            p: { xs: 2.5, md: 4 },
            borderRadius: '24px',
            backgroundColor: 'var(--color-superficie-suave)',
            border: '1px solid var(--color-borde)',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' },
              gap: { xs: 4, md: 6 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                component="h2"
                sx={{ fontSize: { xs: '1.6rem', md: '2.15rem' }, fontWeight: 800 }}
              >
                ¿Tienes una idea o una duda?
              </Typography>
              <Typography sx={{ mt: 1.5, color: 'var(--color-texto-secundario)' }}>
                Escríbenos. Leemos todos los comentarios para mejorar FinanzApp.
              </Typography>
              <ListaBeneficios
                colorIcono="var(--color-acento)"
                items={[
                  'No necesitas crear una cuenta',
                  'Tu correo solo se usa para responderte',
                  'Nos ayuda a priorizar nuevas funciones',
                ]}
              />
            </Box>
            <FormularioComentarios />
          </Box>
        </Box>

        <Box
          component="footer"
          sx={{
            mt: { xs: 8, md: 10 },
            pt: 3,
            pb: 5,
            borderTop: '1px solid var(--color-borde)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'var(--color-primario)',
                color: 'var(--color-sobre-primario)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
              }}
            >
              F
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              FinanzApp
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'var(--color-texto-terciario)' }}>
            Hecho para que las cuentas no se vuelvan un problema.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Landing
