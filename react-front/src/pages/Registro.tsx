import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { Icon } from '../components/Icon';

const DATOS = [
  { valor: '7', etiqueta: 'Carteras en la demo' },
  { valor: '3', etiqueta: 'Tipos de categoría' },
  { valor: '0$', etiqueta: 'Costo de uso' },
  { valor: '100%', etiqueta: 'Datos locales' },
];

interface Campos {
  nombreUsuario: string;
  APaterno: string;
  AMaterno: string;
  correo: string;
  telefono: string;
  contrasena: string;
  confirmar: string;
}

const CAMPOS_VACIOS: Campos = {
  nombreUsuario: '',
  APaterno: '',
  AMaterno: '',
  correo: '',
  telefono: '',
  contrasena: '',
  confirmar: '',
};

export default function Registro() {
  const auth = useAuthStore.getState();
  const mostrarToast = useToastStore((s) => s.mostrar);
  const navigate = useNavigate();

  const [campos, setCampos] = useState<Campos>(CAMPOS_VACIOS);
  const [terminos, setTerminos] = useState(false);
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const set = (campo: keyof Campos) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCampos((c) => ({ ...c, [campo]: e.target.value }));
  const marcar = (campo: string) => () => setTocados((t) => ({ ...t, [campo]: true }));

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.correo);
  const confirmanIgual = campos.contrasena === campos.confirmar;
  const invalido = (campo: string) => Boolean(tocados[campo]);

  const enviar = () => {
    setError('');
    setTocados({ nombreUsuario: true, APaterno: true, correo: true, contrasena: true, confirmar: true, terminos: true });

    if (!campos.nombreUsuario.trim() || !campos.APaterno.trim() || !correoValido || campos.contrasena.length < 6 || !confirmanIgual || !terminos) {
      if (!confirmanIgual && campos.confirmar) setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    setTimeout(() => {
      const resultado = auth.registrar({
        nombreUsuario: campos.nombreUsuario.trim(),
        APaterno: campos.APaterno.trim(),
        AMaterno: campos.AMaterno.trim(),
        correo: campos.correo.trim(),
        contrasena: campos.contrasena,
        telefono: campos.telefono.trim(),
      });
      setCargando(false);
      if (!resultado.ok) {
        setError(resultado.mensaje);
        return;
      }
      mostrarToast('¡Bienvenido a FinanzApp! Tu cuenta quedó lista.');
      navigate('/app/carteras');
    }, 500);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Panel de marca */}
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
          <Box sx={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, bgcolor: '#ffffff', color: '#0d5439', fontSize: 14, fontWeight: 800 }}>
            F
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>FinanzApp</Typography>
        </Box>

        <Box>
          <Typography sx={{ fontSize: 30, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', maxWidth: 480 }}>
            Crea tu primera cartera en minutos
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 440, fontSize: 14, color: '#d3f5e1' }}>
            Registra tu cuenta, define el presupuesto inicial y comparte el código QR con los participantes. No
            necesitas tarjeta ni instalar nada.
          </Typography>
          <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, maxWidth: 440 }}>
            {DATOS.map((dato) => (
              <Box key={dato.etiqueta} sx={{ borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(255,255,255,0.05)', p: 2 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>{dato.valor}</Typography>
                <Typography sx={{ mt: 0.5, fontSize: 12, color: '#d3f5e1' }}>{dato.etiqueta}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Typography sx={{ fontSize: 12, color: '#a9eac6' }}>
          Datos de demostración almacenados localmente en el navegador.
        </Typography>
      </Box>

      {/* Formulario */}
      <Box sx={{ display: 'flex', width: { xs: '100%', lg: '50%' }, alignItems: 'center', justifyContent: 'center', px: { xs: 2, sm: 4 }, py: 5 }}>
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          <Box
            component={Link}
            to="/"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none', '&:hover': { color: '#0f172a' } }}
          >
            <Icon name="arrow-left" size={16} />
            Volver al inicio
          </Box>

          <Typography component="h1" sx={{ mt: 4, fontSize: { xs: 24, sm: 28 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Crea tu cuenta
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: '#64748b' }}>Completa tus datos para comenzar a usar FinanzApp.</Typography>

          <Box
            component="form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
            sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                id="nombre"
                label="Nombre"
                placeholder="Diego Yair"
                value={campos.nombreUsuario}
                onChange={set('nombreUsuario')}
                onBlur={marcar('nombreUsuario')}
                error={invalido('nombreUsuario') && !campos.nombreUsuario.trim()}
                helperText={invalido('nombreUsuario') && !campos.nombreUsuario.trim() ? 'Escribe tu nombre.' : ' '}
              />
              <TextField
                id="telefono"
                label="Teléfono"
                type="tel"
                placeholder="477 000 0000"
                value={campos.telefono}
                onChange={set('telefono')}
              />
            </Box>

            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                id="paterno"
                label="Apellido paterno"
                placeholder="Borja"
                value={campos.APaterno}
                onChange={set('APaterno')}
                onBlur={marcar('APaterno')}
                error={invalido('APaterno') && !campos.APaterno.trim()}
                helperText={invalido('APaterno') && !campos.APaterno.trim() ? 'Escribe tu apellido paterno.' : ' '}
              />
              <TextField id="materno" label="Apellido materno" placeholder="Romero" value={campos.AMaterno} onChange={set('AMaterno')} />
            </Box>

            <TextField
              id="correo"
              label="Correo electrónico"
              type="email"
              placeholder="tucorreo@finanzapp.mx"
              value={campos.correo}
              onChange={set('correo')}
              onBlur={marcar('correo')}
              error={invalido('correo') && !correoValido}
              helperText={invalido('correo') && !correoValido ? 'Ingresa un correo electrónico válido.' : ' '}
            />

            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <TextField
                id="contrasena"
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={campos.contrasena}
                onChange={set('contrasena')}
                onBlur={marcar('contrasena')}
                error={invalido('contrasena') && campos.contrasena.length < 6}
                helperText={invalido('contrasena') && campos.contrasena.length < 6 ? 'Mínimo 6 caracteres.' : ' '}
              />
              <TextField
                id="confirmar"
                label="Confirmar contraseña"
                type="password"
                placeholder="••••••••"
                value={campos.confirmar}
                onChange={set('confirmar')}
                onBlur={marcar('confirmar')}
                error={invalido('confirmar') && !confirmanIgual}
                helperText={invalido('confirmar') && !confirmanIgual ? 'Las contraseñas no coinciden.' : ' '}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={terminos}
                  onChange={(e) => setTerminos(e.target.checked)}
                  sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#108354' } }}
                />
              }
              label={
                <Typography sx={{ fontSize: 14, color: '#475569' }}>
                  Acepto el uso de mis datos para fines académicos y de demostración de este proyecto integrador.
                </Typography>
              }
            />
            {invalido('terminos') && !terminos && (
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#e11d48', mt: -2 }}>
                Confirma que aceptas los términos para continuar.
              </Typography>
            )}

            {error && (
              <Alert severity="error" icon={<Icon name="alert" size={18} />} sx={{ borderRadius: 3 }}>
                {error}
              </Alert>
            )}

            <Button type="submit" variant="contained" size="large" disabled={cargando} sx={{ py: 1.5 }}>
              {cargando ? 'Creando cuenta…' : 'Crear mi cuenta'}
              {!cargando && <Icon name="chevron-right" size={16} style={{ marginLeft: 8 }} />}
            </Button>
          </Box>

          <Typography sx={{ mt: 3, textAlign: 'center', fontSize: 14, color: '#64748b' }}>
            ¿Ya tienes una cuenta?{' '}
            <Box component={Link} to="/login" sx={{ fontWeight: 700, color: '#0d6945', textDecoration: 'none', '&:hover': { color: '#0d5439' } }}>
              Inicia sesión
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
