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
import Revelar from '../components/Revelar.jsx'
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

const PETROLEO = 'var(--paleta-petroleo)'
const BLANCO = 'var(--paleta-blanco)'
const TEXTO_SOBRE_OSCURO = 'rgba(255, 255, 255, 0.72)'
const BORDE_SOBRE_OSCURO = 'rgba(255, 255, 255, 0.16)'

const contenedor = {
  width: '100%',
  maxWidth: 1120,
  mx: 'auto',
  px: { xs: 2.5, md: 4 },
}

const sxTarjeta = {
  height: '100%',
  p: { xs: 2.5, md: 3 },
  backgroundColor: 'var(--color-superficie)',
  border: '1px solid var(--color-borde)',
  borderRadius: '14px',
  transition: 'border-color 0.2s ease, transform 0.2s ease',
  '&:hover': {
    borderColor: 'var(--color-borde-fuerte)',
    transform: 'translateY(-2px)',
  },
}

const sxEncabezado = { maxWidth: 680 }

const BENEFICIOS = [
  {
    titulo: 'Invita con QR',
    Icono: IconoPersonas,
    texto: 'Suma a quien quieras con una clave de 8 caracteres.',
    detalle: 'Ideal para familias y grupos de amigos.',
  },
  {
    titulo: 'Ve tus gastos claros',
    Icono: IconoEstrella,
    texto: 'Gráficas por mes y por categoría, sin hojas de cálculo.',
    detalle: 'Filtra por periodo y compara tus meses.',
  },
  {
    titulo: 'Cierra con balance',
    Icono: IconoCalendario,
    texto: 'Al terminar el viaje o evento, obtén el balance por persona.',
    detalle: 'Con liquidación sugerida para cada quien.',
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
      'No. Puedes administrar tus carteras desde la versión web en cualquier navegador, sin descargar nada. La app móvil es opcional y está pensada para el día a día: registrar gastos más rápido, unirte a una cartera con código QR y recibir notificaciones de cada movimiento.',
  },
  {
    pregunta: '¿Cómo se unen otras personas a mi cartera?',
    respuesta:
      'El propietario genera la invitación desde el detalle de la cartera; incluye un código QR y una clave de 8 caracteres. Quien la reciba puede escanear el QR o escribir la clave para unirse como colaborador y empezar a registrar movimientos. Si hace falta, el propietario puede generar una invitación nueva y la anterior deja de funcionar.',
  },
  {
    pregunta: '¿Puedo usar FinanzApp para un viaje o un evento?',
    respuesta:
      'Sí. Las carteras de tipo Viaje y Evento manejan fechas y presupuesto, y se pueden cerrar cuando termina el plan. Al cerrarlas se calcula el balance total, el desglose por categoría y el total por participante, con una liquidación sugerida. Después la cartera queda en solo lectura para consultar el historial o descargar su reporte.',
  },
  {
    pregunta: '¿Qué pasa si elimino a un colaborador?',
    respuesta:
      'El colaborador pierde el acceso de inmediato y deja de recibir notificaciones de esa cartera, pero su registro y las transacciones que haya hecho se conservan con su autor para no alterar los saldos ni el historial. Si más adelante lo necesitas, puedes volver a invitarlo con una nueva invitación y unirse de nuevo.',
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
    ilustracion: 'hogar',
    descripcion:
      'Controla la despensa, los servicios y tu presupuesto mensual en un solo lugar.',
    ejemplos: ['Renta y servicios', 'Súper y despensa', 'Ahorro del mes'],
  },
  {
    titulo: 'Cartera compartida',
    ilustracion: 'compartida',
    descripcion:
      'Organiza los gastos de casa o de la oficina y ve quién aportó y quién gastó.',
    ejemplos: ['Gastos del hogar', 'Fondo común', 'Liquidación por persona'],
  },
  {
    titulo: 'Evento o viaje',
    ilustracion: 'viaje',
    descripcion:
      'Junta los gastos de una fecha especial y cierra la cartera con su balance final.',
    ejemplos: ['Viaje con amigos', 'Cumpleaños', 'Posada o boda'],
  },
]

const DATOS = [
  { valor: '3', texto: 'tipos de cartera' },
  { valor: '8', texto: 'caracteres en la clave de invitación' },
  { valor: '100%', texto: 'en línea, sin hojas de cálculo' },
]

const MOVIMIENTOS = [
  { nombre: 'Hospedaje', fecha: '12/11/2026', monto: -1800, tipo: 'GASTO' },
  { nombre: 'Aportación Ana', fecha: '13/11/2026', monto: 2500, tipo: 'INGRESO' },
  { nombre: 'Comida', fecha: '14/11/2026', monto: -650, tipo: 'GASTO' },
]

function Encabezado({ etiqueta, titulo, texto, oscuro = false }) {
  return (
    <Box sx={sxEncabezado}>
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: oscuro ? 'var(--color-acento)' : 'var(--color-seleccion-texto)',
        }}
      >
        {etiqueta}
      </Typography>
      <Typography
        component="h2"
        sx={{
          mt: 1.25,
          fontSize: { xs: '1.75rem', md: '2.25rem' },
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          color: oscuro ? BLANCO : 'var(--color-texto)',
        }}
      >
        {titulo}
      </Typography>
      <Typography
        sx={{ mt: 1.5, color: oscuro ? TEXTO_SOBRE_OSCURO : 'var(--color-texto-secundario)' }}
      >
        {texto}
      </Typography>
    </Box>
  )
}

function Tarjeta({ children, sx }) {
  return <Box sx={{ ...sxTarjeta, ...sx }}>{children}</Box>
}

function ListaBeneficios({ items }) {
  return (
    <Stack component="ul" spacing={1.25} sx={{ mt: 2.5, pl: 0, listStyle: 'none' }}>
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
              backgroundColor: 'var(--color-seleccion)',
              color: 'var(--color-seleccion-texto)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconoCheck sx={{ fontSize: 13 }} />
          </Box>
          <Typography sx={{ color: 'var(--color-texto-secundario)' }}>{item}</Typography>
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
        width: '100%',
        maxWidth: 380,
        p: { xs: 2.5, sm: 3 },
        backgroundColor: BLANCO,
        color: PETROLEO,
        border: '1px solid var(--color-borde)',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            backgroundColor: 'var(--paleta-fondo)',
            color: PETROLEO,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconoCartera sx={{ fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>Viaje a la playa</Typography>
          <Chip
            label="Viaje"
            size="small"
            sx={{
              mt: 0.5,
              height: 22,
              backgroundColor: 'var(--paleta-fondo)',
              color: PETROLEO,
              fontWeight: 700,
            }}
          />
        </Box>
      </Stack>

      <Box
        sx={{
          mt: 2.5,
          p: 2,
          borderRadius: '12px',
          backgroundColor: 'var(--paleta-fondo)',
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Disponible
        </Typography>
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {formatearMonto(4250)}
        </Typography>
      </Box>

      <Stack divider={<Box sx={{ borderTop: '1px solid var(--color-borde)' }} />} sx={{ mt: 2 }}>
        {MOVIMIENTOS.map((movimiento) => (
          <Box
            key={movimiento.nombre}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              py: 1.25,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }} noWrap>
                {movimiento.nombre}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.65 }}>
                {movimiento.fecha}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color:
                  movimiento.tipo === 'INGRESO'
                    ? 'var(--paleta-petroleo)'
                    : 'var(--paleta-terracota)',
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

function MockNavegador() {
  const barras = [38, 62, 48, 80, 56, 92]

  return (
    <Box
      sx={{
        mt: 3,
        border: '1px solid var(--color-borde)',
        borderRadius: '12px',
        backgroundColor: 'var(--color-superficie)',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          px: 1.5,
          py: 1,
          borderBottom: '1px solid var(--color-borde)',
          backgroundColor: 'var(--color-superficie-suave)',
        }}
      >
        {[1, 2, 3].map((punto) => (
          <Box
            key={punto}
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: 'var(--color-borde-fuerte)',
            }}
          />
        ))}
      </Stack>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 88 }}>
          {barras.map((altura, indice) => (
            <Box
              key={indice}
              sx={{
                flex: 1,
                height: `${altura}%`,
                borderRadius: '4px 4px 0 0',
                backgroundColor:
                  indice % 2 === 0 ? PETROLEO : 'var(--color-secundario)',
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
        borderRadius: '24px',
        border: `6px solid ${PETROLEO}`,
        backgroundColor: 'var(--color-superficie)',
        p: 1.5,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 5,
          borderRadius: '999px',
          backgroundColor: 'var(--color-borde)',
          mx: 'auto',
          mb: 1.5,
        }}
      />
      <Box
        sx={{
          p: 1.25,
          borderRadius: '10px',
          backgroundColor: 'var(--color-superficie-suave)',
        }}
      >
        <Typography variant="caption" sx={{ color: 'var(--color-texto-secundario)' }}>
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
                    : 'var(--color-error)',
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

function IlustracionEjemplo({ tipo }) {
  const comun = {
    viewBox: '0 0 220 110',
    sx: { width: '100%', height: 104, display: 'block' },
  }

  if (tipo === 'hogar') {
    return (
      <Box
        component="svg"
        {...comun}
        role="img"
        aria-label="Ilustración de una cartera personal"
      >
        <circle cx="182" cy="26" r="16" fill="var(--color-acento)" />
        <path
          d="M40 82V56l44-28 44 28v26"
          fill="var(--color-superficie-suave)"
          stroke={PETROLEO}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <rect x="62" y="62" width="16" height="20" rx="2" fill="var(--color-seleccion)" />
        <rect x="90" y="58" width="18" height="24" rx="2" fill="var(--color-secundario)" />
        <path d="M28 84h124" stroke="var(--color-borde-fuerte)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="160" cy="74" r="12" fill={PETROLEO} />
        <path
          d="M154 74h12M160 68v12"
          stroke={BLANCO}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </Box>
    )
  }

  if (tipo === 'compartida') {
    return (
      <Box
        component="svg"
        {...comun}
        role="img"
        aria-label="Ilustración de una cartera compartida"
      >
        <circle cx="72" cy="48" r="17" fill="var(--color-superficie-suave)" />
        <path d="M52 88c0-13 9-21 20-21s20 8 20 21" fill="var(--color-superficie-suave)" />
        <circle cx="146" cy="48" r="17" fill="var(--color-seleccion)" />
        <path d="M126 88c0-13 9-21 20-21s20 8 20 21" fill="var(--color-seleccion)" />
        <circle cx="72" cy="44" r="8" fill={PETROLEO} />
        <circle cx="146" cy="44" r="8" fill="var(--color-secundario)" />
        <path
          d="M94 56h30"
          stroke="var(--color-acento)"
          strokeWidth="4"
          strokeDasharray="5 6"
          strokeLinecap="round"
        />
        <rect x="172" y="20" width="14" height="14" rx="3" fill={PETROLEO} />
        <rect x="190" y="20" width="9" height="9" rx="2" fill="var(--color-acento)" />
        <rect x="172" y="38" width="9" height="9" rx="2" fill="var(--color-acento)" />
      </Box>
    )
  }

  return (
    <Box
      component="svg"
      {...comun}
      role="img"
      aria-label="Ilustración de una cartera de viaje"
    >
      <circle cx="176" cy="28" r="15" fill="var(--color-acento)" />
      <path d="M16 86 58 42l28 28 16-14 50 30Z" fill="var(--color-superficie-suave)" />
      <path d="M58 42 86 70 68 86H24Z" fill={PETROLEO} opacity="0.9" />
      <path
        d="M16 94c12-7 24-7 36 0s24 7 36 0 24-7 36 0 24 7 36 0"
        fill="none"
        stroke="var(--color-secundario)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M110 30c14-9 28-9 42 2"
        fill="none"
        stroke={PETROLEO}
        strokeWidth="3"
        strokeDasharray="4 6"
        strokeLinecap="round"
      />
      <path d="m150 26 9 6-11 3 2-9Z" fill="var(--color-secundario)" />
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
    <Box sx={{ backgroundColor: 'var(--color-fondo)', color: 'var(--color-texto)' }}>
      <Box
        component="header"
        sx={{ backgroundColor: PETROLEO, color: BLANCO }}
      >
        <Box sx={{ ...contenedor, pt: { xs: 2.5, md: 3.5 }, pb: { xs: 8, md: 11 } }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: BLANCO,
                  color: PETROLEO,
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

            <Stack
              direction="row"
              spacing={{ xs: 1, sm: 2 }}
              sx={{
                alignItems: 'center',
                '& .MuiButton-root': {
                  minHeight: { xs: 38, sm: 50 },
                  px: { xs: 1.5, sm: 2.5 },
                  fontSize: { xs: '0.8rem', sm: '0.9375rem' },
                },
              }}
            >
              <Link
                href="#producto"
                underline="none"
                sx={{
                  display: { xs: 'none', md: 'inline' },
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
                  display: { xs: 'none', md: 'inline' },
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
                sx={{
                  display: { xs: 'none', sm: 'inline' },
                  color: 'inherit',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Iniciar sesión
              </Link>
              <Button
                component={RouterLink}
                to="/registro"
                sx={{
                  backgroundColor: BLANCO,
                  color: PETROLEO,
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
              gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
              gap: { xs: 6, md: 8 },
              alignItems: 'center',
              mt: { xs: 5, md: 8 },
            }}
          >
            <Revelar>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-acento)',
                }}
              >
                Finanzas compartidas sin enredos
              </Typography>
              <Typography
                component="h1"
                sx={{
                  mt: 2,
                  fontSize: { xs: '2.4rem', md: '3.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: '-0.035em',
                }}
              >
                Las cuentas claras también{' '}
                <Box component="span" sx={{ color: 'var(--color-acento)' }}>
                  se ven bien
                </Box>
              </Typography>
              <Typography
                sx={{
                  mt: 2.5,
                  maxWidth: 500,
                  fontSize: '1.1rem',
                  color: TEXTO_SOBRE_OSCURO,
                }}
              >
                Organiza carteras de hogar, viajes y eventos. Invita a quien
                quieras, registra cada movimiento y cierra con el balance exacto.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ mt: 3.5, alignItems: { xs: 'stretch', sm: 'center' } }}
              >
                <Button
                  component={RouterLink}
                  to="/registro"
                  sx={{
                    backgroundColor: BLANCO,
                    color: PETROLEO,
                    fontWeight: 700,
                    '&:hover': { backgroundColor: 'var(--color-acento)' },
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
                      color: BLANCO,
                      borderColor: BORDE_SOBRE_OSCURO,
                      '&:hover': { borderColor: BLANCO },
                    }}
                  >
                    Descargar app
                  </Button>
                ) : (
                  <Tooltip title="La descarga estará disponible pronto.">
                    <Chip
                      label="App Android: próximamente"
                      sx={{
                        height: 44,
                        color: BLANCO,
                        border: `1px dashed ${BORDE_SOBRE_OSCURO}`,
                        backgroundColor: 'transparent',
                        fontWeight: 600,
                      }}
                    />
                  </Tooltip>
                )}
              </Stack>

              <Stack
                direction="row"
                sx={{ mt: 4, flexWrap: 'wrap', gap: 2.5 }}
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
                      <Typography variant="body2" sx={{ color: BLANCO }}>
                        {texto}
                      </Typography>
                    </Stack>
                  ),
                )}
              </Stack>
            </Revelar>

            <Revelar
              delay={140}
              sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
            >
              <SimulacionCartera />
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  position: 'absolute',
                  top: -16,
                  left: { sm: -8, md: -16 },
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '10px',
                  backgroundColor: BLANCO,
                  color: PETROLEO,
                  border: '1px solid var(--color-borde)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.16)',
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-seleccion)',
                    color: 'var(--color-seleccion-texto)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconoCheck sx={{ fontSize: 13 }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Gasto registrado
                </Typography>
              </Box>
            </Revelar>
          </Box>
        </Box>
      </Box>

      <Box
        component="section"
        sx={{
          ...contenedor,
          py: { xs: 8, md: 10 },
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 2.5,
        }}
      >
        {BENEFICIOS.map(({ titulo, Icono, texto, detalle }, indice) => (
          <Revelar key={titulo} delay={indice * 90} sx={{ height: '100%' }}>
            <Tarjeta>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-seleccion)',
                  color: 'var(--color-seleccion-texto)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icono sx={{ fontSize: 22 }} />
              </Box>
              <Typography sx={{ mt: 2.5, fontWeight: 700, fontSize: '1.1rem' }}>
                {titulo}
              </Typography>
              <Typography sx={{ mt: 1, color: 'var(--color-texto-secundario)' }}>
                {texto}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  pt: 1.5,
                  borderTop: '1px solid var(--color-borde)',
                  color: 'var(--color-seleccion-texto)',
                  fontWeight: 700,
                }}
              >
                {detalle}
              </Typography>
            </Tarjeta>
          </Revelar>
        ))}
      </Box>

      <Box
        component="section"
        id="producto"
        sx={{
          ...contenedor,
          py: { xs: 6, md: 9 },
          borderTop: '1px solid var(--color-borde)',
        }}
      >
        <Encabezado
          etiqueta="Producto"
          titulo="Web y móvil, cada una para lo suyo"
          texto="Administra desde la computadora y registra gastos desde el celular."
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2.5,
            mt: 4,
          }}
        >
          {COMPARATIVA.map((columna, indice) => (
            <Revelar key={columna.titulo} delay={indice * 120} sx={{ height: '100%' }}>
              <Tarjeta>
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
                    {columna.titulo}
                  </Typography>
                  <Chip
                    label={columna.etiqueta}
                    size="small"
                    sx={{
                      backgroundColor: 'var(--color-superficie-suave)',
                      color: 'var(--color-texto-secundario)',
                      fontWeight: 600,
                    }}
                  />
                </Stack>
                <ListaBeneficios items={columna.items} />
                {indice === 0 ? <MockNavegador /> : <MockTelefono />}
              </Tarjeta>
            </Revelar>
          ))}
        </Box>
      </Box>

      <Box
        component="section"
        sx={{
          backgroundColor: PETROLEO,
          color: BLANCO,
          borderBottom: `1px solid ${BORDE_SOBRE_OSCURO}`,
        }}
      >
        <Box
          sx={{
            ...contenedor,
            py: { xs: 5, md: 6 },
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 3,
          }}
        >
          {DATOS.map((dato, indice) => (
            <Revelar key={dato.texto} delay={indice * 90}>
              <Box
                sx={{
                  pl: { md: indice === 0 ? 0 : 3 },
                  borderLeft: {
                    md: indice === 0 ? 'none' : `1px solid ${BORDE_SOBRE_OSCURO}`,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '2rem', md: '2.75rem' },
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                    color: 'var(--color-acento)',
                  }}
                >
                  {dato.valor}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: TEXTO_SOBRE_OSCURO }}>
                  {dato.texto}
                </Typography>
              </Box>
            </Revelar>
          ))}
        </Box>
      </Box>

      <Box
        component="section"
        sx={{ backgroundColor: PETROLEO, color: BLANCO }}
      >
        <Box sx={{ ...contenedor, py: { xs: 8, md: 10 } }}>
          <Encabezado
            etiqueta="Empezar"
            titulo="Así de fácil es empezar"
            texto="Tres pasos y tu cartera queda lista."
            oscuro
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: 2.5,
              mt: 4,
            }}
          >
            {PASOS.map((paso, indice) => (
              <Revelar key={paso.numero} delay={indice * 90} sx={{ height: '100%' }}>
                <Tarjeta
                  sx={{
                    backgroundColor: BLANCO,
                    color: PETROLEO,
                    borderColor: 'transparent',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      lineHeight: 1,
                      color: 'var(--paleta-terracota)',
                    }}
                  >
                    {paso.numero}
                  </Typography>
                  <Typography sx={{ mt: 2, fontWeight: 700 }}>{paso.titulo}</Typography>
                  <Typography sx={{ mt: 1, opacity: 0.75 }}>{paso.texto}</Typography>
                </Tarjeta>
              </Revelar>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        component="section"
        sx={{
          ...contenedor,
          py: { xs: 6, md: 9 },
          borderTop: '1px solid var(--color-borde)',
        }}
      >
        <Encabezado
          etiqueta="En la práctica"
          titulo="Así se siente tener tus cuentas en orden"
          texto="Planea, registra y comparte tus gastos sin perder el control."
        />
        <Revelar distancia={32} sx={{ mt: 4 }}>
          <Box
            sx={{
              p: { xs: 1, sm: 1.5 },
              backgroundColor: 'var(--color-superficie)',
              border: '1px solid var(--color-borde)',
              borderRadius: '16px',
            }}
          >
            <Box
              component="video"
              controls
              muted
              loop
              playsInline
              preload="metadata"
              poster="https://images.pexels.com/videos/6700653/accountant-accounting-adult-banknote-6700653.jpeg?auto=compress&cs=tinysrgb&w=1280"
              src="https://videos.pexels.com/video-files/6700653/6700653-hd_1280_720_25fps.mp4"
              aria-label="Video de una persona organizando sus finanzas"
              sx={{
                display: 'block',
                width: '100%',
                aspectRatio: '16 / 9',
                objectFit: 'cover',
                borderRadius: '10px',
              }}
            />
          </Box>
        </Revelar>
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 1.5, color: 'var(--color-texto-secundario)' }}
        >
          Video: Tima Miroshnichenko / Pexels
        </Typography>
      </Box>

      <Box
        component="section"
        id="ejemplos"
        sx={{
          ...contenedor,
          py: { xs: 6, md: 9 },
          borderTop: '1px solid var(--color-borde)',
        }}
      >
        <Encabezado
          etiqueta="Carteras"
          titulo="Una cartera para cada plan"
          texto="Elige el tipo de cartera según lo que quieras organizar."
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 2.5,
            mt: 4,
          }}
        >
          {EJEMPLOS.map(({ titulo, ilustracion, descripcion, ejemplos }, indice) => (
            <Revelar key={titulo} delay={indice * 90} sx={{ height: '100%' }}>
              <Tarjeta>
                <Box
                  sx={{
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-superficie-suave)',
                    p: 1,
                  }}
                >
                  <IlustracionEjemplo tipo={ilustracion} />
                </Box>
                <Typography sx={{ mt: 2, fontWeight: 700 }}>{titulo}</Typography>
                <Typography sx={{ mt: 1, color: 'var(--color-texto-secundario)' }}>
                  {descripcion}
                </Typography>
                <Stack spacing={0.75} sx={{ mt: 2 }}>
                  {ejemplos.map((ejemplo) => (
                    <Typography
                      key={ejemplo}
                      variant="body2"
                      sx={{ color: 'var(--color-texto-secundario)' }}
                    >
                      · {ejemplo}
                    </Typography>
                  ))}
                </Stack>
              </Tarjeta>
            </Revelar>
          ))}
        </Box>
      </Box>

      <Box
        component="section"
        sx={{
          ...contenedor,
          py: { xs: 6, md: 9 },
          borderTop: '1px solid var(--color-borde)',
        }}
      >
        <Encabezado
          etiqueta="Dudas"
          titulo="Preguntas frecuentes"
          texto="Lo que más nos preguntan antes de empezar."
        />
        <Stack spacing={1.5} sx={{ mt: 4 }}>
          {PREGUNTAS.map((item) => (
            <Accordion
              key={item.pregunta}
              elevation={0}
              disableGutters
              sx={{
                border: '1px solid var(--color-borde)',
                borderRadius: '12px !important',
                backgroundColor: 'var(--color-superficie)',
                '&::before': { display: 'none' },
                '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                  transform: 'rotate(135deg)',
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: 'var(--color-secundario)',
                      fontSize: '1.25rem',
                      lineHeight: 1,
                    }}
                  >
                    +
                  </Typography>
                }
              >
                <Typography sx={{ fontWeight: 600 }}>{item.pregunta}</Typography>
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
          ...contenedor,
          py: { xs: 6, md: 9 },
          borderTop: '1px solid var(--color-borde)',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'start',
          }}
        >
          <Revelar>
            <Encabezado
              etiqueta="Contacto"
              titulo="¿Tienes una idea o una duda?"
              texto="Escríbenos. Leemos todos los comentarios para mejorar FinanzApp."
            />
            <ListaBeneficios
              items={[
                'No necesitas crear una cuenta',
                'Tu correo solo se usa para responderte',
                'Nos ayuda a priorizar nuevas funciones',
              ]}
            />
          </Revelar>
          <Revelar delay={120}>
            <FormularioComentarios />
          </Revelar>
        </Box>
      </Box>

      <Box component="section" sx={{ ...contenedor, pb: { xs: 8, md: 10 } }}>
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            backgroundColor: PETROLEO,
            color: BLANCO,
            border: `1px solid ${BORDE_SOBRE_OSCURO}`,
            borderRadius: '20px',
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
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Empieza a organizar tus cuentas hoy
            </Typography>
            <Typography sx={{ mt: 1, color: TEXTO_SOBRE_OSCURO }}>
              Crear tu primera cartera toma menos de un minuto.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/registro"
            sx={{
              backgroundColor: BLANCO,
              color: PETROLEO,
              fontWeight: 700,
              '&:hover': { backgroundColor: 'var(--color-acento)' },
            }}
          >
            Crear cuenta gratis
          </Button>
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{ backgroundColor: PETROLEO, color: BLANCO }}
      >
        <Box
          sx={{
            ...contenedor,
            py: 4,
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
                backgroundColor: BLANCO,
                color: PETROLEO,
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
          <Typography variant="body2" sx={{ color: TEXTO_SOBRE_OSCURO }}>
            Hecho para que las cuentas no se vuelvan un problema.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Landing
