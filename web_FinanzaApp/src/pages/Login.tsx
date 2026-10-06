import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { Icon } from '../components/Icon';

const BENEFICIOS = [
  'Carteras ilimitadas para hogar, viajes y eventos',
  'Invitaciones con código QR y clave única',
  'Estadísticas de gasto por categoría y por mes',
  'Cierre de cartera con balance y liquidación sugerida',
];

export default function Login() {
  const auth = useAuthStore.getState();
  const mostrarToast = useToastStore((s) => s.mostrar);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [tocadoCorreo, setTocadoCorreo] = useState(false);
  const [tocadoContrasena, setTocadoContrasena] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const correoInvalido = tocadoCorreo && !correoValido;
  const contrasenaInvalida = tocadoContrasena && contrasena.length < 6;

  const entrar = (correoDemo?: string, contrasenaDemo?: string) => {
    const c = correoDemo ?? correo;
    const p = contrasenaDemo ?? contrasena;
    setError('');

    if (!correoDemo && (!correoValido || contrasena.length < 6)) {
      setTocadoCorreo(true);
      setTocadoContrasena(true);
      return;
    }

    setCargando(true);
    setTimeout(() => {
      const resultado = auth.login(c, p);
      setCargando(false);
      if (!resultado.ok) {
        setError(resultado.mensaje);
        return;
      }
      mostrarToast(resultado.mensaje);
      const destino = params.get('destino') ?? '/app/carteras';
      navigate(destino);
    }, 400);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Panel de marca (escritorio) */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: '50%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          background: 'linear-gradient(135deg, #0b4530 0%, #0d5439 35%, #0f172a 100%)',
        }}
      >
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, textDecoration: 'none' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              bgcolor: '#ffffff',
              color: '#0d5439',
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            F
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>FinanzApp</Typography>
        </Box>

        <Box>
          <Typography sx={{ fontSize: 30, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', maxWidth: 480 }}>
            Las cuentas claras también se ven bien
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 440, fontSize: 14, color: '#d3f5e1' }}>
            Administra las carteras del hogar, tus viajes y los eventos del grupo con estadísticas en vivo y un
            cierre financiero automático.
          </Typography>
          <Box component="ul" sx={{ mt: 4, p: 0, m: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {BENEFICIOS.map((beneficio) => (
              <Box key={beneficio} component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, fontSize: 14, color: '#edfbf3' }}>
                <Box
                  sx={{
                    mt: 0.25,
                    width: 20,
                    height: 20,
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  <Icon name="check" size={13} />
                </Box>
                {beneficio}
              </Box>
            ))}
          </Box>
        </Box>

        <Typography sx={{ fontSize: 12, color: '#a9eac6' }}>
          Proyecto integrador · Universidad Tecnológica de León · IDGS1002
        </Typography>
      </Box>

      {/* Formulario */}
      <Box sx={{ display: 'flex', width: { xs: '100%', lg: '50%' }, alignItems: 'center', justifyContent: 'center', px: { xs: 2, sm: 4 }, py: 5 }}>
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Box
            component={Link}
            to="/"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none', '&:hover': { color: '#0f172a' } }}
          >
            <Icon name="arrow-left" size={16} />
            Volver al inicio
          </Box>

          <Box sx={{ mt: 4, display: { lg: 'none' } }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
                bgcolor: '#0d6945',
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              F
            </Box>
          </Box>

          <Typography component="h1" sx={{ mt: 3, fontSize: { xs: 24, sm: 28 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Inicia sesión
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: '#64748b' }}>
            Accede al panel web para consultar tus carteras, estadísticas y balances.
          </Typography>

          <Box
            component="form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              entrar();
            }}
            sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <TextField
              id="correo"
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              placeholder="tucorreo@finanzapp.mx"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              onBlur={() => setTocadoCorreo(true)}
              error={correoInvalido}
              helperText={correoInvalido ? 'Ingresa un correo electrónico válido.' : ' '}
            />

            <TextField
              id="contrasena"
              label="Contraseña"
              type={verContrasena ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              onBlur={() => setTocadoContrasena(true)}
              error={contrasenaInvalida}
              helperText={contrasenaInvalida ? 'La contraseña debe tener al menos 6 caracteres.' : ' '}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setVerContrasena((v) => !v)}
                        aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        edge="end"
                      >
                        <Icon name={verContrasena ? 'eye-off' : 'eye'} size={18} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {error && (
              <Alert severity="error" icon={<Icon name="alert" size={18} />} sx={{ borderRadius: 3 }}>
                {error}
              </Alert>
            )}

            <Button type="submit" variant="contained" size="large" disabled={cargando} sx={{ py: 1.5 }}>
              {cargando ? 'Validando…' : 'Entrar al panel'}
              {!cargando && <Icon name="chevron-right" size={16} style={{ marginLeft: 8 }} />}
            </Button>
          </Box>

          <Card sx={{ mt: 3, border: '1px dashed #74d8a5', bgcolor: 'rgba(237,251,243,0.6)', boxShadow: 'none', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ mt: 0.25, color: '#0d6945' }}>
                <Icon name="sparkles" size={18} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Cuenta demo</Typography>
                <Typography sx={{ mt: 0.5, fontSize: 12, color: '#475569' }}>
                  Correo <strong>diego@finanzapp.mx</strong> · Contraseña <strong>demo123</strong>
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1.5, borderColor: '#cbd5e1', color: '#334155' }}
                  onClick={() => entrar('diego@finanzapp.mx', 'demo123')}
                  startIcon={<Icon name="eye" size={14} />}
                >
                  Entrar con la cuenta demo
                </Button>
              </Box>
            </Box>
          </Card>

          <Typography sx={{ mt: 3, textAlign: 'center', fontSize: 14, color: '#64748b' }}>
            ¿Aún no tienes cuenta?{' '}
            <Box component={Link} to="/registro" sx={{ fontWeight: 700, color: '#0d6945', textDecoration: 'none', '&:hover': { color: '#0d5439' } }}>
              Regístrate gratis
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
