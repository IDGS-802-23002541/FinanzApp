import { Box, Paper, Stack, Typography } from '@mui/material'
import { formatearMonto } from '../../../utils/formato.js'

// Barra de presupuesto de las carteras sin periodo (Viaje, Evento, Otro).
// El presupuesto es un techo de gasto: solo se compara contra lo gastado y las
// aportaciones no lo mueven. Se puede exceder; en ese caso se avisa.
function BarraPresupuesto({ presupuesto = 0, gastado = 0 }) {
  const tienePresupuesto = presupuesto > 0
  const porcentaje = tienePresupuesto ? (gastado / presupuesto) * 100 : 0
  const excedido = porcentaje > 100
  const restante = presupuesto - gastado

  const color = !tienePresupuesto
    ? 'var(--color-texto-terciario)'
    : excedido
      ? 'var(--color-negativo)'
      : porcentaje >= 90
        ? 'var(--color-alerta)'
        : 'var(--color-primario)'

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid var(--color-borde)',
        borderRadius: 'var(--radio-lg)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Typography variant="subtitle2">Presupuesto</Typography>

      <Stack
        direction="row"
        sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 2, mt: 0.5 }}
      >
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>
          {tienePresupuesto ? formatearMonto(presupuesto) : 'Sin definir'}
        </Typography>
        {tienePresupuesto && (
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color }}>
            {Math.round(porcentaje)} %
          </Typography>
        )}
      </Stack>

      <Box
        sx={{
          mt: 2,
          height: 12,
          borderRadius: 'var(--radio-pill)',
          backgroundColor: 'var(--color-superficie-suave)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${Math.min(porcentaje, 100)}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 'var(--radio-pill)',
            transition: 'width 0.3s ease',
          }}
        />
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ justifyContent: 'space-between', gap: 0.5, mt: 1.5 }}
      >
        <Typography
          sx={{ fontSize: '0.8125rem', color: 'var(--color-texto-secundario)' }}
        >
          Gastado {formatearMonto(gastado)}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: excedido
              ? 'var(--color-negativo)'
              : 'var(--color-texto-secundario)',
          }}
        >
          {!tienePresupuesto
            ? 'Agrega un presupuesto al editar la cartera'
            : excedido
              ? `Excedido por ${formatearMonto(Math.abs(restante))}`
              : `Disponible ${formatearMonto(restante)}`}
        </Typography>
      </Stack>

      <Typography
        sx={{ mt: 2, pt: 1.5, borderTop: '1px solid var(--color-borde)', fontSize: '0.75rem', color: 'var(--color-texto-terciario)' }}
      >
        El presupuesto es una guía de gasto: las aportaciones de los
        participantes no lo aumentan.
      </Typography>
    </Paper>
  )
}

export default BarraPresupuesto
