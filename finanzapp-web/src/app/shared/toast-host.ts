import { Component, inject } from '@angular/core';
import { Icon } from './icon';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  imports: [Icon],
  template: `
    <div class="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6">
      @for (toast of toasts(); track toast.id) {
        <div
          class="animate-elevar pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur"
          [class]="clases(toast.tipo)"
        >
          <span class="mt-0.5" [class]="colorIcono(toast.tipo)">
            <app-icon [name]="icono(toast.tipo)" [size]="18" />
          </span>
          <p class="flex-1 text-sm font-medium text-slate-800">{{ toast.texto }}</p>
          <button
            type="button"
            class="cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/60 hover:text-slate-700"
            (click)="cerrar(toast.id)"
            aria-label="Cerrar notificación"
          >
            <app-icon name="close" [size]="14" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  private readonly servicio = inject(ToastService);

  protected readonly toasts = this.servicio.toasts;

  protected cerrar(id: number): void {
    this.servicio.cerrar(id);
  }

  protected clases(tipo: string): string {
    if (tipo === 'error') return 'border-rose-200 bg-rose-50/95';
    if (tipo === 'info') return 'border-slate-200 bg-white/95';
    return 'border-brand-200 bg-brand-50/95';
  }

  protected colorIcono(tipo: string): string {
    if (tipo === 'error') return 'text-rose-600';
    if (tipo === 'info') return 'text-slate-600';
    return 'text-brand-700';
  }

  protected icono(tipo: string): string {
    if (tipo === 'error') return 'alert';
    if (tipo === 'info') return 'alert';
    return 'check';
  }
}
