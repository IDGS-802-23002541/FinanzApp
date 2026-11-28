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
    // Enum crudo: la lista y los reportes filtran por tipo sin volver a pedirlo.
    tipo: cartera.tipo,
    categoria: CATEGORIA_POR_TIPO[cartera.tipo],
    estatus: ESTATUS_POR_ESTADO[cartera.estado],
    rol: ROL_EN_PANTALLA[cartera.rol],
    descripcion: cartera.descripcion ?? '',
    // crudos para precargar el formulario de edicion 
    presupuestoInicial : cartera.presupuestoInicial ?? 0,
    fechaInicio: cartera.fechaInicio ?? '',
    fechaFin: cartera.fechaFin ?? '',
    periodo:
      fechaInicio && fechaFin
        ? `${formatearFecha(fechaInicio)} → ${formatearFecha(fechaFin)}`
        : undefined,
  }
}

function aVistaColaborador(persona) {
  return {
    idUsuario: persona.idUsuario,
    nombre: persona.nombre,
    iniciales: persona.iniciales,
    rol: ROL_EN_PANTALLA[persona.rol] ?? persona.rol,
  }
}

// El detalle necesita resumen, series y colaboradores, la lista no los usa
function aVistaDetalle(cartera) {
  return {
    ...aVistaCartera(cartera),
    presupuestoInicial: cartera.presupuestoInicial ?? 0,
    administrador: cartera.administrador ?? '',
    inicialesAdministrador: cartera.inicialesAdministrador ?? '',
    colaboradores: (cartera.colaboradores ?? []).map(aVistaColaborador),
    resumen: cartera.resumen ?? {
      presupuestoInicial: cartera.presupuestoInicial ?? 0,
      totalIngresos: 0,
      totalGastos: 0,
      saldo: 0,
      disponiblePresupuesto: 0,
    },
    resumenPeriodo: cartera.resumenPeriodo ?? null,
    series: cartera.series ?? {ingresosVsEgresos: [], gastosPorCategoria:[]},
    balance: cartera.balance ?? null,
    fechaCierre: cartera.fechaCierre ?? null,
  }
}

export async function obtenerCartera(id, opciones = {}) {
  // Acepta periodoId suelto (uso antiguo) u objeto con periodoId/desde/hasta.
  let periodoId
  let desde
  let hasta
  if (typeof opciones === 'string' || typeof opciones === 'number') {
    periodoId = opciones
  } else {
    ;({ periodoId, desde, hasta } = opciones)
  }
  const params = new URLSearchParams()
  if (periodoId) params.append('periodoId', String(periodoId))
  if (desde) params.append('desde', desde)
  if (hasta) params.append('hasta', hasta)
  const query = params.toString()

  const { data } = await api.get(`/carteras/${id}${query ? `?${query}` : ''}`)
  return aVistaDetalle(data)
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

// trae las categorias activas de la cartera, tipo filtra ingreso o gasto 
export async function listarCategorias(idCartera, tipo){
  const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : ''
  const { data } = await api.get(`/carteras/${idCartera}/categorias${query}`)
  return data
}

// crea una categoria nueva en la cartera y regresa la que quedo guardada 

export async function crearCategoria(idCartera, {nombre, tipo}){
  const {data} = await api.post(`/carteras/${idCartera}/categorias`, {
    nombre: nombre.trim(),
    tipo,
  })
  return data
}

// registra un ingreso o gasto, el gasto exige categoriaId 
export async function crearTransaccion(idCartera, {tipo, monto, fecha,categoriaId, metodoPago,descripcion}){
  const {data} = await api.post(`/carteras/${idCartera}/transacciones`, {
    tipo,
    monto: Number(monto),
    fecha,
    // el ingreso usa la catgoria aportaciones del backend, solo el gasto manda id 
    ...(tipo === 'GASTO' ? {categoriaId: Number(categoriaId)} : {}),
    metodoPago: metodoPago || undefined,
    descripcion: descripcion?.trim() || undefined,
  })
  return data
}

// Periodos de ingreso de una cartera Hogar.
export async function listarPeriodos(idCartera) {
  const { data } = await api.get(`/carteras/${idCartera}/periodos`)
  return data
}

// Invitacion activa y bitacora de ingresos de la cartera.
export async function obtenerInvitacion(idCartera) {
  const { data } = await api.get(`/carteras/${idCartera}/invitaciones`)
  return data
}

// Genera una invitacion nueva (revoca la anterior).
export async function generarInvitacion(idCartera) {
  const { data } = await api.post(`/carteras/${idCartera}/invitaciones`, {})
  return data
}

// Cierra una cartera Viaje/Evento y devuelve la cartera con su balance.
export async function finalizarCartera(idCartera) {
  const { data } = await api.post(`/carteras/${idCartera}/finalizar`, {})
  return data
}

// Edita una cartera existente. Arma el cuerpo igual que crearCartera,
// pero aqui si se manda descripcion vacia para poder borrarla.
export async function editarCartera(
  idCartera,
  {nombre, categoria, descripcion, presupuesto, fechaInicio, fechaFin}
) {
  const conPeriodo = admitePeriodo(categoria)

  const { data } = await api.put(`/carteras/${idCartera}`,{
    nombre: nombre.trim(),
    // el tipo es de solo lectura: no se manda para no permitir cambiarlo
    descripcion: descripcion.trim(),
    // Hogar no maneja presupuesto ni fechas: se limpian con 0 y null
    presupuestoInicial: conPeriodo ? Number(presupuesto || 0) : 0,
    fechaInicio: conPeriodo ? fechaInicio || null : null,
    fechaFin: conPeriodo ? fechaFin || null : null,
  })

  return data
}

// Inactiva la cartera (borrado logico a ARCHIVADA); no elimina datos.
export async function inactivarCartera(idCartera) {
  const { data } = await api.post(`/carteras/${idCartera}/inactivar`, {})
  return data
}

// Da de baja (borrado logico) a un colaborador de la cartera.
export async function eliminarColaborador(idCartera, idUsuario) {
  const { data } = await api.delete(
    `/carteras/${idCartera}/miembros/${idUsuario}`,
  )
  return data
}

// Da de baja al usuario actual como colaborador de la cartera.
export async function salirCartera(idCartera) {
  const { data } = await api.post(`/carteras/${idCartera}/salir`, {})
  return data
}