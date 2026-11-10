// Tarjeta con los ultimos movimientos de la cartera (HU-05.1 / resumen).
import { Alert, Box, Paper, Stack, Typography } from '@mui/material'
import { formatearMonto } from '../../../utils/formato.js'
import {
  IconoArchivo,
  IconoEstrella,
} from '../../../components/ui/Iconos.jsx'

// Fecha ISO (YYYY-MM-DD) a dd/MM/aaaa sin que UTC mueva el dia.
function formatearFechaCorta(iso) {
  if (!iso) return ''
  const [anio, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${anio}`
}

function UltimasTransacciones({ items = [], error = '' }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid var(--color-borde)',
        borderRadius: '16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Últimas transacciones
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : items.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ mt: 2, color: 'var(--color-texto-secundario)' }}
        >
          Aún no hay transacciones.
        </Typography>
      ) : (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {items.map((item) => {
            const esIngreso = item.tipo === 'INGRESO'
            const Icono = esIngreso ? IconoEstrella : IconoArchivo
            const titulo =
              item.descripcion || item.categoria?.nombre || 'Sin descripción'
            const autor = item.autor?.nombre ?? 'Sin autor'
            const fecha = formatearFechaCorta(item.fecha)

            return (
              <Box
                key={item.idTransaccion}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-seleccion)',
                    color: 'var(--color-primario)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icono sx={{ fontSize: 18 }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {titulo}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-texto-terciario)' }}
                    noWrap
                  >
                    {autor} · {fecha}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    color: esIngreso
                      ? 'var(--color-exito)'
                      : 'var(--color-texto)',
                  }}
                >
                  {esIngreso ? '+' : '-'}
                  {formatearMonto(item.monto)}
                </Typography>
              </Box>
            )
          })}
        </Stack>
      )}
    </Paper>
  )
}

export default UltimasTransacciones
