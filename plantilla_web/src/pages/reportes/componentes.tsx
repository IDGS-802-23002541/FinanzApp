import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { BalanceMiembro, Liquidacion } from '../../types/models';
import type { FilaPresupuesto } from '../../utils/reportes';
import { exportarCSV } from '../../utils/exportar';
import { moneda, nombreCompleto, porcentaje } from '../../utils/format';
import { Icon } from '../../components/Icon';
import { DonutChart } from '../../components/charts';
import { Avatar, ProgressBar } from '../../components/ui';

/* ---------------------------- Botón exportar ---------------------------- */

export interface ItemExportacion {
  etiqueta: string;
  archivo: string;
  filas: () => (string | number)[][];
}

export function BotonExportar({ items }: { items: ItemExportacion[] }) {
  const [ancla, setAncla] = useState<HTMLElement | null>(null);

  const descargar = (item: ItemExportacion) => {
    setAncla(null);
    exportarCSV(item.archivo, item.filas());
  };

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<Icon name="download" size={16} />}
        endIcon={<Icon name="chevron-down" size={14} />}
        onClick={(e) => setAncla(e.currentTarget)}
        sx={{ borderColor: '#cbd5e1', color: '#334155' }}
      >
        Exportar CSV
      </Button>
      <Menu
        anchorEl={ancla}
        open={ancla !== null}
        onClose={() => setAncla(null)}
        slotProps={{ paper: { sx: { minWidth: 260 } } }}
      >
        {items.map((item) => (
          <MenuItem key={item.etiqueta} onClick={() => descargar(item)}>
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontSize: 13.5, fontWeight: 600, color: '#334155' }}>
              <Icon name="download" size={15} />
              {item.etiqueta}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/* --------------------------- Presupuesto vs gasto ------------------------ */

export interface TarjetaPresupuestoProps {
  titulo?: string;
  conteo?: string;
  filas: FilaPresupuesto[];
}

export function TarjetaPresupuesto({
  titulo = 'Presupuesto vs gastado',
  conteo,
  filas,
}: TarjetaPresupuestoProps) {
  if (filas.length === 0) return null;

  const totalBase = filas.reduce((t, f) => t + f.base, 0);
  const totalGastado = filas.reduce((t, f) => t + f.gastado, 0);
  const totalDisponible = totalBase - totalGastado;
  const sinBase = filas.filter((f) => f.sinBase).length;
  const excedidas = filas.filter((f) => !f.sinBase && f.gastado > f.base).length;
  const ordenadas = [...filas].sort((a, b) => b.avance - a.avance);
  const visibles = ordenadas.slice(0, 6);
  const ocultas = ordenadas.length - visibles.length;

  return (
    <Card className="evitar-corte" sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{titulo}</Typography>
        {conteo && (
          <Box component="span" sx={{ borderRadius: 999, bgcolor: '#f1f5f9', color: '#475569', px: 1.25, py: 0.4, fontSize: 11, fontWeight: 700 }}>
            {conteo}
          </Box>
        )}
      </Box>

      {filas.length === 1 ? (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>Disponible</Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: totalDisponible < 0 ? '#e11d48' : '#0f172a' }}>
                {moneda(totalDisponible)}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: filas[0].avance >= 90 && !filas[0].sinBase ? '#e11d48' : '#0d6945' }}>
              {filas[0].sinBase ? 'Sin base definida' : `${filas[0].avance}% consumido`}
            </Typography>
          </Box>
          <Box sx={{ mt: 1.25 }}>
            <ProgressBar valor={filas[0].avance} color={totalDisponible < 0 ? '#e11d48' : filas[0].cartera.color} altura={10} />
          </Box>
          <Typography sx={{ mt: 1, fontSize: 12.5, color: '#64748b' }}>
            Gastado {moneda(totalGastado)} de {filas[0].sinBase ? 'sin base definida' : moneda(totalBase)}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          {visibles.map((fila) => (
            <Box key={fila.cartera.idCartera}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, fontSize: 13 }}>
                <Box sx={{ display: 'flex', minWidth: 0, alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, flexShrink: 0, borderRadius: '50%', bgcolor: fila.cartera.color }} />
                  <Box component="span" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fila.cartera.nombreCartera}
                  </Box>
                  {fila.avance >= 90 && !fila.sinBase && (
                    <Box component="span" title="Cerca del límite del presupuesto" sx={{ display: 'inline-flex', flexShrink: 0, color: '#e11d48' }}>
                      <Icon name="alert" size={14} />
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexShrink: 0, alignItems: 'center', gap: 1.5 }}>
                  <Box component="span" sx={{ color: '#64748b' }}>{fila.sinBase ? 'sin base' : `${fila.avance}%`}</Box>
                  <Box component="span" sx={{ minWidth: 80, textAlign: 'right', fontWeight: 700, color: fila.disponible < 0 ? '#e11d48' : '#0f172a' }}>
                    {moneda(fila.disponible)}
                  </Box>
                </Box>
              </Box>
              <Box sx={{ mt: 0.75 }}>
                <ProgressBar valor={fila.avance} color={fila.disponible < 0 ? '#e11d48' : fila.cartera.color} altura={8} />
              </Box>
            </Box>
          ))}
          {ocultas > 0 && <Typography sx={{ fontSize: 12, color: '#64748b' }}>y {ocultas} más…</Typography>}
        </Box>
      )}

      {filas.length > 1 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, m: 0, textAlign: 'center' }}>
            <Box>
              <Typography component="dt" sx={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>Presupuesto total</Typography>
              <Typography component="dd" sx={{ mt: 0.25, fontSize: 14, fontWeight: 700, m: 0 }}>{moneda(totalBase)}</Typography>
            </Box>
            <Box>
              <Typography component="dt" sx={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>Gastado</Typography>
              <Typography component="dd" sx={{ mt: 0.25, fontSize: 14, fontWeight: 700, m: 0 }}>{moneda(totalGastado)}</Typography>
            </Box>
            <Box>
              <Typography component="dt" sx={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>Disponible</Typography>
              <Typography component="dd" sx={{ mt: 0.25, fontSize: 14, fontWeight: 800, m: 0, color: totalDisponible < 0 ? '#e11d48' : '#0d6945' }}>
                {moneda(totalDisponible)}
              </Typography>
            </Box>
          </Box>
          {(sinBase > 0 || excedidas > 0) && (
            <Typography sx={{ mt: 1.5, fontSize: 12, color: '#64748b' }}>
              {sinBase > 0 ? `${sinBase} ${sinBase === 1 ? 'cartera' : 'carteras'} sin presupuesto: la base usa sus aportaciones. ` : ''}
              {excedidas > 0 ? `${excedidas} por encima del presupuesto.` : ''}
            </Typography>
          )}
        </>
      )}
    </Card>
  );
}

/* --------------------------- Gráfica de categorías ----------------------- */

export interface SegmentoCategoria {
  etiqueta: string;
  valor: number;
  color: string;
}

/**
 * Dona cuando hay 3+ categorías; con 1 o 2 se usan barras, que se leen mejor.
 */
export function GraficaCategorias({
  segmentos,
  etiquetaCentro = 'Gastado',
}: {
  segmentos: SegmentoCategoria[];
  etiquetaCentro?: string;
}) {
  if (segmentos.length === 0) {
    return (
      <Typography sx={{ py: 6, textAlign: 'center', fontSize: 13.5, color: '#64748b' }}>
        Sin gastos registrados en la selección.
      </Typography>
    );
  }

  if (segmentos.length >= 3) {
    return <DonutChart segmentos={segmentos} etiquetaCentro={etiquetaCentro} />;
  }

  const total = segmentos.reduce((t, s) => t + s.valor, 0);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {segmentos.map((segmento) => (
        <Box key={segmento.etiqueta}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: 13.5 }}>
            <Box sx={{ width: 10, height: 10, flexShrink: 0, borderRadius: '50%', bgcolor: segmento.color }} />
            <Box component="span" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: '#475569' }}>
              {segmento.etiqueta}
            </Box>
            <Box component="span" sx={{ fontWeight: 700 }}>{moneda(segmento.valor)}</Box>
            <Box component="span" sx={{ width: 40, textAlign: 'right', fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>
              {porcentaje(segmento.valor, total)}%
            </Box>
          </Box>
          <Box sx={{ mt: 0.75 }}>
            <ProgressBar valor={porcentaje(segmento.valor, total)} color={segmento.color} altura={8} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/* ------------------------------- Saldos --------------------------------- */

export interface TablaSaldosProps {
  titulo?: string;
  nota?: string;
  saldos: BalanceMiembro[];
  liquidaciones: Liquidacion[];
}

export function TablaSaldos({
  titulo = 'Saldos por integrante',
  nota,
  saldos,
  liquidaciones,
}: TablaSaldosProps) {
  const sumaSaldos = saldos.reduce((t, s) => t + s.saldo, 0);
  const cuadra = Math.abs(sumaSaldos) <= 1;

  return (
    <Card className="evitar-corte" sx={{ p: 2.5 }}>
      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{titulo}</Typography>
      {nota && <Typography sx={{ mt: 0.5, fontSize: 12.5, color: '#64748b' }}>{nota}</Typography>}

      {saldos.length === 0 ? (
        <Typography sx={{ mt: 2, fontSize: 13.5, color: '#64748b' }}>
          Sin integrantes con movimientos en la selección.
        </Typography>
      ) : (
        <TableContainer sx={{ mt: 1.5, overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' } }}>
                <TableCell>Integrante</TableCell>
                <TableCell align="right">Pagado</TableCell>
                <TableCell align="right">Aportado</TableCell>
                <TableCell align="right">Cuota</TableCell>
                <TableCell align="right">Saldo</TableCell>
                <TableCell align="right">Movs.</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {saldos.map((saldo) => (
                <TableRow key={saldo.usuario.idUsuario} sx={{ '& td': { fontSize: 13.5, borderBottom: '1px solid #f8fafc' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Avatar usuario={saldo.usuario} tamano="xs" />
                      <Box component="span" sx={{ fontWeight: 600 }}>{nombreCompleto(saldo.usuario)}</Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{moneda(saldo.pagado)}</TableCell>
                  <TableCell align="right" sx={{ color: '#0d6945' }}>{moneda(saldo.aportado)}</TableCell>
                  <TableCell align="right">{moneda(saldo.cuota)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, whiteSpace: 'nowrap', color: Math.abs(saldo.saldo) <= 1 ? '#64748b' : saldo.saldo > 0 ? '#0d6945' : '#e11d48' }}>
                    {saldo.saldo >= 0 ? '+' : '−'}{moneda(Math.abs(saldo.saldo))}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#64748b' }}>{saldo.movimientos}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography sx={{ mt: 1.5, fontSize: 12.5, color: cuadra ? '#0d6945' : '#e11d48' }}>
        Suma de saldos: {moneda(sumaSaldos)} {cuadra ? '· cuentas cuadradas (±$1.00 de tolerancia)' : '· revisa los movimientos'}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1.5 }}>Liquidación sugerida (mínimas transferencias)</Typography>
      {liquidaciones.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {liquidaciones.map((liq, i) => (
            <Box key={i} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, borderRadius: 3, bgcolor: '#f8fafc', px: 2, py: 1.25 }}>
              <Avatar usuario={liq.de} tamano="xs" />
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{nombreCompleto(liq.de)}</Typography>
              <Icon name="chevron-right" size={15} />
              <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#0d6945' }}>{moneda(liq.monto)}</Typography>
              <Icon name="chevron-right" size={15} />
              <Avatar usuario={liq.para} tamano="xs" />
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{nombreCompleto(liq.para)}</Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography sx={{ fontSize: 13.5, color: '#64748b' }}>
          No se requieren transferencias: todos los saldos están dentro de la tolerancia de ±$1.00.
        </Typography>
      )}
    </Card>
  );
}
