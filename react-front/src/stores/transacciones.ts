import { create } from 'zustand';
import { TRANSACCIONES } from '../data/mock-data';
import type { Transaccion } from '../types/models';
import { ordenarPorFecha } from '../utils/finanzas';

interface TransaccionesState {
  transacciones: Transaccion[];
  crear: (datos: Omit<Transaccion, 'idTransaccion'>) => Transaccion;
  actualizar: (id: number, cambios: Partial<Transaccion>) => void;
  eliminar: (id: number) => void;
}

export const useTransaccionesStore = create<TransaccionesState>((set, get) => ({
  transacciones: ordenarPorFecha(TRANSACCIONES),

  crear(datos) {
    const siguiente = Math.max(0, ...get().transacciones.map((t) => t.idTransaccion)) + 1;
    const transaccion: Transaccion = { ...datos, idTransaccion: siguiente };
    set((s) => ({ transacciones: ordenarPorFecha([...s.transacciones, transaccion]) }));
    return transaccion;
  },

  actualizar(id, cambios) {
    set((s) => ({
      transacciones: ordenarPorFecha(
        s.transacciones.map((t) => (t.idTransaccion === id ? { ...t, ...cambios } : t)),
      ),
    }));
  },

  eliminar(id) {
    set((s) => ({ transacciones: s.transacciones.filter((t) => t.idTransaccion !== id) }));
  },
}));

/* ------------------------- lectura (no reactiva) ------------------------- */

export function transaccionPorId(id: number): Transaccion | undefined {
  return useTransaccionesStore.getState().transacciones.find((t) => t.idTransaccion === id);
}

/* --------------------------- hooks reactivos ---------------------------- */

export function useTransacciones(): Transaccion[] {
  return useTransaccionesStore((s) => s.transacciones);
}

export function useTransaccionesDeCartera(idCartera: number): Transaccion[] {
  const transacciones = useTransacciones();
  return ordenarPorFecha(transacciones.filter((t) => t.idCartera === idCartera));
}

export function useTransaccionPorId(id: number): Transaccion | undefined {
  const transacciones = useTransacciones();
  return transacciones.find((t) => t.idTransaccion === id);
}
