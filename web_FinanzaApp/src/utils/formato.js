// Formateo de montos (MXN) y fechas (dd/MM/aaaa) bajo la configuración es-MX.

const formateadorMoneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

const formateadorFecha = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatearMonto(monto) {
  return formateadorMoneda.format(monto)
}

// Fecha local; si viene como YYYY-MM-DD evita que UTC mueva el dia.
export function formatearFecha(fecha) {
  if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [anio, mes, dia] = fecha.split('-').map(Number)
    return formateadorFecha.format(new Date(anio, mes - 1, dia))
  }
  return formateadorFecha.format(new Date(fecha))
}
