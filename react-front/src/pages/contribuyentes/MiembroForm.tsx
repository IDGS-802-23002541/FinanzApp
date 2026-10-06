export interface MiembroFormProps {
  abierto: boolean;
  /** Si viene, la cartera destino queda fija (no se muestra selector) */
  idCartera?: number | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

export function MiembroForm(_props: MiembroFormProps) {
  return null;
}
