import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { Icon } from '../components/Icon';
import { BarChart } from '../components/charts';

const SERIE_DEMO = [
  { etiqueta: 'abr', valor: 9800 },
  { etiqueta: 'may', valor: 12400 },
  { etiqueta: 'jun', valor: 8600 },
  { etiqueta: 'jul', valor: 13100 },
  { etiqueta: 'ago', valor: 11900 },
  { etiqueta: 'sep', valor: 12970 },
];

const MOVIMIENTOS_DEMO = [
  { nota: 'Recibo de luz', usuario: 'Diego Borja', monto: '1,240', tipo: 'gasto' },
  { nota: 'Aportación al fondo', usuario: 'Aideé Casillas', monto: '4,500', tipo: 'ingreso' },
  { nota: 'Despensa de la semana', usuario: 'Diego Borja', monto: '1,510', tipo: 'gasto' },
];

const PROBLEMAS = [
  { icono: 'alert', titulo: 'Presupuestos rebasados', descripcion: 'Sin un registro común es imposible saber cuánto se ha gastado y cuánto queda disponible.' },
  { icono: 'eye-off', titulo: 'Falta de transparencia', descripcion: 'Los aportes se pierden entre transferencias y notas de voz, nadie sabe quién puso qué.' },
  { icono: 'users', titulo: 'Desacuerdos al cerrar', descripcion: 'Al final del viaje o del mes nadie coincide con los números y la convivencia se tensa.' },
];

const CARACTERISTICAS = [
  { icono: 'wallet', titulo: 'Carteras colaborativas', descripcion: 'Crea carteras para el hogar, un viaje o un evento, e invita a todos los participantes.' },
  { icono: 'qr', titulo: 'Invitación con código QR', descripcion: 'Cada cartera genera un QR y una clave única para unir contribuyentes en segundos.' },
  { icono: 'receipt', titulo: 'Registro de movimientos', descripcion: 'Ingresos y gastos categorizados, con foto opcional y responsable identificado.' },
  { icono: 'chart', titulo: 'Panel analítico', descripcion: 'Gráficas de gasto por categoría y por mes, avance del presupuesto y top de contribuyentes.' },
  { icono: 'users', titulo: 'Gestión de contribuyentes', descripcion: 'Agrega, consulta o elimina participantes de cada cartera con su aporte comprometido.' },
  { icono: 'archive', titulo: 'Cierre y balance final', descripcion: 'Finaliza la cartera y obtén el balance de gastos con la liquidación sugerida entre miembros.' },
];

const PASOS = [
  { numero: '1', titulo: 'Crea tu cartera', descripcion: 'Define categoría, presupuesto inicial y fechas. Si es un viaje o evento, agrega el rango completo.' },
  { numero: '2', titulo: 'Invita y registra', descripcion: 'Comparte el QR y registra ingresos y gastos desde el celular o desde el panel web.' },
  { numero: '3', titulo: 'Analiza y cierra', descripcion: 'Consulta estadísticas en la web, finaliza la cartera y comparte el balance de gastos.' },
];

const MODULOS_MOVIL = [
  'Login y consulta rápida de tus carteras',
  'Registro de ingresos y egresos diarios en segundos',
  'Unirse a una cartera escaneando el código QR',
  'Resumen con accesos directos a cada cartera',
  'Ajustes de cuenta y preferencias de eventos',
];

const MODULOS_WEB = [
  'Landing informativa y registro de usuarios',
  'CRUD completo de carteras, contribuyentes y transacciones',
  'Estadísticas por cartera y avance del presupuesto',
  'Generación de QR y clave única de invitación',
  'Finalizar cartera con balance de gastos final',
];

const TESTIMONIOS = [
  { texto: 'Antes llevábamos todo en una libreta y siempre faltaba dinero. Con FinanzApp terminamos el viaje sin una sola discusión.', nombre: 'Mariana López', rol: 'Organizadora de viajes grupales' },
  { texto: 'La cartera del hogar nos cambió la vida: cada quien registra su gasto desde el celular y el viernes revisamos juntos las gráficas.', nombre: 'Carlos Méndez', rol: 'Administrador del hogar' },
  { texto: 'Usamos las carteras del grupo para la posada y el balance final llegó solo. Ya no hay rifas raras para ver quién pagó qué.', nombre: 'Ricardo Medina', rol: 'Representante de grupo universitario' },
];

export default function Landing() {
  return (
    <Box sx={{ bgcolor: '#ffffff' }}>
      {/* Header */}
      <Box className="no-print" sx={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid rgba(226,232,240,0.8)', bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: { xs: 2, sm: 3, lg: 4 }, py: 1.75 }}>
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, textDecoration: 'none' }}>
            <Box sx={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: '#0d6945', color: '#ffffff', fontSize: 14, fontWeight: 800 }}>
              F
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              Finanz<span style={{ color: '#0d6945' }}>App</span>
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 500, color: '#475569' }}>
            <Box component="a" href="#problema" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: '#0f172a' } }}>El problema</Box>
            <Box component="a" href="#caracteristicas" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: '#0f172a' } }}>Características</Box>
            <Box component="a" href="#como-funciona" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: '#0f172a' } }}>Cómo funciona</Box>
            <Box component="a" href="#modulos" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: '#0f172a' } }}>App y web</Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button component={Link} to="/login" variant="text" sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: '#475569' }}>
              Iniciar sesión
            </Button>
            <Button component={Link} to="/registro" variant="contained" endIcon={<Icon name="chevron-right" size={14} />}>
              Crear cuenta
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Hero */}
      <Box component="section" sx={{ position: 'relative', overflow: 'hidden', bgcolor: '#ffffff' }}>
        <Box sx={{ position: 'absolute', top: -160, right: -128, width: 384, height: 384, borderRadius: '50%', bgcolor: 'rgba(211,245,225,0.7)', filter: 'blur(64px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: 160, left: -160, width: 384, height: 384, borderRadius: '50%', bgcolor: 'rgba(219,234,254,0.6)', filter: 'blur(64px)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', maxWidth: 1280, mx: 'auto', display: 'grid', gap: 7, alignItems: 'center', px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 8, lg: 12 }, gridTemplateColumns: { lg: '1fr 1fr' } }}>
          <Box className="animate-elevar">
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, borderRadius: 999, border: '1px solid #a9eac6', bgcolor: '#edfbf3', color: '#0d5439', px: 1.5, py: 0.75, fontSize: 12, fontWeight: 600 }}>
              <Icon name="sparkles" size={14} />
              Finanzas compartidas, sin discusiones
            </Box>

            <Typography component="h1" sx={{ mt: 2.5, fontSize: { xs: 36, sm: 44, lg: 54 }, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Todas las cuentas claras en <Box component="span" sx={{ color: '#0d6945' }}>una sola cartera</Box>
            </Typography>

            <Typography sx={{ mt: 2.5, maxWidth: 520, fontSize: 18, color: '#475569' }}>
              FinanzApp centraliza los gastos del hogar, los viajes y los eventos. Registra movimientos desde el
              celular y analiza balances, aportaciones y cierres desde el panel web.
            </Typography>

            <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <Button component={Link} to="/registro" variant="contained" size="large" endIcon={<Icon name="chevron-right" size={16} />} sx={{ px: 3 }}>
                Comenzar gratis
              </Button>
              <Button component={Link} to="/login" variant="outlined" size="large" startIcon={<Icon name="eye" size={16} />} sx={{ px: 3, borderColor: '#cbd5e1', color: '#334155' }}>
                Ver demo
              </Button>
            </Box>

            <Box component="dl" sx={{ mt: 5, maxWidth: 480, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, m: 0 }}>
              {[
                { valor: '7', etiqueta: 'Carteras activas en la demo' },
                { valor: '28', etiqueta: 'Contribuyentes registrados' },
                { valor: '4.9', etiqueta: 'Satisfacción del equipo' },
              ].map((dato) => (
                <Box key={dato.etiqueta}>
                  <Typography component="dt" sx={{ fontSize: 24, fontWeight: 800 }}>{dato.valor}</Typography>
                  <Typography component="dd" sx={{ mt: 0.5, fontSize: 12, fontWeight: 500, color: '#64748b', m: 0 }}>{dato.etiqueta}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box className="animate-elevar" sx={{ position: 'relative' }}>
            <Card sx={{ maxWidth: 440, mx: 'auto', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#94a3b8' }}>
                    Casa Borja · Hogar
                  </Typography>
                  <Typography sx={{ mt: 0.5, fontSize: 24, fontWeight: 800 }}>$68,770</Typography>
                </Box>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, borderRadius: 999, bgcolor: '#edfbf3', color: '#0d6945', px: 1.25, py: 0.5, fontSize: 12, fontWeight: 700 }}>
                  <Icon name="trend-up" size={14} />
                  80% del presupuesto
                </Box>
              </Box>
              <Box sx={{ mt: 2.5 }}>
                <BarChart datos={SERIE_DEMO} alto={150} color="#0d6945" leyendaPrincipal="Gastos por mes" />
              </Box>
              <Divider sx={{ my: 2.5 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {MOVIMIENTOS_DEMO.map((m) => (
                  <Box key={m.nota} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: m.tipo === 'ingreso' ? '#edfbf3' : '#fff1f2', color: m.tipo === 'ingreso' ? '#0d6945' : '#e11d48' }}>
                      <Icon name={m.tipo === 'ingreso' ? 'trend-up' : 'cart'} size={17} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{m.nota}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#64748b' }}>{m.usuario}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: m.tipo === 'ingreso' ? '#0d6945' : '#0f172a' }}>
                      {m.tipo === 'ingreso' ? '+' : '−'}${m.monto}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>

            <Card sx={{ display: { xs: 'none', sm: 'block' }, position: 'absolute', bottom: -40, left: { sm: -8, lg: -48 }, width: 224, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: '#0f172a', color: '#ffffff' }}>
                  <Icon name="qr" size={20} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700 }}>Únete con QR</Typography>
                  <Typography sx={{ fontSize: 11, color: '#64748b' }}>Escanea y aporta en segundos</Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Problema */}
      <Box component="section" id="problema" sx={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc', py: { xs: 8, lg: 10 } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
          <Box sx={{ maxWidth: 640 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#0d6945' }}>
              El problema
            </Typography>
            <Typography component="h2" sx={{ mt: 1.5, fontSize: { xs: 26, sm: 32 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Coordinar gastos compartidos suele terminar en descontrol
            </Typography>
            <Typography sx={{ mt: 2, color: '#475569' }}>
              En México existe un alto grado de analfabetismo financiero y una falta de herramientas para coordinar
              gastos grupales. El resultado: presupuestos rebasados, falta de transparencia y desacuerdos.
            </Typography>
          </Box>

          <Box sx={{ mt: 5, display: 'grid', gap: 2.5, gridTemplateColumns: { md: 'repeat(3, 1fr)' } }}>
            {PROBLEMAS.map((problema) => (
              <Card key={problema.titulo} sx={{ p: 3 }}>
                <Box sx={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: '#fff1f2', color: '#e11d48' }}>
                  <Icon name={problema.icono} size={22} />
                </Box>
                <Typography sx={{ mt: 2, fontSize: 15, fontWeight: 700 }}>{problema.titulo}</Typography>
                <Typography sx={{ mt: 1, fontSize: 14, color: '#475569' }}>{problema.descripcion}</Typography>
              </Card>
            ))}
          </Box>

          <Box sx={{ mt: 5, borderRadius: 4, border: '1px solid #a9eac6', bgcolor: 'rgba(237,251,243,0.7)', p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' } }}>
              <Box sx={{ width: 48, height: 48, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, bgcolor: '#0d6945', color: '#ffffff' }}>
                <Icon name="shield" size={24} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>La solución: transparencia por diseño</Typography>
                <Typography sx={{ mt: 0.5, fontSize: 14, color: '#334155' }}>
                  Cada aportación, gasto y saldo queda registrado en su cartera. Al cerrar, FinanzApp calcula el
                  balance final y sugiere quién debe pagarle a quién.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Características */}
      <Box component="section" id="caracteristicas" sx={{ bgcolor: '#ffffff', py: { xs: 8, lg: 10 } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
          <Box sx={{ maxWidth: 640 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#0d6945' }}>
              Características
            </Typography>
            <Typography component="h2" sx={{ mt: 1.5, fontSize: { xs: 26, sm: 32 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Todo lo que necesitas para administrar dinero en grupo
            </Typography>
          </Box>

          <Box sx={{ mt: 5, display: 'grid', gap: 2.5, gridTemplateColumns: { sm: '1fr 1fr', lg: 'repeat(3, 1fr)' } }}>
            {CARACTERISTICAS.map((caracteristica) => (
              <Card key={caracteristica.titulo} sx={{ p: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 10px 24px rgba(15,23,42,0.08)' } }}>
                <Box sx={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: '#0f172a', color: '#ffffff' }}>
                  <Icon name={caracteristica.icono} size={22} />
                </Box>
                <Typography sx={{ mt: 2, fontSize: 15, fontWeight: 700 }}>{caracteristica.titulo}</Typography>
                <Typography sx={{ mt: 1, fontSize: 14, color: '#475569' }}>{caracteristica.descripcion}</Typography>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Cómo funciona */}
      <Box component="section" id="como-funciona" sx={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc', py: { xs: 8, lg: 10 } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
          <Box sx={{ maxWidth: 640 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#0d6945' }}>
              Cómo funciona
            </Typography>
            <Typography component="h2" sx={{ mt: 1.5, fontSize: { xs: 26, sm: 32 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Tres pasos para tener tus cuentas claras
            </Typography>
          </Box>

          <Box sx={{ mt: 5, display: 'grid', gap: 2.5, gridTemplateColumns: { md: 'repeat(3, 1fr)' } }}>
            {PASOS.map((paso) => (
              <Card key={paso.numero} sx={{ p: 3 }}>
                <Box sx={{ width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: '#0d6945', color: '#ffffff', fontSize: 14, fontWeight: 800 }}>
                  {paso.numero}
                </Box>
                <Typography sx={{ mt: 2, fontSize: 15, fontWeight: 700 }}>{paso.titulo}</Typography>
                <Typography sx={{ mt: 1, fontSize: 14, color: '#475569' }}>{paso.descripcion}</Typography>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Módulos */}
      <Box component="section" id="modulos" sx={{ bgcolor: '#ffffff', py: { xs: 8, lg: 10 } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
          <Box sx={{ maxWidth: 640 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#0d6945' }}>
              Dos plataformas
            </Typography>
            <Typography component="h2" sx={{ mt: 1.5, fontSize: { xs: 26, sm: 32 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
              La app registra, la web analiza
            </Typography>
          </Box>

          <Box sx={{ mt: 5, display: 'grid', gap: 3, gridTemplateColumns: { lg: '1fr 1fr' } }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: '#eff6ff', color: '#2563eb' }}>
                  <Icon name="mobile" size={22} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 700 }}>App móvil</Typography>
                  <Typography sx={{ fontSize: 12, color: '#64748b' }}>Registro rápido en campo</Typography>
                </Box>
              </Box>
              <Box component="ul" sx={{ mt: 2.5, p: 0, m: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {MODULOS_MOVIL.map((item) => (
                  <Box component="li" key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, fontSize: 14, color: '#334155' }}>
                    <Box sx={{ mt: 0.25, color: '#108354' }}>
                      <Icon name="check" size={16} />
                    </Box>
                    {item}
                  </Box>
                ))}
              </Box>
            </Card>

            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: '#f5f3ff', color: '#7c3aed' }}>
                  <Icon name="chart" size={22} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Panel web</Typography>
                  <Typography sx={{ fontSize: 12, color: '#64748b' }}>Centro de control analítico</Typography>
                </Box>
              </Box>
              <Box component="ul" sx={{ mt: 2.5, p: 0, m: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {MODULOS_WEB.map((item) => (
                  <Box component="li" key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, fontSize: 14, color: '#334155' }}>
                    <Box sx={{ mt: 0.25, color: '#108354' }}>
                      <Icon name="check" size={16} />
                    </Box>
                    {item}
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Testimonios */}
      <Box component="section" sx={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc', py: { xs: 8, lg: 10 } }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
          <Box sx={{ maxWidth: 640 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#0d6945' }}>
              Testimonios
            </Typography>
            <Typography component="h2" sx={{ mt: 1.5, fontSize: { xs: 26, sm: 32 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Equipos que ya dividen cuentas sin discutir
            </Typography>
          </Box>

          <Box sx={{ mt: 5, display: 'grid', gap: 2.5, gridTemplateColumns: { md: 'repeat(3, 1fr)' } }}>
            {TESTIMONIOS.map((testimonio) => (
              <Card key={testimonio.nombre} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 0.5, color: '#f59e0b' }}>
                  {[1, 2, 3, 4, 5].map((estrella) => (
                    <Icon key={estrella} name="star" size={16} />
                  ))}
                </Box>
                <Typography sx={{ mt: 2, fontSize: 14, color: '#334155' }}>“{testimonio.texto}”</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{testimonio.nombre}</Typography>
                <Typography sx={{ fontSize: 12, color: '#64748b' }}>{testimonio.rol}</Typography>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      {/* CTA */}
      <Box component="section" sx={{ bgcolor: '#0f172a', py: { xs: 8, lg: 10 } }}>
        <Box sx={{ maxWidth: 896, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, textAlign: 'center' }}>
          <Typography component="h2" sx={{ fontSize: { xs: 26, sm: 32 }, fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Empieza a organizar tus finanzas compartidas hoy
          </Typography>
          <Typography sx={{ maxWidth: 640, mx: 'auto', mt: 2, color: '#cbd5e1' }}>
            Crea tu cartera, invita a los participantes con un código QR y registra el primer movimiento en menos de
            un minuto.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
            <Button component={Link} to="/registro" variant="contained" size="large" endIcon={<Icon name="chevron-right" size={16} />} sx={{ px: 3 }}>
              Crear cuenta gratis
            </Button>
            <Button component={Link} to="/login" variant="outlined" size="large" sx={{ px: 3, borderColor: '#334155', color: '#f1f5f9', '&:hover': { bgcolor: '#1e293b', borderColor: '#334155' } }}>
              Entrar a la demo
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ borderTop: '1px solid #e2e8f0', bgcolor: '#ffffff', py: 5 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, alignItems: { lg: 'center' }, justifyContent: 'space-between', px: { xs: 2, sm: 3, lg: 4 } }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2.5, bgcolor: '#0d6945', color: '#ffffff', fontSize: 12, fontWeight: 800 }}>
                F
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 800 }}>FinanzApp</Typography>
            </Box>
            <Typography sx={{ mt: 1.5, maxWidth: 380, fontSize: 12, color: '#64748b' }}>
              Proyecto integrador de la Universidad Tecnológica de León · Ingeniería en Desarrollo y Gestión de
              Software · Grupo IDGS1002.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, fontSize: 12, fontWeight: 500, color: '#64748b' }}>
            <Box component={Link} to="/login" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: '#0f172a' } }}>Iniciar sesión</Box>
            <Box component={Link} to="/registro" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: '#0f172a' } }}>Crear cuenta</Box>
            <Box component="a" href="#caracteristicas" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: '#0f172a' } }}>Características</Box>
            <Box component="a" href="#modulos" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: '#0f172a' } }}>Plataformas</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
