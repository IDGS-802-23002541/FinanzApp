import { hoyISO } from './format';

/**
 * Exportación sin dependencias:
 * - CSV delimitado por «;» con BOM UTF-8 (abre correctamente en Excel es-MX).
 * - Números con dos decimales y coma decimal (formato de Excel en español).
 */
const SEPARADOR = ';';

function escaparCelda(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) return '';
  const texto = typeof valor === 'number' ? valor.toFixed(2).replace('.', ',') : String(valor);
  return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function nombreConFecha(base: string): string {
  return `${base}-${hoyISO()}`;
}

export function exportarCSV(archivo: string, filas: (string | number)[][]): void {
  const contenido = filas.map((fila) => fila.map(escaparCelda).join(SEPARADOR)).join('\r\n');
  const blob = new Blob([`\uFEFF${contenido}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = archivo.endsWith('.csv') ? archivo : `${archivo}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

/** Manda la vista actual al diálogo de impresión (permite «Guardar como PDF»). */
export function imprimir(): void {
  window.print();
}
