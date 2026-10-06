import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink, Icon],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span class="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white">
        <app-icon name="alert" [size]="30" />
      </span>
      <p class="mt-6 text-sm font-bold tracking-widest text-brand-700 uppercase">Error 404</p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Esta página no existe</h1>
      <p class="mt-3 max-w-md text-sm text-slate-500">
        Revisa la dirección o regresa al panel para seguir administrando tus carteras.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a [routerLink]="destino()" class="btn btn-primary">
          <app-icon name="arrow-left" [size]="16" />
          {{ autenticado() ? 'Ir al panel' : 'Volver al inicio' }}
        </a>
        <button type="button" class="btn btn-outline" (click)="atras()">Página anterior</button>
      </div>
    </div>
  `,
})
export class NoEncontrado {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly autenticado = this.auth.autenticado;
  protected readonly destino = () => (this.auth.autenticado() ? '/app/carteras' : '/');

  protected atras(): void {
    history.back();
  }
}
