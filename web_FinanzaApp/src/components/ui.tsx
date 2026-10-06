import type { ReactNode } from 'react';
import AvatarMui from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { Usuario } from '../types/models';
import { iniciales, moneda, monedaCompacta, nombreCompleto } from '../utils/format';
import { Icon } from './Icon';

/* ------------------------------- Avatar -------------------------------- */

const MEDIDAS: Record<string, { px: number; fuente: number }> = {
  xs: { px: 24, fuente: 10 },
  sm: { px: 36, fuente: 12 },
  md: { px: 44, fuente: 14 },
  lg: { px: 64, fuente: 18 },
};

export interface AvatarProps {
  usuario: Usuario | null | undefined;
  tamano?: 'xs' | 'sm' | 'md' | 'lg';
}

export function Avatar({ usuario, tamano = 'md' }: AvatarProps) {
  const medida = MEDIDAS[tamano] ?? MEDIDAS.md;
  return (
    <AvatarMui
      title={nombreCompleto(usuario)}
      sx={{
        width: medida.px,
        height: medida.px,
        fontSize: medida.fuente,
        fontWeight: 700,
        bgcolor: usuario?.color ?? '#94a3b8',
        border: '2px solid #ffffff',
      }}
    >
      {iniciales(usuario)}
    </AvatarMui>
  );
}

export interface AvatarStackProps {
  usuarios: Usuario[];
  limite?: number;
}

export function AvatarStack({ usuarios, limite = 4 }: AvatarStackProps) {
  const visibles = usuarios.slice(0, limite);
  const restantes = Math.max(0, usuarios.length - limite);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {visibles.map((u, i) => (
        <Box key={u.idUsuario} sx={{ ml: i === 0 ? 0 : '-8px', zIndex: visibles.length - i }}>
          <Avatar usuario={u} tamano="sm" />
        </Box>
      ))}
      {restantes > 0 && (
        <Box
          sx={{
            ml: '-8px',
            zIndex: 0,
            height: 36,
            px: 1.25,
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 999,
            bgcolor: '#f1f5f9',
            color: '#475569',
            fontSize: 12,
            fontWeight: 700,
            border: '2px solid #ffffff',
          }}
        >
          +{restantes}
        </Box>
      )}
    </Box>
  );
}

/* ------------------------------- StatCard ------------------------------- */

export type Tono = 'brand' | 'rose' | 'blue' | 'amber' | 'violet' | 'slate';

const TONOS: Record<Tono, { bg: string; color: string }> = {
  brand: { bg: '#edfbf3', color: '#0d6945' },
  rose: { bg: '#fff1f2', color: '#e11d48' },
  blue: { bg: '#eff6ff', color: '#2563eb' },
  amber: { bg: '#fffbeb', color: '#d97706' },
  violet: { bg: '#f5f3ff', color: '#7c3aed' },
  slate: { bg: '#f1f5f9', color: '#475569' },
};

export interface StatCardProps {
  etiqueta: string;
  valor: number;
  icono?: string;
  tono?: Tono;
  formato?: 'moneda' | 'compacto' | 'numero';
  nota?: string;
  tendencia?: number | null;
}

export function StatCard({
  etiqueta,
  valor,
  icono = 'wallet',
  tono = 'brand',
  formato = 'moneda',
  nota = '',
  tendencia = null,
}: StatCardProps) {
  const tonoActual = TONOS[tono] ?? TONOS.brand;
  const valorFormateado =
    formato === 'numero' ? String(valor) : formato === 'compacto' ? monedaCompacta(valor) : moneda(valor);
  return (
    <Card sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: 12, sm: 13 }, fontWeight: 500, color: '#64748b' }}>
            {etiqueta}
          </Typography>
          <Typography sx={{ mt: 0.75, fontSize: { xs: 20, sm: 24 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {valorFormateado}
          </Typography>
        </Box>
        <Box
          sx={{
            width: { xs: 36, sm: 44 },
            height: { xs: 36, sm: 44 },
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 3,
            bgcolor: tonoActual.bg,
            color: tonoActual.color,
          }}
        >
          <Icon name={icono} size={20} />
        </Box>
      </Box>
      {tendencia !== null ? (
        <Box
          sx={{
            mt: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            fontSize: 12,
            fontWeight: 700,
            color: (tendencia ?? 0) >= 0 ? '#0d6945' : '#e11d48',
          }}
        >
          <Icon name={(tendencia ?? 0) >= 0 ? 'trend-up' : 'trend-down'} size={14} />
          {(tendencia ?? 0) >= 0 ? '+' : ''}
          {tendencia}%
          {nota && <Box component="span" sx={{ fontWeight: 500, color: '#94a3b8' }}>{nota}</Box>}
        </Box>
      ) : (
        nota && (
          <Typography sx={{ mt: 1.25, fontSize: 12, fontWeight: 500, color: '#64748b' }}>{nota}</Typography>
        )
      )}
    </Card>
  );
}

/* ----------------------------- ProgressBar ------------------------------ */

export interface ProgressBarProps {
  valor: number;
  color?: string;
  altura?: number;
}

export function ProgressBar({ valor, color = '#108354', altura = 10 }: ProgressBarProps) {
  return (
    <Box sx={{ width: '100%', height: altura, borderRadius: 999, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
      <Box
        sx={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, valor))}%`,
          borderRadius: 999,
          bgcolor: color,
          transition: 'width 0.5s ease',
        }}
      />
    </Box>
  );
}

/* ------------------------------ EmptyState ------------------------------ */

export interface EmptyStateProps {
  titulo?: string;
  descripcion?: string;
  icono?: string;
  children?: ReactNode;
}

export function EmptyState({
  titulo = 'Sin información',
  descripcion = 'Aquí aparecerán los datos cuando estén disponibles.',
  icono = 'search',
  children,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 4,
        border: '1px dashed #cbd5e1',
        bgcolor: 'rgba(248, 250, 252, 0.7)',
        px: 3,
        py: 6,
      }}
    >
      <Box
        sx={{
          mb: 2,
          width: 48,
          height: 48,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 3,
          bgcolor: '#ffffff',
          color: '#94a3b8',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
        }}
      >
        <Icon name={icono} size={24} />
      </Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{titulo}</Typography>
      <Typography sx={{ mt: 0.5, maxWidth: 380, fontSize: 14, color: '#64748b' }}>{descripcion}</Typography>
      {children && <Box sx={{ mt: 2.5 }}>{children}</Box>}
    </Box>
  );
}

/* ------------------------------ PageHeader ------------------------------ */

export interface PageHeaderProps {
  titulo: string;
  descripcion?: string;
  children?: ReactNode;
}

export function PageHeader({ titulo, descripcion, children }: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: { sm: 'flex-end' },
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography component="h1" sx={{ fontSize: { xs: 22, sm: 28 }, fontWeight: 800, letterSpacing: '-0.02em' }}>
          {titulo}
        </Typography>
        {descripcion && (
          <Typography sx={{ mt: 0.75, maxWidth: 720, fontSize: 14, color: '#64748b' }}>{descripcion}</Typography>
        )}
      </Box>
      {children && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>{children}</Box>
      )}
    </Box>
  );
}

/* -------------------------------- Modal --------------------------------- */

export interface ModalProps {
  abierto: boolean;
  titulo?: string;
  subtitulo?: string;
  ancho?: 'sm' | 'md' | 'lg';
  onCerrar: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

const ANCHOS: Record<'sm' | 'md' | 'lg', 'sm' | 'md' | 'lg'> = { sm: 'sm', md: 'md', lg: 'lg' };

export function Modal({ abierto, titulo, subtitulo, ancho = 'md', onCerrar, children, footer }: ModalProps) {
  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth={ANCHOS[ancho]} keepMounted>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pb: 1 }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{titulo}</Typography>
          {subtitulo && <Typography sx={{ mt: 0.25, fontSize: 14, color: '#64748b' }}>{subtitulo}</Typography>}
        </Box>
        <IconButton size="small" onClick={onCerrar} aria-label="Cerrar ventana" sx={{ color: '#94a3b8' }}>
          <Icon name="close" size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>{children}</DialogContent>
      {footer && <Box sx={{ borderTop: '1px solid #f1f5f9', px: 3, py: 2 }}>{footer}</Box>}
    </Dialog>
  );
}

/* ----------------------------- ConfirmModal ----------------------------- */

export interface ConfirmModalProps {
  abierto: boolean;
  titulo?: string;
  mensaje?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tono?: 'danger' | 'primary';
  onConfirmar: () => void;
  onCerrar: () => void;
}

export function ConfirmModal({
  abierto,
  titulo = '¿Confirmar acción?',
  mensaje = '',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  tono = 'danger',
  onConfirmar,
  onCerrar,
}: ConfirmModalProps) {
  return (
    <Modal
      abierto={abierto}
      titulo={titulo}
      ancho="sm"
      onCerrar={onCerrar}
      footer={
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="inherit" onClick={onCerrar} sx={{ borderColor: '#cbd5e1', color: '#334155' }}>
            {textoCancelar}
          </Button>
          <Button
            variant="contained"
            color={tono === 'danger' ? 'error' : 'primary'}
            onClick={onConfirmar}
          >
            {textoConfirmar}
          </Button>
        </Box>
      }
    >
      <Typography sx={{ fontSize: 14, color: '#475569' }}>{mensaje}</Typography>
    </Modal>
  );
}
