import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { moneda, monedaCompacta, porcentaje } from '../utils/format';

/* ------------------------------- BarChart ------------------------------- */

export interface PuntoBarra {
  etiqueta: string;
  valor: number;
  secundario?: number;
}

export interface BarChartProps {
  datos: PuntoBarra[];
  alto?: number;
  color?: string;
  mostrarSecundario?: boolean;
  leyendaPrincipal?: string;
  leyendaSecundario?: string;
}

const MARCAS = [100, 75, 50, 25, 0];

export function BarChart({
  datos,
  alto = 200,
  color = '#108354',
  mostrarSecundario = false,
  leyendaPrincipal = '',
  leyendaSecundario = 'Ingresos',
}: BarChartProps) {
  const valores = datos.flatMap((p) => [p.valor, mostrarSecundario ? (p.secundario ?? 0) : 0]);
  const bruto = Math.max(1, ...valores);
  const magnitud = Math.pow(10, Math.floor(Math.log10(bruto)));
  const maximo = Math.ceil(bruto / magnitud) * magnitud;

  const puntos = datos.map((p) => ({
    etiqueta: p.etiqueta,
    valor: p.valor,
    secundario: p.secundario ?? 0,
    porcentaje: Math.max(2, (p.valor / maximo) * 100),
    porcentajeSecundario: mostrarSecundario ? Math.max(2, ((p.secundario ?? 0) / maximo) * 100) : 0,
  }));

  return (
    <Box sx={{ width: '100%' }}>
      {leyendaPrincipal && (
        <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 500, color: '#64748b' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
            {leyendaPrincipal}
          </Box>
          {mostrarSecundario && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
              {leyendaSecundario}
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ position: 'relative', height: alto }}>
        {MARCAS.map((marca) => (
          <Box
            key={marca}
            sx={{
              position: 'absolute',
              insetInline: 0,
              bottom: `${marca}%`,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
            }}
          >
            <Typography sx={{ width: 48, flexShrink: 0, textAlign: 'right', fontSize: 10, fontWeight: 500, color: '#94a3b8' }}>
              {monedaCompacta((maximo * marca) / 100)}
            </Typography>
            <Box sx={{ ml: 1, height: '1px', flex: 1, bgcolor: '#f1f5f9' }} />
          </Box>
        ))}

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: { xs: 0, sm: 56 },
            display: 'flex',
            alignItems: 'flex-end',
            gap: { xs: 0.75, sm: 1.5 },
          }}
        >
          {puntos.map((punto) => (
            <Tooltip
              key={punto.etiqueta}
              arrow
              title={
                <Box>
                  <Box>{`${punto.etiqueta} · ${moneda(punto.valor)}`}</Box>
                  {mostrarSecundario && punto.secundario > 0 && (
                    <Box sx={{ fontWeight: 500, color: '#cbd5e1' }}>{`${leyendaSecundario}: ${moneda(punto.secundario)}`}</Box>
                  )}
                </Box>
              }
            >
              <Box
                sx={{
                  display: 'flex',
                  flex: 1,
                  height: '100%',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: 0.5,
                  cursor: 'default',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 28,
                    height: `${punto.porcentaje}%`,
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    bgcolor: color,
                    transition: 'height 0.5s ease',
                  }}
                />
                {mostrarSecundario && (
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 28,
                      height: `${punto.porcentajeSecundario}%`,
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      bgcolor: '#cbd5e1',
                      transition: 'height 0.5s ease',
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 0.75, display: 'flex', gap: { xs: 0.75, sm: 1.5 }, pl: { xs: 0, sm: '56px' } }}>
        {puntos.map((punto) => (
          <Typography
            key={punto.etiqueta}
            sx={{
              flex: 1,
              textAlign: 'center',
              fontSize: { xs: 10, sm: 11 },
              fontWeight: 500,
              color: '#64748b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {punto.etiqueta}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

/* ------------------------------ DonutChart ------------------------------ */

export interface SegmentoDona {
  etiqueta: string;
  valor: number;
  color: string;
}

export interface DonutChartProps {
  segmentos: SegmentoDona[];
  etiquetaCentro?: string;
}

export function DonutChart({ segmentos, etiquetaCentro = 'Total' }: DonutChartProps) {
  const totalReal = segmentos.reduce((total, s) => total + s.valor, 0);
  const total = totalReal || 1;
  let acumulado = 0;
  const arcos = segmentos.map((s) => {
    const parte = porcentaje(s.valor, total);
    const arco = { ...s, porcentaje: parte, dash: `${parte} ${100 - parte}`, offset: -acumulado };
    acumulado += parte;
    return arco;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3 }}>
      <Box sx={{ position: 'relative', width: 176, height: 176, flexShrink: 0 }}>
        <Box
          component="svg"
          viewBox="0 0 42 42"
          sx={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
        >
          <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="6" />
          {arcos.map((arco) => (
            <circle
              key={arco.etiqueta}
              cx="21"
              cy="21"
              r="15.9155"
              fill="none"
              pathLength={100}
              strokeWidth={6}
              stroke={arco.color}
              strokeDasharray={arco.dash}
              strokeDashoffset={arco.offset}
            />
          ))}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: '#94a3b8', textTransform: 'uppercase' }}>
            {etiquetaCentro}
          </Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 800 }}>{moneda(totalReal)}</Typography>
        </Box>
      </Box>

      <Box component="ul" sx={{ width: '100%', m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {arcos.length === 0 && (
          <Typography component="li" sx={{ fontSize: 14, color: '#64748b' }}>
            Sin movimientos registrados.
          </Typography>
        )}
        {arcos.map((arco) => (
          <Box component="li" key={arco.etiqueta} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: 14 }}>
            <Box sx={{ width: 10, height: 10, flexShrink: 0, borderRadius: '50%', bgcolor: arco.color }} />
            <Typography sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#475569' }}>
              {arco.etiqueta}
            </Typography>
            <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{moneda(arco.valor)}</Typography>
            <Typography sx={{ width: 40, textAlign: 'right', fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>
              {arco.porcentaje}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
