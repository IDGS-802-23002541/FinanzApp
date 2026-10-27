// Llamadas a la API del módulo de carteras (usar services/apiClient.js).
import { api } from '../../services/apiClient.js'
import { formatearFecha } from '../../utils/formato.js'

// El backend usa enums en mayúsculas y la vista los textos del catálogo;
// la traducción vive aquí para que los componentes no conozcan la API.
const CATEGORIA_POR_TIPO = {
  HOGAR: 'Hogar',
  VIAJE: 'Viaje',
  EVENTO: 'Evento',
  OTRO: 'Otro',
}

const TIPO_POR_CATEGORIA = {
  Hogar: 'HOGAR',
  Viaje: 'VIAJE',
  Evento: 'EVENTO',
  Otro: 'OTRO',
}

const ESTATUS_POR_ESTADO = {
  ACTIVA: 'Activa',
  ARCHIVADA: 'Archivada',
  FINALIZADA: 'Finalizada',
}

const ROL_EN_PANTALLA = {
  PROPIETARIO: 'Propietario',
  COLABORADOR: 'Colaborador',
}

// Traduce la cartera de la API al formato que pintan las tarjetas.
function aVistaCartera(cartera) {
  const { fechaInicio, fechaFin } = cartera

  return {
    id: cartera.id,
    nombre: cartera.nombre,
    categoria: CATEGORIA_POR_TIPO[cartera.tipo],
    estatus: ESTATUS_POR_ESTADO[cartera.estado],
    rol: ROL_EN_PANTALLA[cartera.rol],
    descripcion: cartera.descripcion ?? '',
    periodo:
      fechaInicio && fechaFin
        ? `${formatearFecha(fechaInicio)} → ${formatearFecha(fechaFin)}`
        : undefined,
  }
}

export async function filtrarCarteras(filtros = {}) {
  const params = new URLSearchParams()
  const { estado, tipo, rol, busqueda } = filtros

  if (estado) params.append('estado', estado)
  if (tipo) params.append('tipo', tipo)
  if (rol) params.append('rol', rol)
  if (busqueda) params.append('busqueda', busqueda)

  const query = params.toString()
  const { data } = await api.get(`/carteras${query ? `?${query}` : ''}`)

  return data.map(aVistaCartera)
}

// Regla de negocio: las carteras de tipo Hogar no manejan presupuesto ni fechas.
export function admitePeriodo(categoria) {
  return categoria !== 'Hogar'
}

// Recibe los valores del formulario (textos del catálogo) y los traduce a la API.
export async function crearCartera({
  nombre,
  categoria,
  descripcion,
  presupuesto,
  fechaInicio,
  fechaFin,
}) {
  const conPeriodo = admitePeriodo(categoria)

  const { data } = await api.post('/carteras', {
    nombre: nombre.trim(),
    tipo: TIPO_POR_CATEGORIA[categoria],
    // Los opcionales vacíos se omiten para que el backend use sus defaults.
    descripcion: descripcion.trim() || undefined,
    presupuestoInicial:
      conPeriodo && presupuesto !== '' ? Number(presupuesto) : undefined,
    fechaInicio: conPeriodo && fechaInicio ? fechaInicio : undefined,
    fechaFin: conPeriodo && fechaFin ? fechaFin : undefined,
  })

  return data
}
