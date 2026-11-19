import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
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
    detalle: 'Ideal para familias y grupos de amigos.',
    fondo: 'var(--color-seleccion)',
    color: 'var(--color-seleccion-texto)',
    borde: 'var(--color-secundario)',
  },
  {
    titulo: 'Ve tus gastos claros',
    Icono: IconoEstrella,
    texto: 'Gráficas por mes y por categoría, sin hojas de cálculo.',
    detalle: 'Filtra por periodo y compara tus meses.',
    fondo: 'var(--color-superficie-suave)',
    color: 'var(--color-primario)',
    borde: 'var(--color-primario)',
  },
  {
    titulo: 'Cierra con balance',
    Icono: IconoCalendario,
    texto: 'Al terminar el viaje o evento, obtén el balance por persona.',
    detalle: 'Con liquidación sugerida para cada quien.',
    fondo: 'var(--color-seleccion)',
    color: 'var(--color-seleccion-texto)',
    borde: 'var(--color-secundario)',
  },
]

const PASOS = [
  {
    numero: '1',
    titulo: 'Crea tu cartera',
    texto: 'Elige si es de hogar, viaje o evento y define su presupuesto.',
  },
  {
    numero: '2',
    titulo: 'Invita y registra',
    texto: 'Comparte el QR y anoten ingresos y gastos desde web o móvil.',
  },
  {
    numero: '3',
    titulo: 'Cierra y reparte',
    texto: 'Consulta el balance por persona y liquida sin discusiones.',
  },
]

const PREGUNTAS = [
  {
    pregunta: '¿Necesito instalar la app para usarla?',
    respuesta:
      'No. Puedes administrar tus carteras desde la versión web en cualquier navegador. La app móvil sirve para registrar gastos más rápido y recibir notificaciones.',
  },
  {
    pregunta: '¿Cómo se unen otras personas a mi cartera?',
    respuesta:
      'El propietario genera una invitación con código QR y una clave de 8 caracteres. Quien la reciba puede unirse y empezar a registrar movimientos.',
  },
  {
    pregunta: '¿Puedo usar FinanzApp para un viaje o un evento?',
    respuesta:
      'Sí. Las carteras de tipo Viaje y Evento tienen periodo y cierre: al finalizar se calcula el balance y el total por participante.',
  },
  {
    pregunta: '¿Qué pasa si elimino a un colaborador?',
    respuesta:
      'Pierde el acceso a la cartera, pero sus transacciones se conservan con su autor. Además, el propietario puede volver a invitarlo después.',
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
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 18px 38px rgba(23, 59, 69, 0.16)',
        },
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

function PuntosVentana() {
  return (
    <Stack direction="row" spacing={0.75}>
      {[1, 2, 3].map((punto) => (
        <Box
          key={punto}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'var(--color-borde-fuerte)',
          }}
        />
      ))}
    </Stack>
  )
}

function MockNavegador() {
  const barras = [38, 62, 48, 80, 56, 92]

  return (
    <Box
      sx={{
        mt: 3,
        borderRadius: '14px',
        border: '1px solid var(--color-borde)',
        backgroundColor: 'var(--color-superficie)',
        overflow: 'hidden',
        animation: 'flotarSuave 6s ease-in-out infinite',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1.5,
          py: 1,
          backgroundColor: 'var(--color-superficie-suave)',
        }}
      >
        <PuntosVentana />
        <Box
          sx={{
            flex: 1,
            height: 16,
            borderRadius: '999px',
            backgroundColor: 'var(--color-superficie)',
          }}
        />
      </Box>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 92 }}>
          {barras.map((altura, indice) => (
            <Box
              key={indice}
              sx={{
                flex: 1,
                height: `${altura}%`,
                borderRadius: '6px 6px 2px 2px',
                background:
                  indice % 2 === 0
                    ? 'var(--color-primario)'
                    : 'var(--color-acento)',
              }}
            />
          ))}
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Box
            sx={{
              flex: 1,
              height: 8,
              borderRadius: '999px',
              backgroundColor: 'var(--color-superficie-suave)',
            }}
          />
          <Box
            sx={{
              width: 40,
              height: 8,
              borderRadius: '999px',
              backgroundColor: 'var(--color-seleccion)',
            }}
          />
        </Stack>
      </Box>
    </Box>
  )
}

function MockTelefono() {
  return (
    <Box
      sx={{
        mt: 3,
        mx: 'auto',
        width: 176,
        borderRadius: '28px',
        border: '6px solid var(--color-primario)',
        backgroundColor: 'var(--color-superficie)',
        p: 1.5,
        boxShadow: '0 12px 28px rgba(23, 59, 69, 0.14)',
        animation: 'flotarSuave 6s ease-in-out infinite',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 6,
          borderRadius: '999px',
          backgroundColor: 'var(--color-borde)',
          mx: 'auto',
          mb: 1.5,
        }}
      />
      <Box
        sx={{
          p: 1.25,
          borderRadius: '12px',
          backgroundColor: 'var(--color-seleccion)',
          color: 'var(--color-seleccion-texto)',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          Disponible
        </Typography>
        <Typography sx={{ fontWeight: 800 }}>{formatearMonto(4250)}</Typography>
      </Box>
      <Stack spacing={1} sx={{ mt: 1.5 }}>
        {MOVIMIENTOS.map((movimiento) => (
          <Box
            key={movimiento.nombre}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="caption" noWrap sx={{ fontWeight: 600 }}>
              {movimiento.nombre}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color:
                  movimiento.tipo === 'INGRESO'
                    ? 'var(--color-exito)'
                    : 'var(--color-texto-secundario)',
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
        backgroundImage: [
          'radial-gradient(circle at 12% 8%, color-mix(in srgb, var(--color-acento) 18%, transparent), transparent 38%)',
          'radial-gradient(circle at 88% 22%, color-mix(in srgb, var(--color-primario) 12%, transparent), transparent 42%)',
          'radial-gradient(circle at 50% 92%, color-mix(in srgb, var(--color-secundario) 12%, transparent), transparent 45%)',
          'linear-gradient(color-mix(in srgb, var(--color-borde) 45%, transparent) 1px, transparent 1px)',
          'linear-gradient(90deg, color-mix(in srgb, var(--color-borde) 45%, transparent) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: 'auto, auto, auto, 48px 48px, 48px 48px',
        '& section': { animation: 'aparecer 0.6s ease-out both' },
        '& h2': { position: 'relative', display: 'inline-block', pb: 1.25 },
        '& h2::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: 64,
          height: 4,
          borderRadius: '999px',
          background:
            'linear-gradient(90deg, var(--color-primario), var(--color-acento))',
        },
      }}
    >
      <Box
        component="header"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--gradiente-marca)',
          color: 'var(--paleta-blanco)',
          pb: { xs: 14, md: 18 },
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
            animation: 'flotar 9s ease-in-out infinite',
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
            opacity: 0.18,
            pointerEvents: 'none',
            animation: 'pulso 8s ease-in-out infinite',
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
                Las cuentas claras también{' '}
                <Box
                  component="span"
                  sx={{
                    background:
                      'linear-gradient(90deg, var(--color-acento), var(--color-secundario))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  se ven bien
                </Box>
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

        <Box
          component="svg"
          aria-hidden="true"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          sx={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            width: '100%',
            height: { xs: 48, md: 80 },
            display: 'block',
          }}
        >
          <path
            d="M0,70 C240,118 480,10 720,40 C960,70 1200,122 1440,66 L1440,120 L0,120 Z"
            fill="var(--color-fondo)"
          />
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
          {BENEFICIOS.map(({ titulo, Icono, texto, detalle, fondo, color, borde }) => (
            <Box
              key={titulo}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 240,
                p: 3,
                borderRadius: '20px',
                border: '1px solid var(--color-borde)',
                background: `linear-gradient(150deg, ${fondo} 0%, var(--color-superficie) 78%)`,
                boxShadow: '0 8px 24px rgba(23, 59, 69, 0.08)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  background: `linear-gradient(90deg, ${borde}, var(--color-acento))`,
                },
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(23, 59, 69, 0.2)',
                },
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '16px',
                  color: 'var(--color-sobre-primario)',
                  background:
                    'linear-gradient(135deg, var(--color-secundario), var(--color-primario))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 18px rgba(198, 93, 69, 0.32)',
                }}
              >
                <Icono sx={{ fontSize: 26 }} />
              </Box>
              <Typography sx={{ mt: 2.5, fontWeight: 800, fontSize: '1.15rem' }}>
                {titulo}
              </Typography>
              <Typography
                sx={{ mt: 1, color: 'var(--color-texto-secundario)' }}
              >
                {texto}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  pt: 1.5,
                  borderTop: '1px dashed var(--color-borde-fuerte)',
                  color,
                  fontWeight: 700,
                }}
              >
                {detalle}
              </Typography>
            </Box>
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
                  borderTop:
                    indice === 0
                      ? '5px solid var(--color-primario)'
                      : '5px solid var(--color-secundario)',
                  background:
                    indice === 1
                      ? 'linear-gradient(160deg, var(--color-seleccion) 0%, var(--color-superficie) 75%)'
                      : 'linear-gradient(160deg, var(--color-superficie-suave) 0%, var(--color-superficie) 75%)',
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
                {indice === 0 ? <MockNavegador /> : <MockTelefono />}
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            mt: { xs: 8, md: 10 },
            p: { xs: 3, md: 4 },
            borderRadius: '24px',
            background: 'var(--gradiente-marca)',
            color: 'var(--paleta-blanco)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 3,
            textAlign: 'center',
          }}
        >
          {[
            { valor: '3', texto: 'tipos de cartera' },
            { valor: '8', texto: 'caracteres en la clave de invitación' },
            { valor: '100%', texto: 'en línea, sin hojas de cálculo' },
          ].map((dato) => (
            <Box key={dato.texto}>
              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 800,
                  color: 'var(--color-acento)',
                  lineHeight: 1.1,
                }}
              >
                {dato.valor}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.85 }}>
                {dato.texto}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          component="section"
          sx={{
            mt: { xs: 8, md: 12 },
            p: { xs: 3, md: 4.5 },
            borderRadius: '24px',
            background: 'var(--gradiente-marca)',
            color: 'var(--paleta-blanco)',
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: '1.6rem', md: '2.15rem' },
              fontWeight: 800,
              color: 'var(--paleta-blanco)',
            }}
          >
            Así de fácil es empezar
          </Typography>
          <Typography sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.8)' }}>
            Tres pasos y tu cartera queda lista.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: 2.5,
              mt: 3,
            }}
          >
            {PASOS.map((paso, indice) => (
              <Tarjeta key={paso.numero}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor:
                        indice === 1
                          ? 'var(--color-acento)'
                          : 'var(--color-primario)',
                      color: 'var(--color-sobre-primario)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}
                  >
                    {paso.numero}
                  </Box>
                  <Typography sx={{ fontWeight: 800 }}>{paso.titulo}</Typography>
                </Stack>
                <Typography
                  sx={{ mt: 1.5, color: 'var(--color-texto-secundario)' }}
                >
                  {paso.texto}
                </Typography>
              </Tarjeta>
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

        <Box component="section" sx={{ mt: { xs: 8, md: 12 } }}>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.6rem', md: '2.15rem' }, fontWeight: 800 }}
          >
            Preguntas frecuentes
          </Typography>
          <Typography sx={{ mt: 1, color: 'var(--color-texto-secundario)' }}>
            Lo que más nos preguntan antes de empezar.
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 3 }}>
            {PREGUNTAS.map((item) => (
              <Accordion
                key={item.pregunta}
                elevation={0}
                disableGutters
                sx={{
                  border: '1px solid var(--color-borde)',
                  borderRadius: '14px !important',
                  backgroundColor: 'var(--color-superficie)',
                  '&::before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: 'var(--color-primario)',
                        fontSize: '1.25rem',
                        lineHeight: 1,
                      }}
                    >
                      +
                    </Typography>
                  }
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    {item.pregunta}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ color: 'var(--color-texto-secundario)' }}>
                    {item.respuesta}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>

        <Box
          component="section"
          id="contacto"
          sx={{
            mt: { xs: 8, md: 12 },
            p: { xs: 2.5, md: 4 },
            borderRadius: '24px',
            background:
              'linear-gradient(160deg, var(--color-superficie-suave) 0%, var(--color-seleccion) 100%)',
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
          component="section"
          sx={{
            mt: { xs: 8, md: 10 },
            p: { xs: 3, md: 5 },
            borderRadius: '24px',
            background:
              'linear-gradient(120deg, var(--color-secundario) 0%, var(--color-primario) 100%)',
            color: 'var(--paleta-blanco)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 3,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              component="h2"
              sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800 }}
            >
              Empieza a organizar tus cuentas hoy
            </Typography>
            <Typography sx={{ mt: 1, opacity: 0.85 }}>
              Crear tu primera cartera toma menos de un minuto.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/registro"
            sx={{
              backgroundColor: 'var(--paleta-blanco)',
              color: 'var(--paleta-petroleo)',
              fontWeight: 700,
              '&:hover': { backgroundColor: 'var(--color-acento)' },
            }}
          >
            Crear cuenta gratis
          </Button>
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
