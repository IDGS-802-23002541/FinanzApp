import { Injectable, signal } from '@angular/core';

export type TipoToast = 'exito' | 'error' | 'info';

export interface Toast {
  id: number;
  texto: string;
  tipo: TipoToast;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private contador = 0;
  private readonly lista = signal<Toast[]>([]);

  readonly toasts = this.lista.asReadonly();

  mostrar(texto: string, tipo: TipoToast = 'exito'): void {
    const id = ++this.contador;
    this.lista.update((toasts) => [...toasts, { id, texto, tipo }]);
    setTimeout(() => this.cerrar(id), 3800);
  }

  cerrar(id: number): void {
    this.lista.update((toasts) => toasts.filter((t) => t.id !== id));
  }
}
