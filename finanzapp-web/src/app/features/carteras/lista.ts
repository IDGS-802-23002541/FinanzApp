import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cartera, Transaccion } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CarterasService } from '../../core/services/carteras.service';
import { ToastService } from '../../core/services/toast.service';
import { TransaccionesService } from '../../core/services/transacciones.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { fechaCorta, moneda, nombreCorto } from '../../core/utils/format';
import { avancePresupuesto, calcularResumen, sumar } from '../../core/utils/finanzas';
import { Icon } from '../../shared/icon';
import { Avatar, AvatarStack, ConfirmModal, EmptyState, PageHeader, ProgressBar } from '../../shared/ui';
import { CarteraForm } from './cartera-form';
import { TransaccionForm } from './transaccion-form';

type Vista = 'propias' | 'compartidas';

@Component({
  selector: 'app-lista-carteras',
  imports: [
    RouterLink,
    Icon,
    Avatar,
    AvatarStack,
    CarteraForm,
    TransaccionForm,
    ConfirmModal,
    EmptyState,
    PageHeader,
    ProgressBar,
  ],
  template: `
    <app-page-header
      titulo="Carteras"
      descripcion="Administra las carteras que creaste y consulta aquellas en las que participas como contribuyente."
    >
      <a routerLink="/app/inactivas" class="btn btn-outline">
        <app-icon name="archive" [size]="16" />
        Inactivas
      </a>
      <button type="button" class="btn btn-primary" (click)="nueva()">
        <app-icon name="plus" [size]="16" />
        Nueva cartera
      </button>
    </app-page-header>

    <div class="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1.5 sm:max-w-xl">
      <button
        type="button"
        class="flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
        [class]="vista() === 'propias' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
        (click)="vista.set('propias')"
      >
        <app-icon name="wallet" [size]="16" />
        <span class="truncate">Mis carteras</span>
        <span class="badge shrink-0 bg-brand-50 text-brand-700">{{ misCarteras().length }}</span>
      </button>
      <button
        type="button"
        class="flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
        [class]="vista() === 'compartidas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
        (click)="vista.set('compartidas')"
      >
        <app-icon name="share" [size]="16" />
        <span class="truncate">Compartidas</span>
        <span class="badge shrink-0 bg-slate-200 text-slate-600">{{ colaboraciones().length }}</span>
      </button>
    </div>

    @if (vista() === 'propias') {
      <section class="mt-6">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="chip cursor-pointer transition-colors"
              [class]="categoriaFiltro() === 'todas' ? 'border-brand-300 bg-brand-50 text-brand-800' : ''"
              (click)="categoriaFiltro.set('todas')"
            >
              Todas
            </button>
            @for (categoria of categorias; track categoria.idCategoriaCartera) {
              <button
                type="button"
                class="chip cursor-pointer transition-colors"
                [class]="categoriaFiltro() === categoria.idCategoriaCartera ? 'border-brand-300 bg-brand-50 text-brand-800' : ''"
                (click)="categoriaFiltro.set(categoria.idCategoriaCartera)"
              >
                <app-icon [name]="categoria.icono" [size]="14" />
                {{ categoria.nombreCategoriaCartera }}
              </button>
            }
          </div>

          <div class="relative lg:w-72">
            <span class="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
              <app-icon name="search" [size]="16" />
            </span>
            <input
              type="search"
              class="input pl-9"
              placeholder="Buscar cartera…"
              [value]="busqueda()"
              (input)="busqueda.set($any($event.target).value)"
            />
          </div>
        </div>

        @if (misCarteras().length) {
          <div class="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            @for (cartera of misCarteras(); track cartera.idCartera) {
              <article class="card animate-aparecer overflow-hidden">
                <div class="h-1.5 w-full" [style.background-color]="cartera.color"></div>
                <div class="p-5">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex min-w-0 items-start gap-3">
                      <span
                        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                        [style.background-color]="cartera.color"
                      >
                        <app-icon [name]="iconoCategoria(cartera.idCategoriaCartera)" [size]="20" />
                      </span>
                      <div class="min-w-0">
                        <a
                          [routerLink]="['/app/carteras', cartera.idCartera]"
                          class="block truncate text-base font-semibold text-slate-900 transition-colors hover:text-brand-700"
                        >
                          {{ cartera.nombreCartera }}
                        </a>
                        <div class="mt-1.5 flex flex-wrap items-center gap-2">
                          <span class="badge bg-slate-100 text-slate-600">
                            {{ nombreCategoria(cartera.idCategoriaCartera) }}
                          </span>
                          @if (cartera.fechaInicio) {
                            <span class="chip">
                              <app-icon name="calendar" [size]="13" />
                              {{ fecha(cartera.fechaInicio) }}
                              @if (cartera.fechaFin) {
                                → {{ fecha(cartera.fechaFin) }}
                              }
                            </span>
                          }
                        </div>
                      </div>
                    </div>
                    <app-avatar-stack [usuarios]="usuariosDe(cartera.idCartera)" [limite]="3" />
                  </div>

                  <p class="mt-3 line-clamp-2 text-sm text-slate-600">{{ cartera.descripcion }}</p>

                  <div class="mt-4">
                    <div class="mb-1.5 flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
                      <span>{{ avanceDe(cartera) }}% del presupuesto</span>
                      <span>{{ moneda(gastosDe(cartera.idCartera)) }} gastado</span>
                    </div>
                    <app-progress [valor]="avanceDe(cartera)" [color]="cartera.color" />
                  </div>

                  <dl class="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
                    <div>
                      <dt class="text-[11px] font-medium text-slate-400">Presupuesto</dt>
                      <dd class="mt-0.5 text-sm font-semibold text-slate-900">
                        {{ cartera.presupuestoInicial ? moneda(cartera.presupuestoInicial) : 'Sin definir' }}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-[11px] font-medium text-slate-400">Aportado</dt>
                      <dd class="mt-0.5 text-sm font-semibold text-brand-700">
                        {{ moneda(ingresosDe(cartera.idCartera)) }}
                      </dd>
                    </div>
                    <div>
                      <dt class="text-[11px] font-medium text-slate-400">Movimientos</dt>
                      <dd class="mt-0.5 text-sm font-semibold text-slate-900">
                        {{ movimientosDe(cartera.idCartera) }}
                      </dd>
                    </div>
                  </dl>

                  <div class="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <a [routerLink]="['/app/carteras', cartera.idCartera]" class="btn btn-dark btn-sm flex-1">
                      <app-icon name="eye" [size]="14" />
                      Abrir cartera
                    </a>
                    <button type="button" class="btn btn-outline btn-sm" title="Editar" (click)="editar(cartera)">
                      <app-icon name="edit" [size]="14" />
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" title="Archivar" (click)="archivar.set(cartera)">
                      <app-icon name="archive" [size]="14" />
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline btn-sm text-rose-600"
                      title="Eliminar"
                      (click)="eliminar.set(cartera)"
                    >
                      <app-icon name="trash" [size]="14" />
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        } @else if (todasMisCarteras().length) {
          <div class="mt-5">
            <app-empty-state
              titulo="No hay carteras que coincidan"
              descripcion="Ajusta los filtros de búsqueda para encontrar tus carteras."
              icono="search"
            >
              <button type="button" class="btn btn-outline btn-sm" (click)="limpiarFiltros()">
                <app-icon name="refresh" [size]="14" />
                Limpiar filtros
              </button>
            </app-empty-state>
          </div>
        } @else {
          <div class="mt-5">
            <app-empty-state
              titulo="Todavía no tienes carteras"
              descripcion="Crea una cartera para el hogar, un viaje o un evento y comienza a registrar movimientos."
              icono="wallet"
            >
              <button type="button" class="btn btn-primary btn-sm" (click)="nueva()">
                <app-icon name="plus" [size]="14" />
                Nueva cartera
              </button>
            </app-empty-state>
          </div>
        }
      </section>
    } @else {
      <section class="mt-6">
        <p class="text-sm text-slate-500">
          Soy contribuyente en {{ colaboraciones().length }} carteras de otros usuarios.
        </p>

        @if (colaboraciones().length) {
          <div class="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            @for (cartera of colaboraciones(); track cartera.idCartera) {
              <article class="card animate-aparecer p-5">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex min-w-0 items-start gap-3">
                    <span
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                      [style.background-color]="cartera.color"
                    >
                      <app-icon [name]="iconoCategoria(cartera.idCategoriaCartera)" [size]="20" />
                    </span>
                    <div class="min-w-0">
                      <a
                        [routerLink]="['/app/carteras', cartera.idCartera]"
                        class="block truncate text-base font-semibold text-slate-900 transition-colors hover:text-brand-700"
                      >
                        {{ cartera.nombreCartera }}
                      </a>
                      <p class="mt-1 text-xs text-slate-500">Administrada por {{ nombreAdministrador(cartera) }}</p>
                      <span class="badge mt-2 bg-slate-100 text-slate-600">
                        {{ nombreCategoria(cartera.idCategoriaCartera) }}
                      </span>
                    </div>
                  </div>
                  <app-avatar [usuario]="usuarioDe(cartera.idPropietario)" tamano="sm" />
                </div>

                <dl class="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 text-center">
                  <div>
                    <dt class="text-[11px] font-medium text-slate-400">Mi pagado</dt>
                    <dd class="mt-0.5 text-sm font-bold text-slate-900">{{ moneda(miPagado(cartera)) }}</dd>
                  </div>
                  <div>
                    <dt class="text-[11px] font-medium text-slate-400">Mi cuota</dt>
                    <dd class="mt-0.5 text-sm font-bold text-slate-900">{{ moneda(miCuota(cartera)) }}</dd>
                  </div>
                  <div>
                    <dt class="text-[11px] font-medium text-slate-400">Mi saldo</dt>
                    <dd
                      class="mt-0.5 text-sm font-bold"
                      [class]="miSaldo(cartera) >= 0 ? 'text-brand-700' : 'text-rose-600'"
                    >
                      {{ miSaldo(cartera) >= 0 ? '+' : '' }}{{ moneda(miSaldo(cartera)) }}
                    </dd>
                  </div>
                </dl>

                <div class="mt-4">
                  <div class="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Avance del presupuesto</span>
                    <span>{{ avanceDe(cartera) }}%</span>
                  </div>
                  <app-progress [valor]="avanceDe(cartera)" [color]="cartera.color" />
                </div>

                <div class="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <button type="button" class="btn btn-primary btn-sm flex-1" (click)="registrarGasto(cartera)">
                    <app-icon name="plus" [size]="14" />
                    Registrar gasto
                  </button>
                  <a [routerLink]="['/app/carteras', cartera.idCartera]" class="btn btn-outline btn-sm">
                    <app-icon name="eye" [size]="14" />
                    Ver cartera
                  </a>
                </div>
              </article>
            }
          </div>
        } @else {
          <div class="mt-5">
            <app-empty-state
              titulo="No participo en otras carteras"
              descripcion="Cuando alguien te invite con un código QR, sus carteras aparecerán en esta sección."
              icono="share"
            />
          </div>
        }
      </section>
    }

    <app-cartera-form
      [abierto]="formAbierto()"
      [cartera]="carteraEnEdicion()"
      (cerrar)="formAbierto.set(false)"
      (guardado)="alGuardar($event)"
    />

    <app-transaccion-form
      [abierto]="formGasto()"
      [transaccion]="null"
      [carteraFija]="carteraSeleccionada()"
      [usuarioFijo]="usuarioActual()"
      (cerrar)="formGasto.set(false)"
      (guardado)="alGuardarGasto($event)"
    />

    <app-confirm-modal
      [abierto]="archivar() !== null"
      titulo="Archivar cartera"
      [mensaje]="'La cartera ' + (archivar()?.nombreCartera ?? '') + ' pasará a la sección de inactivas. Podrás reactivarla después.'"
      textoConfirmar="Archivar"
      tono="primary"
      (confirmar)="confirmarArchivar()"
      (cerrar)="archivar.set(null)"
    />

    <app-confirm-modal
      [abierto]="eliminar() !== null"
      titulo="Eliminar cartera"
      [mensaje]="'Se eliminarán la cartera ' + (eliminar()?.nombreCartera ?? '') + ', sus miembros y sus movimientos. Esta acción no se puede deshacer.'"
      textoConfirmar="Eliminar definitivamente"
      (confirmar)="confirmarEliminar()"
      (cerrar)="eliminar.set(null)"
    />
  `,
})
export class ListaCarteras {
  private readonly auth = inject(AuthService);
  private readonly carterasService = inject(CarterasService);
  private readonly transaccionesService = inject(TransaccionesService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly toast = inject(ToastService);

  protected readonly categorias = this.carterasService.categorias;
  protected readonly moneda = moneda;
  protected readonly fecha = fechaCorta;

  protected readonly vista = signal<Vista>('propias');
  protected readonly busqueda = signal('');
  protected readonly categoriaFiltro = signal<number | 'todas'>('todas');

  protected readonly formAbierto = signal(false);
  protected readonly carteraEnEdicion = signal<Cartera | null>(null);
  protected readonly archivar = signal<Cartera | null>(null);
  protected readonly eliminar = signal<Cartera | null>(null);
  protected readonly formGasto = signal(false);
  protected readonly carteraSeleccionada = signal<number | null>(null);

  protected readonly usuarioActual = computed(() => this.auth.usuario()?.idUsuario ?? null);

  protected readonly todasMisCarteras = computed(() => {
    const id = this.usuarioActual() ?? 0;
    return this.carterasService.propiasDe(id, 'activa');
  });

  protected readonly misCarteras = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const categoria = this.categoriaFiltro();
    return this.todasMisCarteras().filter(
      (cartera) =>
        (categoria === 'todas' || cartera.idCategoriaCartera === categoria) &&
        (!texto ||
          cartera.nombreCartera.toLowerCase().includes(texto) ||
          cartera.descripcion.toLowerCase().includes(texto)),
    );
  });

  protected readonly colaboraciones = computed(() => {
    const id = this.usuarioActual();
    return id ? this.carterasService.colaboracionesDe(id) : [];
  });

  protected limpiarFiltros(): void {
    this.busqueda.set('');
    this.categoriaFiltro.set('todas');
  }

  protected nombreCategoria(idCategoria: number): string {
    return this.carterasService.nombreCategoria(idCategoria);
  }

  protected iconoCategoria(idCategoria: number): string {
    return this.carterasService.categoria(idCategoria)?.icono ?? 'tag';
  }

  protected usuariosDe(idCartera: number) {
    return this.carterasService.usuariosDe(idCartera);
  }

  protected usuarioDe(idUsuario: number) {
    return this.usuariosService.porId(idUsuario) ?? null;
  }

  protected nombreAdministrador(cartera: Cartera): string {
    return nombreCorto(this.usuariosService.porId(cartera.idPropietario));
  }

  protected gastosDe(idCartera: number): number {
    return sumar(this.transaccionesService.porCartera(idCartera), 'gasto');
  }

  protected ingresosDe(idCartera: number): number {
    return sumar(this.transaccionesService.porCartera(idCartera), 'ingreso');
  }

  protected movimientosDe(idCartera: number): number {
    return this.transaccionesService.porCartera(idCartera).length;
  }

  protected avanceDe(cartera: Cartera): number {
    return avancePresupuesto(cartera, this.transaccionesService.porCartera(cartera.idCartera));
  }

  protected miPagado(cartera: Cartera): number {
    const idUsuario = this.usuarioActual();
    if (!idUsuario) return 0;
    return this.transaccionesService
      .porCartera(cartera.idCartera)
      .filter((t) => t.idUsuario === idUsuario && t.tipo === 'gasto')
      .reduce((total, t) => total + t.monto, 0);
  }

  protected miCuota(cartera: Cartera): number {
    return calcularResumen(
      cartera,
      this.transaccionesService.porCartera(cartera.idCartera),
      this.carterasService.miembrosDe(cartera.idCartera),
      this.usuariosService.usuarios(),
    ).cuotaPorMiembro;
  }

  protected miSaldo(cartera: Cartera): number {
    return this.miPagado(cartera) - this.miCuota(cartera);
  }

  protected nueva(): void {
    this.carteraEnEdicion.set(null);
    this.formAbierto.set(true);
  }

  protected editar(cartera: Cartera): void {
    this.carteraEnEdicion.set(cartera);
    this.formAbierto.set(true);
  }

  protected alGuardar(cartera: Cartera): void {
    const editando = this.carteraEnEdicion() !== null;
    this.formAbierto.set(false);
    this.carteraEnEdicion.set(null);
    this.toast.mostrar(
      editando ? 'Cartera actualizada correctamente.' : `Cartera "${cartera.nombreCartera}" creada.`,
    );
  }

  protected confirmarArchivar(): void {
    const cartera = this.archivar();
    if (!cartera) return;
    this.carterasService.archivar(cartera.idCartera);
    this.archivar.set(null);
    this.toast.mostrar(`"${cartera.nombreCartera}" se archivó correctamente.`, 'info');
  }

  protected confirmarEliminar(): void {
    const cartera = this.eliminar();
    if (!cartera) return;
    this.carterasService.eliminar(cartera.idCartera);
    this.eliminar.set(null);
    this.toast.mostrar(`"${cartera.nombreCartera}" se eliminó definitivamente.`, 'error');
  }

  protected registrarGasto(cartera: Cartera): void {
    this.carteraSeleccionada.set(cartera.idCartera);
    this.formGasto.set(true);
  }

  protected alGuardarGasto(movimiento: Transaccion): void {
    this.formGasto.set(false);
    const cartera = this.carterasService.porId(movimiento.idCartera);
    this.toast.mostrar(
      `Gasto de ${moneda(movimiento.monto)} registrado en ${cartera?.nombreCartera ?? 'la cartera'}.`,
    );
  }
}
