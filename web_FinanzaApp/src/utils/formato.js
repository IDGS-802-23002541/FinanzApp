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

function fechaISO(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

// Traduce un preset de periodo a un rango de fechas local (YYYY-MM-DD).
// Devuelve null para "todo" o "personalizado".
export function fechasDePreset(preset) {
  if (preset === 'todo' || preset === 'personalizado') return null

  const hoy = new Date()
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const desde = new Date(hasta)

  if (preset === 'mes') desde.setDate(desde.getDate() - 30)
  else if (preset === '3m') desde.setMonth(desde.getMonth() - 3)
  else if (preset === '6m') desde.setMonth(desde.getMonth() - 6)
  else return null

  return { desde: fechaISO(desde), hasta: fechaISO(hasta) }
}
