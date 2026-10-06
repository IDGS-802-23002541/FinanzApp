import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuthStore, useAuthUsuario } from '../stores/auth';
import { useUsuariosStore } from '../stores/usuarios';
import { useToastStore } from '../stores/toast';
import { Icon } from '../components/Icon';
import { Avatar, ConfirmModal, PageHeader } from '../components/ui';

const CLAVE_PREFERENCIAS = 'finanzapp.preferencias';

interface Preferencias {
  presupuesto80: boolean;
  resumenSemanal: boolean;
  push: boolean;
}

const PREFERENCIAS_INICIALES: Preferencias = { presupuesto80: true, resumenSemanal: false, push: false };

function leerPreferencias(): Preferencias {
  try {
    const crudo = localStorage.getItem(CLAVE_PREFERENCIAS);
    return crudo ? { ...PREFERENCIAS_INICIALES, ...JSON.parse(crudo) } : PREFERENCIAS_INICIALES;
  } catch {
    return PREFERENCIAS_INICIALES;
  }
}

export default function Ajustes() {
  const usuario = useAuthUsuario();
  const mostrarToast = useToastStore((s) => s.mostrar);
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [APaterno, setAPaterno] = useState('');
  const [AMaterno, setAMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [preferencias, setPreferencias] = useState<Preferencias>(PREFERENCIAS_INICIALES);

  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');
  const [errorPerfil, setErrorPerfil] = useState('');
  const [confirmarSalida, setConfirmarSalida] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNombreUsuario(usuario.nombreUsuario);
      setAPaterno(usuario.APaterno);
      setAMaterno(usuario.AMaterno);
      setCorreo(usuario.correo);
      setTelefono(usuario.telefono);
    }
  }, [usuario]);

  useEffect(() => {
    setPreferencias(leerPreferencias());
  }, []);

  const guardarPerfil = () => {
    setErrorPerfil('');
    if (!nombreUsuario.trim() || !APaterno.trim() || !correo.trim()) {
      setErrorPerfil('Nombre, apellido paterno y correo son obligatorios.');
      return;
    }
    const duplicado = useUsuariosStore
      .getState()
      .usuarios.some((u) => u.idUsuario !== usuario?.idUsuario && u.correo.toLowerCase() === correo.trim().toLowerCase());
    if (duplicado) {
      setErrorPerfil('Ese correo ya está en uso por otra cuenta.');
      return;
    }
    useAuthStore.getState().actualizar({
      nombreUsuario: nombreUsuario.trim(),
      APaterno: APaterno.trim(),
      AMaterno: AMaterno.trim(),
      correo: correo.trim(),
      telefono: telefono.trim(),
    });
    mostrarToast('Perfil actualizado correctamente.');
  };

  const cambiarContrasena = () => {
    setErrorContrasena('');
    if (!usuario) return;
    if (contrasenaActual !== usuario.contrasena) {
      setErrorContrasena('La contraseña actual es incorrecta.');
      return;
    }
    if (contrasenaNueva.length < 6) {
      setErrorContrasena('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (contrasenaNueva !== confirmarContrasena) {
      setErrorContrasena('Las contraseñas no coinciden.');
      return;
    }
    useUsuariosStore.getState().actualizar(usuario.idUsuario, { contrasena: contrasenaNueva });
    setContrasenaActual('');
    setContrasenaNueva('');
    setConfirmarContrasena('');
    mostrarToast('Contraseña actualizada; se aplicará en tu próximo inicio de sesión.');
  };

  const cambiarPreferencia = (clave: keyof Preferencias, valor: boolean) => {
    const siguientes = { ...preferencias, [clave]: valor };
    setPreferencias(siguientes);
    try {
      localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(siguientes));
    } catch {
      /* almacenamiento no disponible */
    }
  };

  const cerrarSesion = () => {
    useAuthStore.getState().salir();
    mostrarToast('Cerraste sesión correctamente.', 'info');
    navigate('/');
  };

  return (
    <Box>
      <PageHeader titulo="Ajustes" descripcion="Actualiza tus datos, tu contraseña y tus preferencias de la cuenta." />

      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { lg: '1fr 1fr' }, alignItems: 'start' }}>
        {/* Perfil */}
        <Card sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar usuario={usuario} tamano="md" />
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Perfil</Typography>
              <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>Tu nombre y contacto se reflejan en toda la app.</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: '1fr 1fr' } }}>
            <TextField id="nombreUsuario" label="Nombre" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} />
            <TextField id="APaterno" label="Apellido paterno" value={APaterno} onChange={(e) => setAPaterno(e.target.value)} />
            <TextField id="AMaterno" label="Apellido materno" value={AMaterno} onChange={(e) => setAMaterno(e.target.value)} />
            <TextField id="telefono" label="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField id="correo" label="Correo electrónico" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} fullWidth error={Boolean(errorPerfil)} />
          </Box>

          {errorPerfil && (
            <Typography sx={{ mt: 1.5, fontSize: 12.5, fontWeight: 600, color: '#e11d48' }}>{errorPerfil}</Typography>
          )}

          <Button variant="contained" sx={{ mt: 2.5 }} startIcon={<Icon name="check" size={16} />} onClick={guardarPerfil}>
            Guardar cambios
          </Button>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Seguridad */}
          <Card sx={{ p: 2.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Seguridad</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 12.5, color: '#64748b' }}>La contraseña se pide para confirmar que eres tú.</Typography>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField id="actual" label="Contraseña actual" type="password" value={contrasenaActual} onChange={(e) => setContrasenaActual(e.target.value)} />
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: '1fr 1fr' } }}>
                <TextField id="nueva" label="Nueva contraseña" type="password" value={contrasenaNueva} onChange={(e) => setContrasenaNueva(e.target.value)} />
                <TextField id="confirmar" label="Confirmar contraseña" type="password" value={confirmarContrasena} onChange={(e) => setConfirmarContrasena(e.target.value)} />
              </Box>
            </Box>

            {errorContrasena && (
              <Typography sx={{ mt: 1.5, fontSize: 12.5, fontWeight: 600, color: '#e11d48' }}>{errorContrasena}</Typography>
            )}

            <Button variant="outlined" color="inherit" sx={{ mt: 2.5, borderColor: '#cbd5e1', color: '#334155' }} startIcon={<Icon name="lock" size={16} />} onClick={cambiarContrasena}>
              Cambiar contraseña
            </Button>
          </Card>

          {/* Preferencias */}
          <Card sx={{ p: 2.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Preferencias</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 12.5, color: '#64748b' }}>Se guardan en este dispositivo para la demo.</Typography>

            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column' }}>
              <FormControlLabel
                control={<Switch checked={preferencias.presupuesto80} onChange={(e) => cambiarPreferencia('presupuesto80', e.target.checked)} slotProps={{ input: { role: 'switch', 'aria-checked': preferencias.presupuesto80 } }} />}
                label={<Typography sx={{ fontSize: 14 }}>Avisarme cuando el presupuesto llegue al 80 %</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={preferencias.resumenSemanal} onChange={(e) => cambiarPreferencia('resumenSemanal', e.target.checked)} slotProps={{ input: { role: 'switch', 'aria-checked': preferencias.resumenSemanal } }} />}
                label={<Typography sx={{ fontSize: 14 }}>Recibir un resumen semanal de mis carteras</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={preferencias.push} onChange={(e) => cambiarPreferencia('push', e.target.checked)} slotProps={{ input: { role: 'switch', 'aria-checked': preferencias.push } }} />}
                label={
                  <Typography sx={{ fontSize: 14 }}>
                    Notificaciones push <Box component="span" sx={{ color: '#94a3b8' }}>(fase 2)</Box>
                  </Typography>
                }
              />
            </Box>
          </Card>

          {/* Sesión */}
          <Card sx={{ p: 2.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Sesión</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 12.5, color: '#64748b' }}>
              Cierra sesión de forma segura, sobre todo si usas un dispositivo prestado.
            </Typography>
            <Button variant="outlined" color="error" sx={{ mt: 2 }} startIcon={<Icon name="logout" size={16} />} onClick={() => setConfirmarSalida(true)}>
              Cerrar sesión
            </Button>
          </Card>
        </Box>
      </Box>

      <ConfirmModal
        abierto={confirmarSalida}
        titulo="Cerrar sesión"
        mensaje="Se cerrará tu sesión en este dispositivo y volverás a la página de inicio."
        textoConfirmar="Cerrar sesión"
        onConfirmar={cerrarSesion}
        onCerrar={() => setConfirmarSalida(false)}
      />
    </Box>
  );
}
