import { create } from 'zustand';

export type TipoToast = 'exito' | 'error' | 'info';

export interface Toast {
  id: number;
  texto: string;
  tipo: TipoToast;
}

interface ToastState {
  toasts: Toast[];
  mostrar: (texto: string, tipo?: TipoToast) => void;
  cerrar: (id: number) => void;
}

let contador = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  mostrar(texto, tipo = 'exito') {
    const id = ++contador;
    set((s) => ({ toasts: [...s.toasts, { id, texto, tipo }] }));
    setTimeout(() => useToastStore.getState().cerrar(id), 3800);
  },

  cerrar(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

export function useToasts(): Toast[] {
  return useToastStore((s) => s.toasts);
}
