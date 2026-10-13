import type {
  BalanceMiembro,
  Cartera,
  CategoriaGasto,
  Liquidacion,
  MiembroCartera,
  Transaccion,
  Usuario,
} from '../types/models';
import { calcularResumen, liquidar, sumar } from './finanzas';
import { aFecha, fechaCorta, hoyISO, mesEtiqueta } from './format';

/* ------------------------------- períodos ------------------------------- */

export type ClavePeriodo = 'mes' | '3m' | '6m' | '12m' | 'anio' | 'todo' | 'personalizado';

export interface Rango {
  desde: string;
  hasta: string;
}

export interface RangoPeriodo extends Rango {
  /** true cuando «desde» quedó después de «hasta» (fechas invertidas). */
  invertido: boolean;
}

export const OPCIONES_PERIODO: { clave: ClavePeriodo; etiqueta: string }[] = [
  { clave: 'mes', etiqueta: 'Este mes' },
  { clave: '3m', etiqueta: 'Últimos 3 meses' },
  { clave: '6m', etiqueta: 'Últimos 6 meses' },
  { clave: '12m', etiqueta: 'Últimos 12 meses' },
  { clave: 'anio', etiqueta: 'Este año' },
  { clave: 'todo', etiqueta: 'Todo el histórico' },
  { clave: 'personalizado', etiqueta: 'Rango personalizado' },
];

export function formatearISO(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

export function sumarDias(iso: string, dias: number): string {
  const fecha = aFecha(iso);
  fecha.setDate(fecha.getDate() + dias);
  return formatearISO(fecha);
}

function primerDiaDelMes(desplazamiento: number): string {
  const hoy = new Date();
  return formatearISO(new Date(hoy.getFullYear(), hoy.getMonth() + desplazamiento, 1));
}

export function rangoDePeriodo(clave: ClavePeriodo, desde?: string, hasta?: string): RangoPeriodo {
  const hoy = hoyISO();
  let inicio: string;
  let fin: string = hoy;
  switch (clave) {
    case 'mes':
      inicio = primerDiaDelMes(0);
      break;
    case '3m':
      inicio = primerDiaDelMes(-2);
      break;
    case '6m':
      inicio = primerDiaDelMes(-5);
      break;
    case '12m':
      inicio = primerDiaDelMes(-11);
      break;
    case 'anio':
      inicio = `${hoy.slice(0, 4)}-01-01`;
      break;
    case 'todo':
      inicio = '2000-01-01';
      break;
    case 'personalizado':
      inicio = desde || primerDiaDelMes(-5);
      fin = hasta || hoy;
      break;
  }
  return { desde: inicio, hasta: fin, invertido: inicio > fin };
}

export function rangoAnterior(rango: Rango): Rango {
  const dias = Math.max(
    1,
    Math.round((aFecha(rango.hasta).getTime() - aFecha(rango.desde).getTime()) / 86400000) + 1,
  );
  const hasta = sumarDias(rango.desde, -1);
  return { desde: sumarDias(hasta, -(dias - 1)), hasta };
}

export function filtrarPorRango(movs: Transaccion[], rango: Rango): Transaccion[] {
  return movs.filter((t) => t.fecha >= rango.desde && t.fecha <= rango.hasta);
}

export function filtrarPorPersona(movs: Transaccion[], idUsuario: number | 'todas'): Transaccion[] {
  if (idUsuario === 'todas') return movs;
  return movs.filter((t) => t.idUsuario === idUsuario);
}

export function mesesEnRango(rango: Rango, max = 24): string[] {
  const claves: string[] = [];
  const fin = aFecha(rango.hasta);
  const cursor = new Date(aFecha(rango.desde).getFullYear(), aFecha(rango.desde).getMonth(), 1);
  while (cursor.getTime() <= fin.getTime() && claves.length < 600) {
    claves.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return claves.slice(-max);
}

export function serieMensualRango(
  movs: Transaccion[],
  meses: string[],
): { etiqueta: string; valor: number; secundario: number }[] {
  const indice = new Map(meses.map((clave) => [clave, { valor: 0, secundario: 0 }]));
  for (const t of movs) {
    const punto = indice.get(t.fecha.slice(0, 7));
    if (!punto) continue;
    if (t.tipo === 'gasto') punto.valor += t.monto;
    else punto.secundario += t.monto;
  }
  return meses.map((clave) => {
    const punto = indice.get(clave);
    return { etiqueta: mesEtiqueta(clave), valor: punto?.valor ?? 0, secundario: punto?.secundario ?? 0 };
  });
}

/* --------------------------- carteras y alcance -------------------------- */

export const CATEGORIA_HOGAR = 1;
export const CATEGORIAS_TEMPORALES = [2, 3, 4];

export function carterasDeUsuario(
  carteras: Cartera[],
  miembros: MiembroCartera[],
  idUsuario: number | null,
): Cartera[] {
  if (idUsuario === null) return [];
  return carteras.filter(
    (c) =>
      c.idPropietario === idUsuario ||
      miembros.some((m) => m.idCartera === c.idCartera && m.idUsuario === idUsuario),
  );
}

export function esHogar(cartera: Cartera): boolean {
  return cartera.idCategoriaCartera === CATEGORIA_HOGAR;
}

export function esTemporal(cartera: Cartera): boolean {
  return CATEGORIAS_TEMPORALES.includes(cartera.idCategoriaCartera);
}

/* -------------------------------- hogar --------------------------------- */

export function promedioMensualGasto(movs: Transaccion[]): number {
  const gastos = movs.filter((t) => t.tipo === 'gasto');
  if (gastos.length === 0) return 0;
  const meses = new Set(gastos.map((t) => t.fecha.slice(0, 7)));
  return sumar(gastos, 'gasto') / meses.size;
}

export interface FilaRecurrencia {
  idCategoriaGasto: number;
  etiqueta: string;
  color: string;
  total: number;
  meses: number;
  mesesTotales: number;
  porcentaje: number;
}

export function recurrenciaCategorias(
  movs: Transaccion[],
  categorias: CategoriaGasto[],
  limite = 8,
): FilaRecurrencia[] {
  const gastos = movs.filter((t) => t.tipo === 'gasto');
  if (gastos.length === 0) return [];
  const total = sumar(gastos, 'gasto');
  const mesesConGasto = new Set(gastos.map((t) => t.fecha.slice(0, 7)));
  const mapa = new Map<number, { total: number; meses: Set<string> }>();
  for (const t of gastos) {
    const actual = mapa.get(t.idCategoriaGasto) ?? { total: 0, meses: new Set<string>() };
    actual.total += t.monto;
    actual.meses.add(t.fecha.slice(0, 7));
    mapa.set(t.idCategoriaGasto, actual);
  }
  return [...mapa.entries()]
    .map(([id, datos]) => {
      const categoria = categorias.find((c) => c.idCategoriaGasto === id);
      return {
        idCategoriaGasto: id,
        etiqueta: categoria?.nombreGasto ?? 'Sin categoría',
        color: categoria?.color ?? '#94a3b8',
        total: datos.total,
        meses: datos.meses.size,
        mesesTotales: mesesConGasto.size,
        porcentaje: total > 0 ? Math.round((datos.total / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, limite);
}

/* ------------------------------ temporales ------------------------------- */

export type FaseTemporal = 'en-curso' | 'proximos' | 'finalizados';

export const ETIQUETAS_FASE: Record<FaseTemporal, string> = {
  'en-curso': 'En curso',
  proximos: 'Próximo',
  finalizados: 'Finalizado',
};

export function faseTemporal(cartera: Cartera, hoy = hoyISO()): FaseTemporal {
  if (cartera.estado === 'inactiva') return 'finalizados';
  if (cartera.fechaInicio && cartera.fechaInicio > hoy) return 'proximos';
  return 'en-curso';
}

export interface DiasProyecto {
  duracion: number;
  transcurridos: number;
  restantes: number;
}

export function diasProyecto(cartera: Cartera, hoy = hoyISO()): DiasProyecto | null {
  if (!cartera.fechaInicio) return null;
  const inicio = cartera.fechaInicio;
  const fin = cartera.fechaFin ?? (cartera.estado === 'inactiva' ? cartera.fechaCierre : undefined);
  const referenciaFin = fin ?? hoy;

  const dias = (a: string, b: string) =>
    Math.round((aFecha(b).getTime() - aFecha(a).getTime()) / 86400000) + 1;

  const duracion = Math.max(1, inicio <= referenciaFin ? dias(inicio, referenciaFin) : 1);
  if (hoy < inicio) return { duracion, transcurridos: 0, restantes: duracion };
  const corte = hoy > referenciaFin ? referenciaFin : hoy;
  const transcurridos = Math.min(duracion, Math.max(1, dias(inicio, corte)));
  return { duracion, transcurridos, restantes: Math.max(0, duracion - transcurridos) };
}

export function gastoPorDiaProyecto(cartera: Cartera, movsDeCartera: Transaccion[]): number | null {
  const datos = diasProyecto(cartera);
  if (!datos) return null;
  const gasto = sumar(movsDeCartera, 'gasto');
  return gasto / Math.max(1, datos.transcurridos);
}

export function serieAcumuladaGasto(
  movs: Transaccion[],
  maxPuntos = 48,
): { etiqueta: string; valor: number }[] {
  const porDia = new Map<string, number>();
  for (const t of movs) {
    if (t.tipo !== 'gasto') continue;
    porDia.set(t.fecha, (porDia.get(t.fecha) ?? 0) + t.monto);
  }
  const dias = [...porDia.keys()].sort();
  let acumulado = 0;
  let puntos = dias.map((dia) => {
    acumulado += porDia.get(dia) ?? 0;
    return { etiqueta: fechaCorta(dia), valor: acumulado };
  });
  if (puntos.length > maxPuntos) {
    const paso = Math.ceil(puntos.length / maxPuntos);
    const reducidos = puntos.filter((_, i) => i % paso === 0);
    const ultimo = puntos[puntos.length - 1];
    if (reducidos[reducidos.length - 1] !== ultimo) reducidos.push(ultimo);
    puntos = reducidos;
  }
  return puntos;
}

/* ------------------------------ presupuestos ----------------------------- */

export interface FilaPresupuesto {
  cartera: Cartera;
  base: number;
  gastado: number;
  disponible: number;
  avance: number;
  sinBase: boolean;
}

export function filasPresupuesto(carteras: Cartera[], movs: Transaccion[]): FilaPresupuesto[] {
  return carteras.map((cartera) => {
    const propios = movs.filter((t) => t.idCartera === cartera.idCartera);
    const gastado = sumar(propios, 'gasto');
    const ingresos = sumar(propios, 'ingreso');
    const base = cartera.presupuestoInicial ?? ingresos;
    return {
      cartera,
      base,
      gastado,
      disponible: base - gastado,
      avance: base > 0 ? Math.min(100, Math.round((gastado / base) * 100)) : 0,
      sinBase: !cartera.presupuestoInicial && ingresos === 0,
    };
  });
}

/* --------------------------------- saldos -------------------------------- */

export interface SaldosDeAlcance {
  saldos: BalanceMiembro[];
  liquidaciones: Liquidacion[];
}

/**
 * Netea los saldos de varias carteras por persona (pagado − cuota acumulados)
 * y calcula las transferencias mínimas del conjunto.
 */
export function agregarSaldos(
  carteras: Cartera[],
  movs: Transaccion[],
  miembros: MiembroCartera[],
  usuarios: Usuario[],
): SaldosDeAlcance {
  const porUsuario = new Map<number, BalanceMiembro>();
  for (const cartera of carteras) {
    const movsCartera = movs.filter((t) => t.idCartera === cartera.idCartera);
    const miembrosCartera = miembros.filter((m) => m.idCartera === cartera.idCartera);
    const resumen = calcularResumen(cartera, movsCartera, miembrosCartera, usuarios);
    for (const saldo of resumen.saldos) {
      const actual = porUsuario.get(saldo.usuario.idUsuario);
      if (actual) {
        actual.pagado += saldo.pagado;
        actual.aportado += saldo.aportado;
        actual.cuota += saldo.cuota;
        actual.saldo += saldo.saldo;
        actual.movimientos += saldo.movimientos;
      } else {
        porUsuario.set(saldo.usuario.idUsuario, { ...saldo });
      }
    }
  }
  const saldos = [...porUsuario.values()].sort((a, b) => b.pagado - a.pagado);
  return { saldos, liquidaciones: liquidar(saldos) };
}
