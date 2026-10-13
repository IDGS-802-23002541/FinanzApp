import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Usuario } from '../../types/models';
import { CATEGORIAS_GASTO } from '../../data/mock-data';
import { useAuthUsuario } from '../../stores/auth';
import { useCarteras, useMiembros } from '../../stores/carteras';
import { useTransacciones } from '../../stores/transacciones';
import { useUsuarios } from '../../stores/usuarios';
import { gastosPorCategoria, sumar } from '../../utils/finanzas';
import { imprimir, nombreConFecha } from '../../utils/exportar';
import { fechaNumerica, moneda, nombreCompleto, nombreCorto, porcentaje } from '../../utils/format';
import {
  agregarSaldos,
  carterasDeUsuario,
  esHogar,
  filtrarPorPersona,
  filtrarPorRango,
  filasPresupuesto,
  mesesEnRango,
  OPCIONES_PERIODO,
  promedioMensualGasto,
  rangoAnterior,
  rangoDePeriodo,
  recurrenciaCategorias,
  serieMensualRango,
  type ClavePeriodo,
} from '../../utils/reportes';
import { Icon } from '../../components/Icon';
import { BarChart } from '../../components/charts';
import { EmptyState, ProgressBar, StatCard } from '../../components/ui';
import {
  BotonExportar,
  GraficaCategorias,
  TablaSaldos,
  TarjetaPresupuesto,
  type ItemExportacion,
} from './componentes';

/**
 * Ventana «Hogar»: carteras recurrentes.
 * La lectura es por mes (evolución, promedio, recurrencia de categorías),
 * con soporte para varias carteras de hogar y filtro por persona.
 */
export function VentanaHogar() {
  const usuario = useAuthUsuario();
  const carteras = useCarteras();
  const miembros = useMiembros();
  const usuarios = useUsuarios();
  const transacciones = useTransacciones();

  const [carteraId, setCarteraId] = useState<number | 'todas'>('todas');
  const [periodo, setPeriodo] = useState<ClavePeriodo>('6m');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [persona, setPersona] = useState<number | 'todas'>('todas');

  const idUsuario = usuario?.idUsuario ?? null;

  const hogar = useMemo(
    () => carterasDeUsuario(carteras, miembros, idUsuario).filter(esHogar),
    [carteras, miembros, idUsuario],
  );

  const enVista = useMemo(
    () => (carteraId === 'todas' ? hogar : hogar.filter((c) => c.idCartera === carteraId)),
    [hogar, carteraId],
  );

  const idsVista = useMemo(() => new Set(enVista.map((c) => c.idCartera)), [enVista]);

  const rango = useMemo(() => rangoDePeriodo(periodo, desde, hasta), [periodo, desde, hasta]);
  const rangoPrev = useMemo(() => rangoAnterior(rango), [rango]);

  const movsVista = useMemo(
    () => transacciones.filter((t) => idsVista.has(t.idCartera)),
    [transacciones, idsVista],
  );
  const movsRango = useMemo(
    () => filtrarPorPersona(filtrarPorRango(movsVista, rango), persona),
    [movsVista, rango, persona],
  );
  const movsPrevios = useMemo(
    () => filtrarPorPersona(filtrarPorRango(movsVista, rangoPrev), persona),
    [movsVista, rangoPrev, persona],
  );

  const personasDisponibles = useMemo(() => {
    const ids = new Set(miembros.filter((m) => idsVista.has(m.idCartera)).map((m) => m.idUsuario));
    return usuarios.filter((u) => ids.has(u.idUsuario));
  }, [miembros, idsVista, usuarios]);

  /* ------------------------------- KPIs ------------------------------- */

  const gastoRango = sumar(movsRango, 'gasto');
  const ingresoRango = sumar(movsRango, 'ingreso');
  const gastoPrevio = sumar(movsPrevios, 'gasto');
  const tendencia = gastoPrevio > 0 ? Math.round(((gastoRango - gastoPrevio) / gastoPrevio) * 100) : null;

  const gastosRango = useMemo(() => movsRango.filter((t) => t.tipo === 'gasto'), [movsRango]);
  const numGastos = gastosRango.length;
  const ticketPromedio = numGastos > 0 ? gastoRango / numGastos : 0;
  const mesesConGasto = useMemo(() => new Set(gastosRango.map((t) => t.fecha.slice(0, 7))).size, [gastosRango]);
  const promedioMensual = useMemo(() => promedioMensualGasto(movsRango), [movsRango]);

  const categorias = useMemo(() => gastosPorCategoria(movsRango, CATEGORIAS_GASTO, 6), [movsRango]);
  const dominante = categorias[0];
  const porcentajeDominante = dominante && gastoRango > 0 ? Math.round((dominante.valor / gastoRango) * 100) : 0;

  const serieMensual = useMemo(() => serieMensualRango(movsRango, mesesEnRango(rango)), [movsRango, rango]);
  const recurrencia = useMemo(() => recurrenciaCategorias(movsRango, CATEGORIAS_GASTO), [movsRango]);

  const filasAportes = useMemo(() => {
    const mapa = new Map<number, { pagado: number; aportado: number }>();
    for (const t of movsRango) {
      const actual = mapa.get(t.idUsuario) ?? { pagado: 0, aportado: 0 };
      if (t.tipo === 'gasto') actual.pagado += t.monto;
      else actual.aportado += t.monto;
      mapa.set(t.idUsuario, actual);
    }
    return [...mapa.entries()]
      .map(([id, datos]) => ({ usuario: usuarios.find((u) => u.idUsuario === id) ?? null, ...datos }))
      .filter((fila): fila is { usuario: Usuario; pagado: number; aportado: number } => fila.usuario !== null)
      .sort((a, b) => b.pagado - a.pagado)
      .slice(0, 8);
  }, [movsRango, usuarios]);

  /* --------------------------- presupuesto y saldos -------------------- */

  const presupuestos = useMemo(() => filasPresupuesto(enVista, movsVista), [enVista, movsVista]);
  const saldos = useMemo(
    () => agregarSaldos(enVista, movsVista, miembros, usuarios),
    [enVista, movsVista, miembros, usuarios],
  );

  /* ------------------------------ exportación --------------------------- */

  const items: ItemExportacion[] = [
    {
      etiqueta: 'Evolución mensual (CSV)',
      archivo: nombreConFecha('finanzapp-hogar-mensual'),
      filas: () => [
        ['Mes', 'Gastos', 'Ingresos', 'Balance'],
        ...serieMensual.map((p) => [p.etiqueta, p.valor, p.secundario, p.secundario - p.valor]),
      ],
    },
    {
      etiqueta: 'Recurrencia por categoría (CSV)',
      archivo: nombreConFecha('finanzapp-hogar-recurrencia'),
      filas: () => [
        ['Categoría', 'Gasto', 'Meses con gasto', 'Meses analizados', '% del gasto'],
        ...recurrencia.map((fila) => [fila.etiqueta, fila.total, fila.meses, fila.mesesTotales, fila.porcentaje]),
      ],
    },
    {
      etiqueta: 'Movimientos (CSV)',
      archivo: nombreConFecha('finanzapp-hogar-movimientos'),
      filas: () => [
        ['Fecha', 'Cartera', 'Tipo', 'Categoría', 'Descripción', 'Responsable', 'Método', 'Monto (MXN)'],
        ...movsRango.map((t) => [
          fechaNumerica(t.fecha),
          enVista.find((c) => c.idCartera === t.idCartera)?.nombreCartera ?? '',
          t.tipo === 'gasto' ? 'Gasto' : 'Ingreso',
          t.nombreGasto,
          t.nota,
          nombreCompleto(usuarios.find((u) => u.idUsuario === t.idUsuario)),
          t.metodoPago,
          t.monto,
        ]),
      ],
    },
    {
      etiqueta: 'Saldos y liquidación (CSV)',
      archivo: nombreConFecha('finanzapp-hogar-saldos'),
      filas: () => [
        ['Integrante', 'Pagado', 'Aportado', 'Cuota', 'Saldo', 'Movimientos'],
        ...saldos.saldos.map((saldo) => [
          nombreCompleto(saldo.usuario),
          saldo.pagado,
          saldo.aportado,
          saldo.cuota,
          saldo.saldo,
          saldo.movimientos,
        ]),
      ],
    },
  ];

  const limpiar = () => {
    setCarteraId('todas');
    setPeriodo('6m');
    setDesde('');
    setHasta('');
    setPersona('todas');
  };

  if (hogar.length === 0) {
    return (
      <EmptyState
        titulo="Aún no tienes carteras de hogar"
        descripcion="Las carteras de tipo Hogar son las recurrentes (casa, servicios, despensa). Crea una para ver su reporte mensual."
        icono="home"
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Filtros */}
      <Card className="no-print" sx={{ p: 2 }}>
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '2fr 1.4fr 1.4fr' } }}>
          <TextField
            select
            label="Cartera"
            value={carteraId}
            onChange={(e) => setCarteraId(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
          >
            <MenuItem value="todas">Todas las carteras de hogar</MenuItem>
            {hogar.map((c) => (
              <MenuItem key={c.idCartera} value={c.idCartera}>{c.nombreCartera}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Período"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as ClavePeriodo)}
          >
            {OPCIONES_PERIODO.map((opcion) => (
              <MenuItem key={opcion.clave} value={opcion.clave}>{opcion.etiqueta}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Persona"
            value={persona}
            onChange={(e) => setPersona(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
          >
            <MenuItem value="todas">Todas las personas</MenuItem>
            {personasDisponibles.map((u) => (
              <MenuItem key={u.idUsuario} value={u.idUsuario}>{nombreCompleto(u)}</MenuItem>
            ))}
          </TextField>
        </Box>

        {periodo === 'personalizado' && (
          <Box sx={{ mt: 1.5, display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField
              type="date"
              label="Desde"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              type="date"
              label="Hasta"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        )}

        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ fontSize: 12.5, color: rango.invertido ? '#e11d48' : '#64748b' }}>
            {rango.invertido
              ? 'El rango está invertido (Desde es posterior a Hasta); ajusta las fechas.'
              : `${movsRango.length} movimientos · ${moneda(gastoRango)} gastados · ${moneda(ingresoRango)} aportados`}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <BotonExportar items={items} />
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Icon name="print" size={16} />}
              onClick={imprimir}
              sx={{ borderColor: '#cbd5e1', color: '#334155' }}
            >
              Imprimir
            </Button>
            <Button variant="text" startIcon={<Icon name="refresh" size={14} />} onClick={limpiar}>
              Limpiar filtros
            </Button>
          </Box>
        </Box>
      </Card>

      {movsRango.length === 0 ? (
        <EmptyState
          titulo="Sin movimientos en esta selección"
          descripcion="No hay movimientos que coincidan con los filtros actuales. Prueba con otro período o limpia los filtros."
          icono="search"
        >
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<Icon name="refresh" size={14} />}
            onClick={limpiar}
            sx={{ borderColor: '#cbd5e1', color: '#334155' }}
          >
            Limpiar filtros
          </Button>
        </EmptyState>
      ) : (
        <>
          {/* KPIs */}
          <Box className="evitar-corte" sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
            <StatCard
              etiqueta="Gasto del período"
              valor={gastoRango}
              icono="cart"
              tono="rose"
              tendencia={tendencia}
              nota="vs período anterior"
            />
            <StatCard
              etiqueta="Promedio mensual"
              valor={promedioMensual}
              icono="trend-up"
              tono="brand"
              nota={`sobre ${mesesConGasto} ${mesesConGasto === 1 ? 'mes' : 'meses'} con gastos`}
            />
            <StatCard
              etiqueta="Ticket promedio"
              valor={ticketPromedio}
              icono="receipt"
              tono="blue"
              nota={`${numGastos} gastos registrados`}
            />
            <StatCard
              etiqueta="Movimientos"
              valor={movsRango.length}
              icono="wallet"
              tono="slate"
              formato="numero"
              nota={`en ${enVista.length} ${enVista.length === 1 ? 'cartera' : 'carteras'}`}
            />
          </Box>

          {/* Presupuesto acumulado con desglose por cartera */}
          <TarjetaPresupuesto
            titulo="Presupuesto vs gasto acumulado"
            conteo={`${enVista.length} ${enVista.length === 1 ? 'cartera' : 'carteras'}`}
            filas={presupuestos}
          />

          {/* Gráficas */}
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { lg: '1fr 1fr' } }}>
            <Card className="evitar-corte" sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Evolución mensual de gastos</Typography>
              <BarChart
                datos={serieMensual}
                alto={200}
                color="#0d6945"
                mostrarSecundario
                leyendaPrincipal="Gastos por mes"
                leyendaSecundario="Ingresos"
                referencia={promedioMensual > 0 ? promedioMensual : undefined}
                etiquetaReferencia="Promedio"
              />
            </Card>
            <Card className="evitar-corte" sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Gasto por categoría</Typography>
                {dominante && (
                  <Box component="span" sx={{ borderRadius: 999, bgcolor: '#edfbf3', color: '#0d5439', px: 1.25, py: 0.4, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Top: {dominante.etiqueta} {porcentajeDominante}%
                  </Box>
                )}
              </Box>
              <GraficaCategorias segmentos={categorias} etiquetaCentro="Gastado" />
            </Card>
          </Box>

          {/* Recurrencia e integrantes */}
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { lg: '1fr 1fr' } }}>
            <Card className="evitar-corte" sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Recurrencia por categoría</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                {recurrencia.map((fila) => (
                  <Box key={fila.idCategoriaGasto} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 10, height: 10, flexShrink: 0, borderRadius: '50%', bgcolor: fila.color }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, fontSize: 13 }}>
                        <Box component="span" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {fila.etiqueta}
                        </Box>
                        <Box component="span" sx={{ fontWeight: 700 }}>{moneda(fila.total)}</Box>
                      </Box>
                      <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box sx={{ flex: 1 }}>
                          <ProgressBar valor={porcentaje(fila.meses, fila.mesesTotales)} color={fila.color} altura={6} />
                        </Box>
                        <Typography sx={{ flexShrink: 0, fontSize: 11.5, color: '#64748b' }}>
                          {fila.meses} de {fila.mesesTotales} meses · {fila.porcentaje}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
                {recurrencia.length === 0 && (
                  <Typography sx={{ fontSize: 13.5, color: '#64748b' }}>Sin gastos en la selección.</Typography>
                )}
              </Box>
            </Card>

            <Card className="evitar-corte" sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Aportación por integrante</Typography>
              {filasAportes.length > 1 ? (
                <BarChart
                  datos={filasAportes.map((fila) => ({
                    etiqueta: nombreCorto(fila.usuario),
                    valor: fila.pagado,
                    secundario: fila.aportado,
                  }))}
                  alto={200}
                  color="#2563eb"
                  mostrarSecundario
                  leyendaPrincipal="Pagado (gastos)"
                  leyendaSecundario="Aportado"
                />
              ) : (
                <Typography sx={{ py: 4, textAlign: 'center', fontSize: 13.5, color: '#64748b' }}>
                  Se necesitan al menos dos integrantes con movimientos para comparar aportaciones.
                </Typography>
              )}
            </Card>
          </Box>

          {/* Saldos y liquidación */}
          <TablaSaldos
            nota={
              persona !== 'todas'
                ? 'Los saldos consideran todos los movimientos acumulados de las carteras seleccionadas, sin el filtro de persona.'
                : 'Saldos acumulados de todos los movimientos de las carteras seleccionadas (no dependen del período).'
            }
            saldos={saldos.saldos}
            liquidaciones={saldos.liquidaciones}
          />
        </>
      )}
    </Box>
  );
}
