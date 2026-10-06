import type { Transaccion } from '../../types/models';

export interface TransaccionFormProps {
  abierto: boolean;
  /** null = registrar nuevo; con valor = editar */
  transaccion: Transaccion | null;
  /** Si viene, la cartera queda fija (no se muestra selector) */
  idCarteraFija?: number | null;
  /** Si viene, el responsable queda fijo */
  idUsuarioFija?: number | null;
  onCerrar: () => void;
  onGuardado: (transaccion: Transaccion) => void;
}

export function TransaccionForm(_props: TransaccionFormProps) {
  return null;
}
