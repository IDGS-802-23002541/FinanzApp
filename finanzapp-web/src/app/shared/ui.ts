import { Component, computed, input, output } from '@angular/core';
import { Usuario } from '../core/models';
import { iniciales, moneda, monedaCompacta, nombreCompleto } from '../core/utils/format';
import { Icon } from './icon';

@Component({
  selector: 'app-avatar',
  template: `
    <span
      class="inline-flex items-center justify-center rounded-full font-bold text-white ring-2 ring-white"
      [class]="clase()"
      [style.background-color]="usuario()?.color ?? '#94a3b8'"
      [title]="titulo()"
    >
      {{ texto() }}
    </span>
  `,
})
export class Avatar {
  readonly usuario = input<Usuario | null>(null);
  readonly tamano = input<'xs' | 'sm' | 'md' | 'lg'>('md');

  private readonly medidas: Record<string, string> = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-16 w-16 text-lg',
  };

  protected readonly clase = computed(() => this.medidas[this.tamano()]);
  protected readonly texto = computed(() => iniciales(this.usuario()));
  protected readonly titulo = computed(() => nombreCompleto(this.usuario()));
}

@Component({
  selector: 'app-avatar-stack',
  imports: [Avatar],
  template: `
    <div class="flex items-center">
      @for (usuario of visibles(); track usuario.idUsuario) {
        <app-avatar [usuario]="usuario" tamano="sm" class="-ml-2 first:ml-0" />
      }
      @if (restantes() > 0) {
        <span class="z-10 -ml-2 inline-flex h-9 items-center rounded-full bg-slate-100 px-2.5 text-xs font-semibold text-slate-600 ring-2 ring-white">
          +{{ restantes() }}
        </span>
      }
    </div>
  `,
})
export class AvatarStack {
  readonly usuarios = input<Usuario[]>([]);
  readonly limite = input(4);

  protected readonly visibles = computed(() => this.usuarios().slice(0, this.limite()));
  protected readonly restantes = computed(() => Math.max(0, this.usuarios().length - this.limite()));
}

export type Tono = 'brand' | 'rose' | 'blue' | 'amber' | 'violet' | 'slate';

@Component({
  selector: 'app-stat-card',
  imports: [Icon],
  template: `
    <div class="card p-4 sm:p-6">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-medium text-slate-500 sm:text-sm">{{ etiqueta() }}</p>
          <p class="mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:mt-2 sm:text-2xl">{{ valorFormateado() }}</p>
        </div>
        <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11" [class]="claseIcono()">
          <app-icon [name]="icono()" [size]="20" />
        </span>
      </div>
      @if (tendencia() !== null) {
        <p class="mt-2.5 flex items-center gap-1.5 text-xs font-semibold sm:mt-3" [class]="claseTendencia()">
          <app-icon [name]="tendencia()! >= 0 ? 'trend-up' : 'trend-down'" [size]="14" />
          {{ tendencia()! >= 0 ? '+' : '' }}{{ tendencia() }}%
          @if (nota()) {
            <span class="font-medium text-slate-400">{{ nota() }}</span>
          }
        </p>
      } @else if (nota()) {
        <p class="mt-2.5 text-xs font-medium text-slate-500 sm:mt-3">{{ nota() }}</p>
      }
    </div>
  `,
})
export class StatCard {
  readonly etiqueta = input.required<string>();
  readonly valor = input.required<number>();
  readonly icono = input('wallet');
  readonly tono = input<Tono>('brand');
  readonly formato = input<'moneda' | 'compacto' | 'numero'>('moneda');
  readonly nota = input('');
  readonly tendencia = input<number | null>(null);

  private readonly tonos: Record<Tono, string> = {
    brand: 'bg-brand-50 text-brand-700',
    rose: 'bg-rose-50 text-rose-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  protected readonly claseIcono = computed(() => this.tonos[this.tono()]);

  protected readonly claseTendencia = computed(() =>
    (this.tendencia() ?? 0) >= 0 ? 'text-brand-700' : 'text-rose-600',
  );

  protected readonly valorFormateado = computed(() => {
    const valor = this.valor();
    if (this.formato() === 'numero') return String(valor);
    if (this.formato() === 'compacto') return monedaCompacta(valor);
    return moneda(valor);
  });
}

@Component({
  selector: 'app-progress',
  template: `
    <div class="w-full overflow-hidden rounded-full bg-slate-100" [class]="altura()">
      <div
        class="h-full rounded-full transition-all duration-500"
        [style.width.%]="valor()"
        [style.background-color]="color()"
      ></div>
    </div>
  `,
})
export class ProgressBar {
  readonly valor = input.required<number>();
  readonly color = input('#108354');
  readonly altura = input('h-2.5');
}

@Component({
  selector: 'app-empty-state',
  imports: [Icon],
  template: `
    <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
      <span class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <app-icon [name]="icono()" [size]="24" />
      </span>
      <p class="text-sm font-semibold text-slate-800">{{ titulo() }}</p>
      <p class="mt-1 max-w-sm text-sm text-slate-500">{{ descripcion() }}</p>
      <div class="mt-5 empty:hidden">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyState {
  readonly titulo = input('Sin información');
  readonly descripcion = input('Aquí aparecerán los datos cuando estén disponibles.');
  readonly icono = input('search');
}

@Component({
  selector: 'app-page-header',
  template: `
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{{ titulo() }}</h1>
        @if (descripcion()) {
          <p class="mt-1.5 max-w-2xl text-sm text-slate-500">{{ descripcion() }}</p>
        }
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <ng-content />
      </div>
    </div>
  `,
})
export class PageHeader {
  readonly titulo = input.required<string>();
  readonly descripcion = input('');
}

@Component({
  selector: 'app-modal',
  imports: [Icon],
  host: { '(document:keydown.escape)': 'alEscape()' },
  template: `
    @if (abierto()) {
      <div
        class="animate-aparecer fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-6"
        (click)="cerrar.emit()"
      >
        <div
          class="animate-elevar max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
          [class]="anchoClase()"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 class="text-base font-semibold text-slate-900">{{ titulo() }}</h2>
              @if (subtitulo()) {
                <p class="mt-0.5 text-sm text-slate-500">{{ subtitulo() }}</p>
              }
            </div>
            <button
              type="button"
              class="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              (click)="cerrar.emit()"
              aria-label="Cerrar ventana"
            >
              <app-icon name="close" [size]="18" />
            </button>
          </div>
          <div class="px-5 py-5 sm:px-6">
            <ng-content />
          </div>
          <div class="border-t border-slate-100 px-5 py-4 sm:px-6">
            <ng-content select="[modal-footer]" />
          </div>
        </div>
      </div>
    }
  `,
})
export class Modal {
  readonly abierto = input(false);
  readonly titulo = input('');
  readonly subtitulo = input('');
  readonly ancho = input<'sm' | 'md' | 'lg'>('md');
  readonly cerrar = output<void>();

  protected readonly anchoClase = computed(
    () =>
      ({ sm: 'sm:max-w-md', md: 'sm:max-w-2xl', lg: 'sm:max-w-4xl' })[this.ancho()],
  );

  protected alEscape(): void {
    if (this.abierto()) this.cerrar.emit();
  }
}

@Component({
  selector: 'app-confirm-modal',
  imports: [Modal],
  template: `
    <app-modal [abierto]="abierto()" [titulo]="titulo()" ancho="sm" (cerrar)="cerrar.emit()">
      <p class="text-sm text-slate-600">{{ mensaje() }}</p>
      <div modal-footer class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="btn btn-outline" (click)="cerrar.emit()">{{ textoCancelar() }}</button>
        <button type="button" class="btn" [class]="claseAccion()" (click)="confirmar.emit()">
          {{ textoConfirmar() }}
        </button>
      </div>
    </app-modal>
  `,
})
export class ConfirmModal {
  readonly abierto = input(false);
  readonly titulo = input('¿Confirmar acción?');
  readonly mensaje = input('');
  readonly textoConfirmar = input('Confirmar');
  readonly textoCancelar = input('Cancelar');
  readonly tono = input<'danger' | 'primary'>('danger');
  readonly confirmar = output<void>();
  readonly cerrar = output<void>();

  protected readonly claseAccion = computed(() =>
    this.tono() === 'danger' ? 'btn-danger' : 'btn-primary',
  );
}
