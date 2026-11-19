// Llamadas a la API del modulo de pagos recurrentes (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'

const FRECUENCIA_TEXTO = {
  DIARIO: 'Diario',
  SEMANAL: 'Semanal',
  MENSUAL: 'Mensual',
  ANUAL: 'Anual',
}

// El backend maneja ACTIVO/PAUSADO/CANCELADO; la vista usa textos cortos.
const ESTADO_TEXTO = {
  ACTIVO: 'Pendiente',
  PAUSADO: 'Pausado',
  CANCELADO: 'Cancelado',
}

function aVistaPago(pago) {
  return {
    id: pago.idPagoRecurrente,
    carteraId: pago.carteraId,
    categoriaId: pago.categoriaId,
    nombre: pago.nombre,
    monto: pago.monto ?? 0,
    frecuencia: FRECUENCIA_TEXTO[pago.frecuencia] ?? pago.frecuencia,
    fechaInicio: pago.fechaInicio ?? '',
    proximaEjecucion: pago.proximaEjecucion ?? '',
    estado: ESTADO_TEXTO[pago.estado] ?? pago.estado,
  }
}

export async function listarPagos(idCartera) {
  const params = new URLSearchParams({
    carteraId: String(idCartera),
    porPagina: '100',
  })
  const { data } = await api.get(`/pagos-recurrentes?${params}`)
  return {
    pagos: (data?.pagos ?? []).map(aVistaPago),
    paginacion: data?.paginacion ?? null,
  }
}

// Crea un pago recurrente. "fechaCorte" es la fecha desde la que corre.
export async function crearPago({
  carteraId,
  nombre,
  monto,
  frecuencia,
  fechaCorte,
  categoriaId,
}) {
  const { data } = await api.post('/pagos-recurrentes', {
    carteraId: Number(carteraId),
    nombre: nombre.trim(),
    monto: Number(monto),
    frecuencia,
    fechaInicio: fechaCorte,
    categoriaId: categoriaId ? Number(categoriaId) : undefined,
  })
  return data?.pago ? aVistaPago(data.pago) : null
}
