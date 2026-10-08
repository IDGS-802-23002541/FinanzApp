export type RolUsuario = 'admin' | 'miembro';
export type TipoTransaccion = 'ingreso' | 'gasto';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';
export type EstadoCartera = 'activa' | 'inactiva';
export type NombreCategoriaCartera = 'Hogar' | 'Viaje' | 'Evento' | 'Otro';

export interface Usuario {
  idUsuario: number;
  nombreUsuario: string;
  APaterno: string;
  AMaterno: string;
  correo: string;
  contrasena: string;
  rol: RolUsuario;
  telefono: string;
  fechaCreacion: string;
  color: string;
}

export interface CategoriaCartera {
  idCategoriaCartera: number;
  nombreCategoriaCartera: NombreCategoriaCartera;
  descripcion: string;
  icono: string;
  color: string;
}

export interface Cartera {
  idCartera: number;
  nombreCartera: string;
  descripcion: string;
  idCategoriaCartera: number;
  idPropietario: number;
  presupuestoInicial: number | null;
  estado: EstadoCartera;
  fechaCreacion: string;
  fechaInicio?: string;
  fechaFin?: string;
  fechaCierre?: string;
  codigoInvitacion: string;
  color: string;
}

export interface MiembroCartera {
  idMiembro: number;
  idCartera: number;
  idUsuario: number;
  rol: RolUsuario;
  aporteComprometido: number | null;
  fechaUnion: string;
}

export interface CategoriaGasto {
  idCategoriaGasto: number;
  nombreGasto: string;
  icono: string;
  color: string;
}

export interface Transaccion {
  idTransaccion: number;
  idCartera: number;
  idUsuario: number;
  idCategoriaGasto: number;
  nombreGasto: string;
  tipo: TipoTransaccion;
  monto: number;
  fecha: string;
  metodoPago: MetodoPago;
  nota: string;
}

export interface BalanceMiembro {
  usuario: Usuario;
  pagado: number;
  aportado: number;
  cuota: number;
  saldo: number;
  movimientos: number;
}

export interface Liquidacion {
  de: Usuario;
  para: Usuario;
  monto: number;
}

export interface ResumenCartera {
  totalIngresos: number;
  totalGastos: number;
  disponible: number;
  movimientos: number;
  cuotaPorMiembro: number;
  saldos: BalanceMiembro[];
  liquidaciones: Liquidacion[];
}

export interface FiltroTransacciones {
  texto: string;
  tipo: TipoTransaccion | 'todos';
  idCartera: number | 'todas';
  idCategoriaGasto: number | 'todas';
  mes: string | 'todos';
}
