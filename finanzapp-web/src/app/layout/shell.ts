import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Transaccion } from '../core/models';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { moneda, nombreCompleto } from '../core/utils/format';
import { Icon } from '../shared/icon';
import { Avatar } from '../shared/ui';
import { TransaccionForm } from '../features/carteras/transaccion-form';

interface Enlace {
  etiqueta: string;
  ruta: string;
  icono: string;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Avatar, TransaccionForm],
  template: `
    <div class="min-h-screen bg-slate-50 lg:flex">
      <aside class="no-print hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div class="flex items-center justify-between px-5 py-5">
          <a routerLink="/app/carteras" class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white">F</span>
            <span class="text-base font-bold tracking-tight text-slate-900">
              Finanz<span class="text-brand-700">App</span>
            </span>
          </a>
        </div>

        <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-2">
          @for (grupo of grupos; track grupo.nombre) {
            <div>
              <p class="px-3.5 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {{ grupo.nombre }}
              </p>
              <div class="space-y-1">
                @for (enlace of grupo.enlaces; track enlace.ruta) {
                  <a
                    [routerLink]="enlace.ruta"
                    routerLinkActive="nav-link-active"
                    class="nav-link"
                    (click)="cerrarMenu()"
                  >
                    <app-icon [name]="enlace.icono" [size]="19" />
                    <span class="truncate">{{ enlace.etiqueta }}</span>
                  </a>
                }
              </div>
            </div>
          }
        </nav>

        <div class="border-t border-slate-100 p-4">
          <div class="flex items-center gap-3">
            <app-avatar [usuario]="usuario()" tamano="md" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-slate-900">{{ usuario()?.nombreUsuario }}</p>
              <p class="truncate text-xs text-slate-500">{{ usuario()?.correo }}</p>
            </div>
          </div>
          <button type="button" class="btn btn-ghost btn-sm mt-3 w-full justify-start" (click)="salir()">
            <app-icon name="logout" [size]="16" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      @if (menuAbierto()) {
        <div class="no-print fixed inset-0 z-50 lg:hidden">
          <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" (click)="cerrarMenu()"></div>
          <aside class="animate-elevar absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl">
            <div class="flex items-center justify-between px-5 py-5">
              <span class="text-base font-bold tracking-tight text-slate-900">
                Finanz<span class="text-brand-700">App</span>
              </span>
              <button
                type="button"
                class="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                (click)="cerrarMenu()"
                aria-label="Cerrar menú"
              >
                <app-icon name="close" [size]="18" />
              </button>
            </div>
            <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-2">
              @for (grupo of grupos; track grupo.nombre) {
                <div>
                  <p class="px-3.5 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    {{ grupo.nombre }}
                  </p>
                  <div class="space-y-1">
                    @for (enlace of grupo.enlaces; track enlace.ruta) {
                      <a
                        [routerLink]="enlace.ruta"
                        routerLinkActive="nav-link-active"
                        class="nav-link"
                        (click)="cerrarMenu()"
                      >
                        <app-icon [name]="enlace.icono" [size]="19" />
                        <span class="truncate">{{ enlace.etiqueta }}</span>
                      </a>
                    }
                  </div>
                </div>
              }
            </nav>
            <div class="border-t border-slate-100 p-4">
              <p class="truncate text-sm font-semibold text-slate-900">{{ tituloUsuario() }}</p>
              <p class="truncate text-xs text-slate-500">{{ usuario()?.correo }}</p>
              <button type="button" class="btn btn-ghost btn-sm mt-3 w-full justify-start" (click)="salir()">
                <app-icon name="logout" [size]="16" />
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      }

      <div class="flex min-h-screen min-w-0 flex-1 flex-col">
        <header class="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <button
              type="button"
              class="cursor-pointer rounded-xl p-2 text-slate-600 hover:bg-slate-100"
              (click)="menuAbierto.set(true)"
              aria-label="Abrir menú"
            >
              <app-icon name="menu" [size]="20" />
            </button>
            <a routerLink="/app/carteras" class="text-base font-bold tracking-tight text-slate-900">
              Finanz<span class="text-brand-700">App</span>
            </a>
            <app-avatar [usuario]="usuario()" tamano="sm" />
          </div>
        </header>

        <main class="min-w-0 flex-1 px-4 py-6 pb-32 lg:px-8 lg:py-8 lg:pb-10">
          <router-outlet />
        </main>
      </div>

      @if (mostrarFab()) {
        <button
          type="button"
          class="no-print fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-900/30 transition-transform active:scale-95 lg:hidden"
          aria-label="Registrar movimiento"
          (click)="formAbierto.set(true)"
        >
          <app-icon name="plus" [size]="24" />
        </button>
      }

      <nav
        class="no-print fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div class="grid grid-cols-5">
          @for (enlace of enlacesMoviles; track enlace.ruta) {
            <a
              [routerLink]="enlace.ruta"
              routerLinkActive="text-brand-700"
              class="flex min-w-0 flex-col items-center gap-1 px-1 py-3 text-slate-500 transition-colors"
            >
              <app-icon [name]="enlace.icono" [size]="20" />
              <span class="w-full truncate text-center text-[10px] font-semibold">{{ enlace.etiqueta }}</span>
            </a>
          }
        </div>
      </nav>

      <app-transaccion-form
        [abierto]="formAbierto()"
        [transaccion]="null"
        (cerrar)="formAbierto.set(false)"
        (guardado)="alRegistrar($event)"
      />
    </div>
  `,
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly usuario = this.auth.usuario;
  readonly menuAbierto = signal(false);
  readonly formAbierto = signal(false);

  readonly mostrarFab = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map(() => !this.enDetalleDeCartera()),
      startWith(!this.enDetalleDeCartera()),
    ),
    { initialValue: true },
  );

  readonly tituloUsuario = computed(() => nombreCompleto(this.usuario()));

  readonly grupos: { nombre: string; enlaces: Enlace[] }[] = [
    {
      nombre: 'Principal',
      enlaces: [
        { etiqueta: 'Carteras', ruta: '/app/carteras', icono: 'wallet' },
        { etiqueta: 'Transacciones', ruta: '/app/transacciones', icono: 'receipt' },
      ],
    },
    {
      nombre: 'Colaboración',
      enlaces: [
        { etiqueta: 'Contribuyentes', ruta: '/app/contribuyentes', icono: 'users' },
        { etiqueta: 'Carteras inactivas', ruta: '/app/inactivas', icono: 'archive' },
      ],
    },
    {
      nombre: 'Cuenta',
      enlaces: [{ etiqueta: 'Ajustes', ruta: '/app/ajustes', icono: 'settings' }],
    },
  ];

  readonly enlacesMoviles: Enlace[] = [
    { etiqueta: 'Carteras', ruta: '/app/carteras', icono: 'wallet' },
    { etiqueta: 'Movimientos', ruta: '/app/transacciones', icono: 'receipt' },
    { etiqueta: 'Personas', ruta: '/app/contribuyentes', icono: 'users' },
    { etiqueta: 'Inactivas', ruta: '/app/inactivas', icono: 'archive' },
    { etiqueta: 'Ajustes', ruta: '/app/ajustes', icono: 'settings' },
  ];

  private enDetalleDeCartera(): boolean {
    return /^\/app\/carteras\/\d+/.test(this.router.url);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  salir(): void {
    this.auth.salir();
    this.toast.mostrar('Cerraste sesión correctamente.', 'info');
    this.menuAbierto.set(false);
    this.router.navigateByUrl('/');
  }

  protected alRegistrar(movimiento: Transaccion): void {
    this.formAbierto.set(false);
    this.toast.mostrar(`Movimiento de ${moneda(movimiento.monto)} registrado correctamente.`);
  }
}
