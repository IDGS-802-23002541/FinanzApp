import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useToastStore, useToasts, type TipoToast } from '../stores/toast';
import { Icon } from './Icon';

const ESTILOS: Record<TipoToast, { borde: string; fondo: string; colorIcono: string; icono: string }> = {
  exito: { borde: '#a9eac6', fondo: 'rgba(237, 251, 243, 0.95)', colorIcono: '#0d6945', icono: 'check' },
  error: { borde: '#fecdd3', fondo: 'rgba(255, 241, 242, 0.95)', colorIcono: '#e11d48', icono: 'alert' },
  info: { borde: '#e2e8f0', fondo: 'rgba(255, 255, 255, 0.95)', colorIcono: '#475569', icono: 'alert' },
};

export function ToastHost() {
  const toasts = useToasts();
  const cerrar = useToastStore((s) => s.cerrar);

  return (
    <Box
      sx={{
        pointerEvents: 'none',
        position: 'fixed',
        insetInline: 0,
        bottom: { xs: 80, sm: 24 },
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: { xs: 'center', sm: 'flex-end' },
        gap: 1,
        px: { xs: 2, sm: 3 },
      }}
    >
      {toasts.map((toast) => {
        const estilo = ESTILOS[toast.tipo];
        return (
          <Box
            key={toast.id}
            className="animate-elevar"
            sx={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              width: '100%',
              maxWidth: 384,
              borderRadius: 4,
              border: `1px solid ${estilo.borde}`,
              bgcolor: estilo.fondo,
              px: 2,
              py: 1.5,
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box sx={{ mt: 0.25, color: estilo.colorIcono }}>
              <Icon name={estilo.icono} size={18} />
            </Box>
            <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{toast.texto}</Typography>
            <IconButton
              size="small"
              onClick={() => cerrar(toast.id)}
              aria-label="Cerrar notificación"
              sx={{ color: '#94a3b8', '&:hover': { color: '#334155', bgcolor: 'rgba(255,255,255,0.6)' } }}
            >
              <Icon name="close" size={14} />
            </IconButton>
          </Box>
        );
      })}
    </Box>
  );
}
