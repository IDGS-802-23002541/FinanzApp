import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import type { Transaccion } from '../types/models';
import { useAuthUsuario, useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { moneda, nombreCompleto } from '../utils/format';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/ui';
import { TransaccionForm } from '../pages/carteras/TransaccionForm';

interface Enlace {
  etiqueta: string;
  ruta: string;
  icono: string;
}

const GRUPOS: { nombre: string; enlaces: Enlace[] }[] = [
  {
    nombre: 'Principal',
    enlaces: [
      { etiqueta: 'Carteras', ruta: '/app/carteras', icono: 'wallet' },
      { etiqueta: 'Transacciones', ruta: '/app/transacciones', icono: 'receipt' },
    ],
  },
  {
    nombre: 'Colaboración',
    enlaces: [
      { etiqueta: 'Contribuyentes', ruta: '/app/contribuyentes', icono: 'users' },
      { etiqueta: 'Carteras inactivas', ruta: '/app/inactivas', icono: 'archive' },
    ],
  },
  {
    nombre: 'Cuenta',
    enlaces: [{ etiqueta: 'Ajustes', ruta: '/app/ajustes', icono: 'settings' }],
  },
];

const ENLACES_MOVILES: Enlace[] = [
  { etiqueta: 'Carteras', ruta: '/app/carteras', icono: 'wallet' },
  { etiqueta: 'Movimientos', ruta: '/app/transacciones', icono: 'receipt' },
  { etiqueta: 'Personas', ruta: '/app/contribuyentes', icono: 'users' },
  { etiqueta: 'Inactivas', ruta: '/app/inactivas', icono: 'archive' },
  { etiqueta: 'Ajustes', ruta: '/app/ajustes', icono: 'settings' },
];

function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 3,
          bgcolor: claro ? '#ffffff' : '#0d6945',
          color: claro ? '#0d5439' : '#ffffff',
          fontSize: 14,
          fontWeight: 800,
        }}
      >
        F
      </Box>
      <Typography sx={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em', color: claro ? '#ffffff' : '#0f172a' }}>
        Finanz<span style={{ color: claro ? '#d3f5e1' : '#0d6945' }}>App</span>
      </Typography>
    </Box>
  );
}

function Navegacion({ onNavegar }: { onNavegar?: () => void }) {
  return (
    <Box component="nav" sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1 }}>
      {GRUPOS.map((grupo) => (
        <Box key={grupo.nombre} sx={{ mb: 3 }}>
          <Typography
            sx={{
              px: 1.75,
              pb: 1,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#94a3b8',
            }}
          >
            {grupo.nombre}
          </Typography>
          {grupo.enlaces.map((enlace) => (
            <ListItemButton
              key={enlace.ruta}
              component={NavLink}
              to={enlace.ruta}
              onClick={onNavegar}
              sx={{
                borderRadius: 3,
                px: 1.75,
                py: 1.25,
                mb: 0.5,
                gap: 1.5,
                fontSize: 14,
                fontWeight: 600,
                color: '#475569',
                '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
                '&.active': { bgcolor: '#edfbf3', color: '#0d5439' },
              }}
            >
              <Icon name={enlace.icono} size={19} />
              <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {enlace.etiqueta}
              </Box>
            </ListItemButton>
          ))}
        </Box>
      ))}
    </Box>
  );
}

export function Shell() {
  const usuario = useAuthUsuario();
  const salirStore = useAuthStore((s) => s.salir);
  const mostrarToast = useToastStore((s) => s.mostrar);
  const navigate = useNavigate();
  const location = useLocation();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [formAbierto, setFormAbierto] = useState(false);

  const enDetalleDeCartera = /^\/app\/carteras\/\d+/.test(location.pathname);

  const salir = () => {
    salirStore();
    mostrarToast('Cerraste sesión correctamente.', 'info');
    setMenuAbierto(false);
    navigate('/');
  };

  const alRegistrar = (movimiento: Transaccion) => {
    setFormAbierto(false);
    mostrarToast(`Movimiento de ${moneda(movimiento.monto)} registrado correctamente.`);
  };

  const panelUsuario = (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar usuario={usuario} tamano="md" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {usuario?.nombreUsuario}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {usuario?.correo}
          </Typography>
        </Box>
      </Box>
      <Button
        onClick={salir}
        startIcon={<Icon name="logout" size={16} />}
        sx={{ mt: 1.5, width: '100%', justifyContent: 'flex-start', color: '#475569', '&:hover': { bgcolor: '#f1f5f9' } }}
      >
        Cerrar sesión
      </Button>
    </>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex' }}>
      {/* Sidebar escritorio */}
      <Box
        component="aside"
        className="no-print"
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: 256,
          flexShrink: 0,
          flexDirection: 'column',
          borderRight: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <Box sx={{ px: 2.5, py: 2.5 }}>
          <NavLink to="/app/carteras" style={{ textDecoration: 'none' }}>
            <Logo />
          </NavLink>
        </Box>
        <Navegacion />
        <Box sx={{ borderTop: '1px solid #f1f5f9', p: 2 }}>{panelUsuario}</Box>
      </Box>

      {/* Drawer móvil */}
      <Drawer
        open={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        slotProps={{ paper: { sx: { width: 288, maxWidth: '85%' } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2.5 }}>
          <Logo />
          <IconButton onClick={() => setMenuAbierto(false)} aria-label="Cerrar menú" size="small" sx={{ color: '#94a3b8' }}>
            <Icon name="close" size={18} />
          </IconButton>
        </Box>
        <Navegacion onNavegar={() => setMenuAbierto(false)} />
        <Box sx={{ borderTop: '1px solid #f1f5f9', p: 2 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.25 }}>{nombreCompleto(usuario)}</Typography>
          <Typography sx={{ fontSize: 12, color: '#64748b' }}>{usuario?.correo}</Typography>
          <Button
            onClick={salir}
            startIcon={<Icon name="logout" size={16} />}
            sx={{ mt: 1.5, width: '100%', justifyContent: 'flex-start', color: '#475569', '&:hover': { bgcolor: '#f1f5f9' } }}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Drawer>

      {/* Contenido */}
      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar
          className="no-print"
          position="sticky"
          elevation={0}
          sx={{
            display: { xs: 'flex', lg: 'none' },
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            color: '#0f172a',
            borderBottom: '1px solid #e2e8f0',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', gap: 1.5, minHeight: 56 }}>
            <IconButton edge="start" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú" sx={{ color: '#475569' }}>
              <Icon name="menu" size={20} />
            </IconButton>
            <NavLink to="/app/carteras" style={{ textDecoration: 'none' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                Finanz<span style={{ color: '#0d6945' }}>App</span>
              </Typography>
            </NavLink>
            <Avatar usuario={usuario} tamano="sm" />
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ minWidth: 0, flex: 1, px: { xs: 2, lg: 4 }, py: { xs: 3, lg: 4 }, pb: { xs: 14, lg: 5 } }}>
          <Outlet />
        </Box>
      </Box>

      {/* FAB registrar movimiento */}
      {!enDetalleDeCartera && (
        <Fab
          className="no-print"
          color="primary"
          aria-label="Registrar movimiento"
          onClick={() => setFormAbierto(true)}
          sx={{
            display: { xs: 'flex', lg: 'none' },
            position: 'fixed',
            right: 16,
            bottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
            zIndex: 30,
            bgcolor: '#0d6945',
            '&:hover': { bgcolor: '#0b4530' },
            borderRadius: 4,
          }}
        >
          <Icon name="plus" size={24} />
        </Fab>
      )}

      {/* Navegación inferior móvil */}
      <Box
        className="no-print"
        component="nav"
        sx={{
          display: { xs: 'block', lg: 'none' },
          position: 'fixed',
          insetInline: 0,
          bottom: 0,
          zIndex: 30,
          borderTop: '1px solid #e2e8f0',
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {ENLACES_MOVILES.map((enlace) => (
            <Box
              key={enlace.ruta}
              component={NavLink}
              to={enlace.ruta}
              sx={{
                display: 'flex',
                minWidth: 0,
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                px: 0.25,
                py: 1.5,
                color: '#64748b',
                textDecoration: 'none',
                transition: 'color 0.2s',
                '&.active': { color: '#0d6945' },
              }}
            >
              <Icon name={enlace.icono} size={20} />
              <Box
                component="span"
                sx={{ width: '100%', textAlign: 'center', fontSize: 10, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {enlace.etiqueta}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <TransaccionForm
        abierto={formAbierto}
        transaccion={null}
        onCerrar={() => setFormAbierto(false)}
        onGuardado={alRegistrar}
      />
    </Box>
  );
}
