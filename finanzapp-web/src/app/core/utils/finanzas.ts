import {
  BalanceMiembro,
  Cartera,
  CategoriaGasto,
  FiltroTransacciones,
  Liquidacion,
  MiembroCartera,
  ResumenCartera,
  TipoTransaccion,
  Transaccion,
  Usuario,
} from '../models';
import { mesEtiqueta } from './format';

export const FILTRO_VACIO: FiltroTransacciones = {
  texto: '',
  tipo: 'todos',
  idCartera: 'todas',
  idCategoriaGasto: 'todas',
  mes: 'todos',
};

export function ordenarPorFecha(transacciones: Transaccion[]): Transaccion[] {
  return [...transacciones].sort((a, b) =>
    a.fecha === b.fecha ? b.idTransaccion - a.idTransaccion : a.fecha < b.fecha ? 1 : -1,
  );
}

export function sumar(transacciones: Transaccion[], tipo: TipoTransaccion): number {
  return transacciones.reduce((total, t) => (t.tipo === tipo ? total + t.monto : total), 0);
}

export function filtrar(transacciones: Transaccion[], filtro: FiltroTransacciones): Transaccion[] {
  const texto = filtro.texto.trim().toLowerCase();
  return transacciones.filter((t) => {
    if (filtro.tipo !== 'todos' && t.tipo !== filtro.tipo) return false;
    if (filtro.idCartera !== 'todas' && t.idCartera !== filtro.idCartera) return false;
    if (filtro.idCategoriaGasto !== 'todas' && t.idCategoriaGasto !== filtro.idCategoriaGasto) return false;
    if (filtro.mes !== 'todos' && t.fecha.slice(0, 7) !== filtro.mes) return false;
    if (texto && !`${t.nombreGasto} ${t.nota}`.toLowerCase().includes(texto)) return false;
    return true;
  });
}

export function gastosPorCategoria(
  transacciones: Transaccion[],
  categorias: CategoriaGasto[],
  limite = 6,
): { etiqueta: string; valor: number; color: string }[] {
  const mapa = new Map<number, number>();
  for (const t of transacciones) {
    if (t.tipo !== 'gasto') continue;
    mapa.set(t.idCategoriaGasto, (mapa.get(t.idCategoriaGasto) ?? 0) + t.monto);
  }
  return [...mapa.entries()]
    .map(([id, valor]) => {
      const categoria = categorias.find((c) => c.idCategoriaGasto === id);
      return { etiqueta: categoria?.nombreGasto ?? 'Sin categoría', valor, color: categoria?.color ?? '#94a3b8' };
    })
    .sort((a, b) => b.valor - a.valor)
    .slice(0, limite);
}

export function serieMensual(
  transacciones: Transaccion[],
  meses: number,
): { etiqueta: string; valor: number; secundario: number }[] {
  const hoy = new Date();
  const puntos: { clave: string; etiqueta: string; valor: number; secundario: number }[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    puntos.push({ clave, etiqueta: mesEtiqueta(clave), valor: 0, secundario: 0 });
  }
  const indice = new Map(puntos.map((p) => [p.clave, p]));
  for (const t of transacciones) {
    const punto = indice.get(t.fecha.slice(0, 7));
    if (!punto) continue;
    if (t.tipo === 'gasto') punto.valor += t.monto;
    else punto.secundario += t.monto;
  }
  return puntos.map(({ etiqueta, valor, secundario }) => ({ etiqueta, valor, secundario }));
}

export function mesesDisponibles(transacciones: Transaccion[]): { clave: string; etiqueta: string }[] {
  const claves = [...new Set(transacciones.map((t) => t.fecha.slice(0, 7)))].sort().reverse();
  return claves.map((clave) => ({ clave, etiqueta: mesEtiqueta(clave) }));
}

export function liquidar(saldos: BalanceMiembro[]): Liquidacion[] {
  const deudores = saldos
    .filter((s) => s.saldo < -1)
    .map((s) => ({ usuario: s.usuario, resto: -s.saldo }))
    .sort((a, b) => b.resto - a.resto);
  const acreedores = saldos
    .filter((s) => s.saldo > 1)
    .map((s) => ({ usuario: s.usuario, resto: s.saldo }))
    .sort((a, b) => b.resto - a.resto);

  const liquidaciones: Liquidacion[] = [];
  let i = 0;
  let j = 0;
  while (i < deudores.length && j < acreedores.length) {
    const monto = Math.min(deudores[i].resto, acreedores[j].resto);
    if (monto > 1) liquidaciones.push({ de: deudores[i].usuario, para: acreedores[j].usuario, monto });
    deudores[i].resto -= monto;
    acreedores[j].resto -= monto;
    if (deudores[i].resto <= 1) i++;
    if (acreedores[j].resto <= 1) j++;
  }
  return liquidaciones;
}

export interface AporteUsuario {
  aportado: number;
  gastado: number;
  movimientos: number;
}

export function aportesPorUsuario(transacciones: Transaccion[]): Map<number, AporteUsuario> {
  const mapa = new Map<number, AporteUsuario>();
  for (const t of transacciones) {
    const actual = mapa.get(t.idUsuario) ?? { aportado: 0, gastado: 0, movimientos: 0 };
    actual.aportado += t.monto;
    if (t.tipo === 'gasto') actual.gastado += t.monto;
    actual.movimientos += 1;
    mapa.set(t.idUsuario, actual);
  }
  return mapa;
}

export function calcularResumen(
  cartera: Cartera,
  movimientos: Transaccion[],
  miembros: MiembroCartera[],
  usuarios: Usuario[],
): ResumenCartera {
  const totalIngresos = sumar(movimientos, 'ingreso');
  const totalGastos = sumar(movimientos, 'gasto');
  const base = cartera.presupuestoInicial ?? totalIngresos;
  const cuotaPorMiembro = miembros.length ? totalGastos / miembros.length : 0;

  const saldos: BalanceMiembro[] = miembros
    .map((m) => {
      const usuario = usuarios.find((u) => u.idUsuario === m.idUsuario);
      if (!usuario) return null;
      const propios = movimientos.filter((t) => t.idUsuario === m.idUsuario);
      const pagado = propios
        .filter((t) => t.tipo === 'gasto')
        .reduce((total, t) => total + t.monto, 0);
      const aportado = propios
        .filter((t) => t.tipo === 'ingreso')
        .reduce((total, t) => total + t.monto, 0);
      return {
        usuario,
        pagado,
        aportado,
        cuota: cuotaPorMiembro,
        saldo: pagado - cuotaPorMiembro,
        movimientos: propios.length,
      } satisfies BalanceMiembro;
    })
    .filter((s): s is BalanceMiembro => s !== null)
    .sort((a, b) => b.pagado - a.pagado);

  return {
    totalIngresos,
    totalGastos,
    disponible: base - totalGastos,
    movimientos: movimientos.length,
    cuotaPorMiembro,
    saldos,
    liquidaciones: liquidar(saldos),
  };
}

export function avancePresupuesto(cartera: Cartera, movimientos: Transaccion[]): number {
  const gastos = sumar(movimientos, 'gasto');
  const base = cartera.presupuestoInicial ?? 0;
  if (!base) return 0;
  return Math.min(100, Math.round((gastos / base) * 100));
}

export const RESUMEN_VACIO: ResumenCartera = {
  totalIngresos: 0,
  totalGastos: 0,
  disponible: 0,
  movimientos: 0,
  cuotaPorMiembro: 0,
  saldos: [],
  liquidaciones: [],
};
