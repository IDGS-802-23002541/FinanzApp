// Formateo de montos (MXN) y fechas (dd/MM/aaaa) bajo la configuración es-MX.

const formateadorMoneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

const formateadorFecha = new Intl.DateTimeFormat('es-MX')

export function formatearMonto(monto) {
  return formateadorMoneda.format(monto)
}

export function formatearFecha(fecha) {
  return formateadorFecha.format(new Date(fecha))
}
