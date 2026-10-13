import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import type { Usuario } from '../../types/models';
import { CATEGORIAS_CARTERA, CATEGORIAS_GASTO } from '../../data/mock-data';
import { useAuthUsuario } from '../../stores/auth';
import { useCarteras, useMiembros } from '../../stores/carteras';
import { useTransacciones } from '../../stores/transacciones';
import { useUsuarios } from '../../stores/usuarios';
import { gastosPorCategoria, sumar } from '../../utils/finanzas';
import { imprimir, nombreConFecha } from '../../utils/exportar';
import { fechaCorta, fechaNumerica, moneda, nombreCompleto, nombreCorto } from '../../utils/format';
import {
  agregarSaldos,
  carterasDeUsuario,
  diasProyecto,
  esTemporal,
  ETIQUETAS_FASE,
  faseTemporal,
  filasPresupuesto,
  gastoPorDiaProyecto,
  serieAcumuladaGasto,
  type FaseTemporal,
} from '../../utils/reportes';
import { Icon } from '../../components/Icon';
import { BarChart, LineChart } from '../../components/charts';
import { EmptyState, ProgressBar, StatCard } from '../../components/ui';
import {
  BotonExportar,
  GraficaCategorias,
  TablaSaldos,
  TarjetaPresupuesto,
  type ItemExportacion,
} from './componentes';

const TIPOS_TEMPORALES = [
  { id: 2, etiqueta: 'Viaje' },
  { id: 3, etiqueta: 'Evento' },
  { id: 4, etiqueta: 'Otro' },
];

const COLOR_FASE: Record<FaseTemporal, { bg: string; color: string }> = {
  'en-curso': { bg: '#edfbf3', color: '#0d5439' },
  proximos: { bg: '#eff6ff', color: '#2563eb' },
  finalizados: { bg: '#f1f5f9', color: '#475569' },
};

/**
 * Ventana «Temporales»: proyectos con inicio y fin (Viaje, Evento, Otro).
 * La lectura es por proyecto (avance vs presupuesto, días, gasto por día),
 * y nunca se consolida sin desglose visible.
 */
export function VentanaTemporales() {
  const usuario = useAuthUsuario();
  const carteras = useCarteras();
  const miembros = useMiembros();
  const usuarios = useUsuarios();
  const transacciones = useTransacciones();

  const [tipo, setTipo] = useState<number | 'todos'>('todos');
  const [carteraId, setCarteraId] = useState<number | 'todas'>('todas');
  const [fase, setFase] = useState<FaseTemporal | 'todos'>('todos');

  const idUsuario = usuario?.idUsuario ?? null;

  const temporales = useMemo(
    () => carterasDeUsuario(carteras, miembros, idUsuario).filter(esTemporal),
    [carteras, miembros, idUsuario],
  );

  const baseTipo = useMemo(
    () =>
      temporales.filter(
        (c) => (tipo === 'todos' || c.idCategoriaCartera === tipo) && (carteraId === 'todas' || c.idCartera === carteraId),
      ),
    [temporales, tipo, carteraId],
  );

  const enVista = useMemo(
    () => (fase === 'todos' ? baseTipo : baseTipo.filter((c) => faseTemporal(c) === fase)),
    [baseTipo, fase],
  );

  const idsVista = useMemo(() => new Set(enVista.map((c) => c.idCartera)), [enVista]);

  const movsVista = useMemo(
    () => transacciones.filter((t) => idsVista.has(t.idCartera)),
    [transacciones, idsVista],
  );

  const movsDe = (id: number) => movsVista.filter((t) => t.idCartera === id);

  /* ------------------------------- KPIs ------------------------------- */

  const gastado = sumar(movsVista, 'gasto');
  const ingreso = sumar(movsVista, 'ingreso');
  const tickets = movsVista.filter((t) => t.tipo === 'gasto');

  const contadores = useMemo(
    () => ({
      'en-curso': baseTipo.filter((c) => faseTemporal(c) === 'en-curso').length,
      proximos: baseTipo.filter((c) => faseTemporal(c) === 'proximos').length,
      finalizados: baseTipo.filter((c) => faseTemporal(c) === 'finalizados').length,
    }),
    [baseTipo],
  );

  const notaFases = useMemo(() => {
    const partes: string[] = [];
    if (contadores['en-curso'] > 0) partes.push(`${contadores['en-curso']} en curso`);
    if (contadores.proximos > 0) partes.push(`${contadores.proximos} próximos`);
    if (contadores.finalizados > 0) partes.push(`${contadores.finalizados} finalizados`);
    return partes.join(' · ');
  }, [contadores]);

  const ritmos = useMemo(
    () =>
      enVista
        .map((cartera) => ({
          cartera,
          datos: diasProyecto(cartera),
          ritmo: gastoPorDiaProyecto(cartera, movsDe(cartera.idCartera)),
        }))
        .filter((fila): fila is { cartera: (typeof enVista)[number]; datos: NonNullable<ReturnType<typeof diasProyecto>>; ritmo: number } => fila.ritmo !== null && fila.datos !== null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enVista, movsVista],
  );

  const categorias = useMemo(() => gastosPorCategoria(movsVista, CATEGORIAS_GASTO, 6), [movsVista]);
  const dominante = categorias[0];
  const porcentajeDominante = dominante && gastado > 0 ? Math.round((dominante.valor / gastado) * 100) : 0;

  const filasAportes = useMemo(() => {
    const mapa = new Map<number, { pagado: number; aportado: number }>();
    for (const t of movsVista) {
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
  }, [movsVista, usuarios]);

  /* --------------------------- presupuesto y saldos -------------------- */

  const presupuestos = useMemo(() => filasPresupuesto(enVista, movsVista), [enVista, movsVista]);
  const saldos = useMemo(
    () => agregarSaldos(enVista, movsVista, miembros, usuarios),
    [enVista, movsVista, miembros, usuarios],
  );

  const proyectoUnico = enVista.length === 1 ? enVista[0] : null;
  const curva = useMemo(
    () => (proyectoUnico ? serieAcumuladaGasto(movsDe(proyectoUnico.idCartera)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [proyectoUnico, movsVista],
  );
  const referenciaCurva = useMemo(() => {
    const fila = proyectoUnico ? presupuestos.find((f) => f.cartera.idCartera === proyectoUnico.idCartera) : undefined;
    return {
      valor: fila?.base ?? 0,
      etiqueta: proyectoUnico?.presupuestoInicial ? 'Presupuesto' : 'Aportado',
    };
  }, [proyectoUnico, presupuestos]);

  const comparativa = useMemo(
    () =>
      enVista
        .map((cartera) => {
          const fila = presupuestos.find((f) => f.cartera.idCartera === cartera.idCartera);
          return { cartera, gastado: fila?.gastado ?? 0, base: fila?.base ?? 0 };
        })
        .sort((a, b) => b.gastado - a.gastado),
    [enVista, presupuestos],
  );

  const proyectosOrden = useMemo(
    () =>
      [...enVista].sort((a, b) => {
        const fa = a.fechaInicio ?? a.fechaCreacion;
        const fb = b.fechaInicio ?? b.fechaCreacion;
        return fa < fb ? 1 : fa > fb ? -1 : 0;
      }),
    [enVista],
  );

  const categoriaDe = (idCategoria: number) =>
    CATEGORIAS_CARTERA.find((c) => c.idCategoriaCartera === idCategoria)?.nombreCategoriaCartera ?? 'Otro';

  /* ------------------------------ exportación --------------------------- */

  const items: ItemExportacion[] = [
    {
      etiqueta: 'Proyectos (CSV)',
      archivo: nombreConFecha('finanzapp-temporales-proyectos'),
      filas: () => [
        ['Proyecto', 'Tipo', 'Fase', 'Inicio', 'Fin', 'Presupuesto', 'Gastado', 'Disponible', '% avance', 'Días', 'Gasto por día', 'Movimientos'],
        ...proyectosOrden.map((cartera) => {
          const fila = presupuestos.find((f) => f.cartera.idCartera === cartera.idCartera);
          const dias = diasProyecto(cartera);
          const ritmo = gastoPorDiaProyecto(cartera, movsDe(cartera.idCartera));
          return [
            cartera.nombreCartera,
            categoriaDe(cartera.idCategoriaCartera),
            ETIQUETAS_FASE[faseTemporal(cartera)],
            cartera.fechaInicio ? fechaNumerica(cartera.fechaInicio) : '',
            cartera.fechaFin ? fechaNumerica(cartera.fechaFin) : '',
            fila?.base ?? 0,
            fila?.gastado ?? 0,
            fila?.disponible ?? 0,
            fila?.avance ?? 0,
            dias ? dias.duracion : '',
            ritmo !== null ? ritmo : '',
            movsDe(cartera.idCartera).length,
          ];
        }),
      ],
    },
    {
      etiqueta: 'Movimientos (CSV)',
      archivo: nombreConFecha('finanzapp-temporales-movimientos'),
      filas: () => [
        ['Fecha', 'Proyecto', 'Tipo', 'Categoría', 'Descripción', 'Responsable', 'Método', 'Monto (MXN)'],
        ...movsVista.map((t) => [
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
      archivo: nombreConFecha('finanzapp-temporales-saldos'),
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
    setTipo('todos');
    setCarteraId('todas');
    setFase('todos');
  };

  if (temporales.length === 0) {
    return (
      <EmptyState
        titulo="Aún no tienes proyectos temporales"
        descripcion="Las carteras de Viaje, Evento u Otro tienen fecha de inicio y fin. Crea una para seguir su avance contra el presupuesto."
        icono="globe"
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Filtros */}
      <Card className="no-print" sx={{ p: 2 }}>
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr 1.4fr' } }}>
          <TextField
            select
            label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
          >
            <MenuItem value="todos">Todos los temporales</MenuItem>
            {TIPOS_TEMPORALES.map((opcion) => (
              <MenuItem key={opcion.id} value={opcion.id}>{opcion.etiqueta}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Proyecto"
            value={carteraId}
            onChange={(e) => setCarteraId(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
          >
            <MenuItem value="todas">Todos los proyectos</MenuItem>
            {temporales
              .filter((c) => tipo === 'todos' || c.idCategoriaCartera === tipo)
              .map((c) => (
                <MenuItem key={c.idCartera} value={c.idCartera}>{c.nombreCartera}</MenuItem>
              ))}
          </TextField>
          <TextField
            select
            label="Fase"
            value={fase}
            onChange={(e) => setFase(e.target.value as FaseTemporal | 'todos')}
          >
            <MenuItem value="todos">Todas las fases</MenuItem>
            <MenuItem value="en-curso">En curso</MenuItem>
            <MenuItem value="proximos">Próximos</MenuItem>
            <MenuItem value="finalizados">Finalizados</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>
            {enVista.length} {enVista.length === 1 ? 'proyecto' : 'proyectos'} · {moneda(gastado)} gastados · {moneda(ingreso)} aportados
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

      {enVista.length === 0 ? (
        <EmptyState
          titulo="Ningún proyecto con esta selección"
          descripcion="No hay proyectos que coincidan con el tipo, proyecto y fase elegidos. Prueba con otra combinación."
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
          {movsVista.length === 0 && (
            <Box sx={{ borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', px: 2, py: 1.5 }}>
              <Typography sx={{ fontSize: 13, color: '#475569' }}>
                Los proyectos seleccionados aún no tienen movimientos registrados; por ahora solo puedes comparar presupuestos.
              </Typography>
            </Box>
          )}

          {/* KPIs */}
          <Box className="evitar-corte" sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
            <StatCard
              etiqueta="Proyectos"
              valor={enVista.length}
              icono="globe"
              tono="violet"
              formato="numero"
              nota={notaFases}
            />
            <StatCard
              etiqueta="Gastado"
              valor={gastado}
              icono="cart"
              tono="rose"
              nota={`${tickets.length} gastos en ${movsVista.length} movimientos`}
            />
            <StatCard
              etiqueta={enVista.length === 1 ? 'Gasto por día' : 'Mayor ritmo diario'}
              valor={enVista.length === 1 ? (ritmos[0]?.ritmo ?? 0) : ritmos.reduce((maximo, fila) => Math.max(maximo, fila.ritmo), 0)}
              icono="clock"
              tono="amber"
              nota={
                ritmos.length === 0
                  ? 'Define fecha de inicio para calcularlo'
                  : enVista.length === 1
                    ? `${ritmos[0]?.datos.transcurridos ?? 0} de ${ritmos[0]?.datos.duracion ?? 0} días`
                    : `Mayor ritmo: ${[...ritmos].sort((a, b) => b.ritmo - a.ritmo)[0]?.cartera.nombreCartera ?? ''}`
              }
            />
            <StatCard
              etiqueta="Categoría dominante"
              valor={dominante?.valor ?? 0}
              icono="tag"
              tono="blue"
              nota={dominante ? `${dominante.etiqueta} · ${porcentajeDominante}% del gasto` : 'Sin gastos en la selección'}
            />
          </Box>

          {/* Presupuesto con desglose obligatorio por proyecto */}
          <TarjetaPresupuesto
            titulo="Presupuesto vs gastado"
            conteo={`${enVista.length} ${enVista.length === 1 ? 'proyecto' : 'proyectos'}`}
            filas={presupuestos}
          />

          {/* Gráficas */}
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { lg: '1fr 1fr' } }}>
            <Card className="evitar-corte" sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>
                {proyectoUnico ? 'Avance del proyecto (gasto acumulado)' : 'Gastado vs presupuesto por proyecto'}
              </Typography>
              {proyectoUnico ? (
                <LineChart
                  datos={curva}
                  alto={200}
                  color={proyectoUnico.color}
                  referencia={referenciaCurva.valor > 0 ? referenciaCurva.valor : undefined}
                  etiquetaReferencia={referenciaCurva.etiqueta}
                  leyenda={`Gastado · ${proyectoUnico.nombreCartera}`}
                />
              ) : (
                <BarChart
                  datos={comparativa.map((fila) => ({
                    etiqueta: fila.cartera.nombreCartera,
                    valor: fila.gastado,
                    secundario: fila.base,
                  }))}
                  alto={200}
                  color="#7c3aed"
                  mostrarSecundario
                  leyendaPrincipal="Gastado"
                  leyendaSecundario="Presupuesto"
                />
              )}
            </Card>
            <Card className="evitar-corte" sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Gasto por categoría</Typography>
                {dominante && (
                  <Box component="span" sx={{ borderRadius: 999, bgcolor: '#f5f3ff', color: '#7c3aed', px: 1.25, py: 0.4, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Top: {dominante.etiqueta} {porcentajeDominante}%
                  </Box>
                )}
              </Box>
              <GraficaCategorias segmentos={categorias} etiquetaCentro="Gastado" />
            </Card>
          </Box>

          {/* Aportes por integrante */}
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

          {/* Tabla comparativa de proyectos */}
          <Card className="evitar-corte" sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, pb: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Detalle por proyecto</Typography>
            </Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 860 }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', borderBottom: '1px solid #e2e8f0' } }}>
                    <TableCell>Proyecto</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Fase</TableCell>
                    <TableCell>Fechas</TableCell>
                    <TableCell align="right">Presupuesto</TableCell>
                    <TableCell align="right">Gastado</TableCell>
                    <TableCell sx={{ minWidth: 130 }}>Avance</TableCell>
                    <TableCell align="right">Restante</TableCell>
                    <TableCell align="right">Movs.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proyectosOrden.map((cartera) => {
                    const fila = presupuestos.find((f) => f.cartera.idCartera === cartera.idCartera);
                    const estado = faseTemporal(cartera);
                    const dias = diasProyecto(cartera);
                    return (
                      <TableRow key={cartera.idCartera} sx={{ '& td': { fontSize: 13.5, borderBottom: '1px solid #f8fafc' } }}>
                        <TableCell>
                          <Box
                            component={Link}
                            to={`/app/carteras/${cartera.idCartera}`}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontWeight: 600, color: '#0f172a', textDecoration: 'none', '&:hover': { color: '#0d6945' } }}
                          >
                            <Box sx={{ width: 10, height: 10, flexShrink: 0, borderRadius: '50%', bgcolor: cartera.color }} />
                            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                              {cartera.nombreCartera}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#475569' }}>{categoriaDe(cartera.idCategoriaCartera)}</TableCell>
                        <TableCell>
                          <Box component="span" sx={{ borderRadius: 999, bgcolor: COLOR_FASE[estado].bg, color: COLOR_FASE[estado].color, px: 1.25, py: 0.4, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {ETIQUETAS_FASE[estado]}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                          {cartera.fechaInicio ? fechaCorta(cartera.fechaInicio) : '—'}
                          {cartera.fechaFin ? ` → ${fechaCorta(cartera.fechaFin)}` : ''}
                          {dias ? ` · ${dias.duracion} días` : ''}
                        </TableCell>
                        <TableCell align="right">{fila && !fila.sinBase ? moneda(fila.base) : 'Sin definir'}</TableCell>
                        <TableCell align="right">{moneda(fila?.gastado ?? 0)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <ProgressBar
                                valor={fila?.avance ?? 0}
                                color={(fila?.disponible ?? 0) < 0 ? '#e11d48' : cartera.color}
                                altura={8}
                              />
                            </Box>
                            <Typography sx={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: (fila?.disponible ?? 0) < 0 ? '#e11d48' : '#475569' }}>
                              {fila && !fila.sinBase ? `${fila.avance}%` : '—'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: 'nowrap', color: (fila?.disponible ?? 0) < 0 ? '#e11d48' : '#0d6945' }}>
                          {fila ? moneda(fila.disponible) : '—'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#64748b' }}>{movsDe(cartera.idCartera).length}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Saldos y liquidación */}
          <TablaSaldos
            nota="Saldos acumulados de los proyectos seleccionados (no dependen de la fase del filtro)."
            saldos={saldos.saldos}
            liquidaciones={saldos.liquidaciones}
          />
        </>
      )}
    </Box>
  );
}
