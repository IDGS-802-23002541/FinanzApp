import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useAuthUsuario } from '../../stores/auth';
import { useCarteras, useMiembros } from '../../stores/carteras';
import { useTransacciones } from '../../stores/transacciones';
import { moneda, porcentaje } from '../../utils/format';
import { carterasDeUsuario, esHogar, esTemporal } from '../../utils/reportes';
import { Icon } from '../../components/Icon';
import { PageHeader } from '../../components/ui';
import { VentanaHogar } from './VentanaHogar';
import { VentanaTemporales } from './VentanaTemporales';

type Ventana = 'hogar' | 'temporales';

function LeyendaReparto({
  color,
  etiqueta,
  monto,
  valorPorcentaje,
  total,
}: {
  color: string;
  etiqueta: string;
  monto: number;
  valorPorcentaje: number;
  total: number;
}) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25, fontSize: 13 }}>
      <Box sx={{ width: 10, height: 10, flexShrink: 0, borderRadius: '50%', bgcolor: color }} />
      <Box component="span" sx={{ fontWeight: 600, color: '#475569' }}>{etiqueta}</Box>
      <Box component="span" sx={{ fontWeight: 700 }}>{moneda(monto)}</Box>
      <Box component="span" sx={{ color: '#64748b' }}>{valorPorcentaje}%</Box>
      <Box component="span" sx={{ fontSize: 11.5, color: '#94a3b8' }}>
        {total} {total === 1 ? 'cartera' : 'carteras'}
      </Box>
    </Box>
  );
}

/**
 * Centro de reportes: compara el gasto entre las carteras recurrentes
 * (Hogar) y los proyectos temporales (Viaje, Evento, Otro), y da acceso
 * a las dos ventanas de análisis.
 */
export default function Reportes() {
  const usuario = useAuthUsuario();
  const carteras = useCarteras();
  const miembros = useMiembros();
  const transacciones = useTransacciones();

  const [ventana, setVentana] = useState<Ventana>('hogar');

  const idUsuario = usuario?.idUsuario ?? null;

  const misCarteras = useMemo(
    () => carterasDeUsuario(carteras, miembros, idUsuario),
    [carteras, miembros, idUsuario],
  );
  const hogar = useMemo(() => misCarteras.filter(esHogar), [misCarteras]);
  const temporales = useMemo(() => misCarteras.filter(esTemporal), [misCarteras]);

  const reparto = useMemo(() => {
    const idsHogar = new Set(hogar.map((c) => c.idCartera));
    const idsTemporales = new Set(temporales.map((c) => c.idCartera));
    let gastoHogar = 0;
    let gastoTemporal = 0;
    for (const t of transacciones) {
      if (t.tipo !== 'gasto') continue;
      if (idsHogar.has(t.idCartera)) gastoHogar += t.monto;
      else if (idsTemporales.has(t.idCartera)) gastoTemporal += t.monto;
    }
    return { gastoHogar, gastoTemporal, total: gastoHogar + gastoTemporal };
  }, [hogar, temporales, transacciones]);

  const pctHogar = porcentaje(reparto.gastoHogar, reparto.total);
  const pctTemporal = porcentaje(reparto.gastoTemporal, reparto.total);

  return (
    <Box>
      <PageHeader
        titulo="Reportes"
        descripcion="Analiza tus carteras recurrentes (Hogar) y tus proyectos temporales (Viaje, Evento, Otro) con KPIs, gráficas, balance y exportación."
      />

      {/* Reparto Hogar vs Temporales (histórico completo) */}
      <Card className="evitar-corte" sx={{ p: 2.5, mb: 2.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Hogar vs Temporales</Typography>
          <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Histórico completo · incluye carteras finalizadas</Typography>
        </Box>
        {reparto.total === 0 ? (
          <Typography sx={{ fontSize: 13.5, color: '#64748b' }}>
            Aún no hay gastos registrados en tus carteras; cuando registres movimientos verás aquí el reparto entre Hogar y Temporales.
          </Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', bgcolor: '#f1f5f9' }}>
              {reparto.gastoHogar > 0 && <Box sx={{ width: `${pctHogar}%`, bgcolor: '#0d6945' }} />}
              {reparto.gastoTemporal > 0 && <Box sx={{ width: `${pctTemporal}%`, bgcolor: '#2563eb' }} />}
            </Box>
            <Box sx={{ mt: 1.5, display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <LeyendaReparto
                color="#0d6945"
                etiqueta="Hogar (recurrente)"
                monto={reparto.gastoHogar}
                valorPorcentaje={pctHogar}
                total={hogar.length}
              />
              <LeyendaReparto
                color="#2563eb"
                etiqueta="Temporales (proyectos)"
                monto={reparto.gastoTemporal}
                valorPorcentaje={pctTemporal}
                total={temporales.length}
              />
            </Box>
          </>
        )}
      </Card>

      {/* Selector de ventana */}
      <Box
        className="no-print"
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0.75,
          borderRadius: 4,
          bgcolor: '#f1f5f9',
          p: 0.75,
          maxWidth: { sm: 620 },
        }}
      >
        {(
          [
            { clave: 'hogar' as Ventana, etiqueta: 'Hogar (recurrente)', icono: 'home', total: hogar.length },
            { clave: 'temporales' as Ventana, etiqueta: 'Temporales (proyectos)', icono: 'globe', total: temporales.length },
          ] as const
        ).map((tab) => (
          <Box
            key={tab.clave}
            component="button"
            type="button"
            onClick={() => setVentana(tab.clave)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderRadius: 3,
              border: 'none',
              px: 1.5,
              py: 1.25,
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: 700,
              bgcolor: ventana === tab.clave ? '#ffffff' : 'transparent',
              color: ventana === tab.clave ? '#0f172a' : '#64748b',
              boxShadow: ventana === tab.clave ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Icon name={tab.icono} size={16} />
            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.etiqueta}</Box>
            <Box
              component="span"
              sx={{
                flexShrink: 0,
                borderRadius: 999,
                px: 1,
                py: 0.25,
                fontSize: 11,
                fontWeight: 800,
                bgcolor: ventana === tab.clave ? '#edfbf3' : '#e2e8f0',
                color: ventana === tab.clave ? '#0d6945' : '#475569',
              }}
            >
              {tab.total}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 2.5 }}>
        {ventana === 'hogar' ? <VentanaHogar /> : <VentanaTemporales />}
      </Box>
    </Box>
  );
}
