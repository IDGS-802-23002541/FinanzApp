import type { Usuario } from '../types/models';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function aFecha(iso: string): Date {
  const [anio, mes, dia] = iso.slice(0, 10).split('-').map(Number);
  return new Date(anio, (mes ?? 1) - 1, dia ?? 1);
}

const fmtMoneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

const fmtMonedaDecimales = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtFechaCorta = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtFechaLarga = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtFechaNumerica = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function moneda(valor: number): string {
  return fmtMoneda.format(valor);
}

export function monedaConDecimales(valor: number): string {
  return fmtMonedaDecimales.format(valor);
}

export function monedaCompacta(valor: number): string {
  const abs = Math.abs(valor);
  if (abs >= 1000000) return `$${(valor / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `$${(valor / 1000).toFixed(1)}k`;
  return moneda(valor);
}

export function fechaCorta(iso: string): string {
  return fmtFechaCorta.format(aFecha(iso));
}

export function fechaLarga(iso: string): string {
  return fmtFechaLarga.format(aFecha(iso));
}

export function fechaNumerica(iso: string): string {
  return fmtFechaNumerica.format(aFecha(iso));
}

export function mesEtiqueta(clave: string): string {
  const [anio, mes] = clave.split('-').map(Number);
  return `${MESES[(mes ?? 1) - 1]} ${String(anio).slice(2)}`;
}

export function mesNombre(clave: string): string {
  const [anio, mes] = clave.split('-').map(Number);
  return `${MESES[(mes ?? 1) - 1]} ${anio}`;
}

export function iniciales(usuario: Usuario | null | undefined): string {
  if (!usuario) return '??';
  return `${usuario.nombreUsuario.charAt(0)}${usuario.APaterno.charAt(0)}`.toUpperCase();
}

export function nombreCompleto(usuario: Usuario | null | undefined): string {
  if (!usuario) return 'Usuario eliminado';
  return `${usuario.nombreUsuario} ${usuario.APaterno} ${usuario.AMaterno}`.trim();
}

export function nombreCorto(usuario: Usuario | null | undefined): string {
  if (!usuario) return '—';
  return `${usuario.nombreUsuario} ${usuario.APaterno.charAt(0)}.`;
}

export function porcentaje(parte: number, total: number): number {
  if (!total) return 0;
  return Math.min(100, Math.round((parte / total) * 100));
}

const PALETA = ['#0d6945', '#2563eb', '#7c3aed', '#d97706', '#e11d48', '#0891b2', '#4f46e5', '#65a30d'];

export function colorAleatorio(texto: string): string {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) hash = (hash * 31 + texto.charCodeAt(i)) % 100000;
  return PALETA[hash % PALETA.length];
}

export function hoyISO(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
}
