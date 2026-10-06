import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FiltroTransacciones, Transaccion } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CarterasService } from '../../core/services/carteras.service';
import { ToastService } from '../../core/services/toast.service';
import { TransaccionesService } from '../../core/services/transacciones.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { fechaCorta, moneda } from '../../core/utils/format';
import { FILTRO_VACIO, filtrar, mesesDisponibles, sumar } from '../../core/utils/finanzas';
import { Icon } from '../../shared/icon';
import { Avatar, ConfirmModal, EmptyState, PageHeader, StatCard } from '../../shared/ui';
import { TransaccionForm } from '../carteras/transaccion-form';

@Component({
  selector: 'app-transacciones',
  imports: [
    RouterLink,
    Icon,
    Avatar,
    ConfirmModal,
    EmptyState,
    PageHeader,
    StatCard,
    TransaccionForm,
  ],
  template: `
    <app-page-header
      titulo="Transacciones"
      descripcion="Registro y gestión de todos los ingresos y gastos de tus carteras, con filtros por tipo, cartera, categoría y mes."
    >
      <button type="button" class="btn btn-primary" (click)="nuevo()">
        <app-icon name="plus" [size]="16" />
        Registrar movimiento
      </button>
    </app-page-header>

    <div class="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
      <app-stat-card etiqueta="Ingresos filtrados" [valor]="ingresos()" icono="trend-up" tono="brand" />
      <app-stat-card etiqueta="Gastos filtrados" [valor]="gastos()" icono="cart" tono="rose" />
      <app-stat-card
        etiqueta="Balance filtrado"
        [valor]="ingresos() - gastos()"
        icono="wallet"
        [tono]="ingresos() - gastos() >= 0 ? 'brand' : 'rose'"
      />
      <app-stat-card
        etiqueta="Movimientos"
        [valor]="filtradas().length"
        formato="numero"
        icono="receipt"
        tono="violet"
        [nota]="'De ' + movimientos().length + ' registros en total'"
      />
    </div>

    <section class="card mt-6 p-5">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div class="relative sm:col-span-2 lg:col-span-2">
          <span class="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
            <app-icon name="search" [size]="16" />
          </span>
          <input
            type="search"
            class="input pl-9"
            placeholder="Buscar por descripción…"
            [value]="filtro().texto"
            (input)="actualizarTexto($any($event.target).value)"
          />
        </div>
        <select class="input" [value]="filtro().tipo" (change)="actualizarTipo($any($event.target).value)">
          <option value="todos">Todos los tipos</option>
          <option value="gasto">Gastos</option>
          <option value="ingreso">Ingresos</option>
        </select>
        <select class="input" [value]="carteraSeleccionada()" (change)="actualizarCartera(+$any($event.target).value)">
          <option [value]="0">Todas las carteras</option>
          @for (cartera of carteras(); track cartera.idCartera) {
            <option [value]="cartera.idCartera">{{ cartera.nombreCartera }}</option>
          }
        </select>
        <select
          class="input"
          [value]="categoriaSeleccionada()"
          (change)="actualizarCategoria(+$any($event.target).value)"
        >
          <option [value]="0">Todas las categorías</option>
          @for (categoria of categorias; track categoria.idCategoriaGasto) {
            <option [value]="categoria.idCategoriaGasto">{{ categoria.nombreGasto }}</option>
          }
        </select>
      </div>

      <div class="mt-3 flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        <span class="shrink-0 text-xs font-semibold tracking-wide text-slate-400 uppercase">Mes</span>
        <button
          type="button"
          class="chip shrink-0 cursor-pointer"
          [class]="filtro().mes === 'todos' ? 'border-brand-300 bg-brand-50 text-brand-800' : ''"
          (click)="actualizarMes('todos')"
        >
          Todos
        </button>
        @for (mes of meses(); track mes.clave) {
          <button
            type="button"
            class="chip shrink-0 cursor-pointer"
            [class]="filtro().mes === mes.clave ? 'border-brand-300 bg-brand-50 text-brand-800' : ''"
            (click)="actualizarMes(mes.clave)"
          >
            {{ mes.etiqueta }}
          </button>
        }
        <button type="button" class="btn btn-ghost btn-sm ml-auto shrink-0" (click)="limpiar()">
          <app-icon name="refresh" [size]="14" />
          Limpiar filtros
        </button>
      </div>
    </section>

    @if (visibles().length) {
      <ul class="card mt-6 divide-y divide-slate-100 md:hidden">
        @for (movimiento of visibles(); track movimiento.idTransaccion) {
          <li class="flex items-start gap-3 p-4">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              [class]="movimiento.tipo === 'ingreso' ? 'bg-brand-50 text-brand-700' : 'bg-rose-50 text-rose-600'"
            >
              <app-icon [name]="movimiento.tipo === 'ingreso' ? 'trend-up' : 'cart'" [size]="18" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-slate-900">{{ movimiento.nota }}</p>
              <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span class="badge bg-slate-100 text-slate-600">{{ movimiento.nombreGasto }}</span>
                <span class="text-xs text-slate-400">
                  {{ fecha(movimiento.fecha) }} · {{ nombreCartera(movimiento.idCartera) }}
                </span>
              </div>
              <p class="mt-1 text-xs text-slate-500">{{ nombreUsuario(movimiento.idUsuario) }}</p>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-2">
              <span
                class="text-sm font-semibold whitespace-nowrap"
                [class]="movimiento.tipo === 'ingreso' ? 'text-brand-700' : 'text-slate-900'"
              >
                {{ movimiento.tipo === 'ingreso' ? '+' : '−' }}{{ moneda(movimiento.monto) }}
              </span>
              <div class="flex gap-1">
                <button type="button" class="btn btn-ghost btn-sm" aria-label="Editar" (click)="editar(movimiento)">
                  <app-icon name="edit" [size]="14" />
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm text-rose-600"
                  aria-label="Eliminar"
                  (click)="eliminar.set(movimiento)"
                >
                  <app-icon name="trash" [size]="14" />
                </button>
              </div>
            </div>
          </li>
        }
      </ul>

      <div class="table-wrap mt-6 hidden md:block">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="th">Fecha</th>
              <th class="th">Descripción</th>
              <th class="th hidden md:table-cell">Cartera</th>
              <th class="th hidden lg:table-cell">Responsable</th>
              <th class="th hidden xl:table-cell">Método</th>
              <th class="th text-right">Monto</th>
              <th class="th text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (movimiento of visibles(); track movimiento.idTransaccion) {
              <tr class="transition-colors hover:bg-slate-50">
                <td class="td whitespace-nowrap">{{ fecha(movimiento.fecha) }}</td>
                <td class="td">
                  <div class="flex items-start gap-3">
                    <span
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      [class]="movimiento.tipo === 'ingreso' ? 'bg-brand-50 text-brand-700' : 'bg-rose-50 text-rose-600'"
                    >
                      <app-icon [name]="movimiento.tipo === 'ingreso' ? 'trend-up' : 'cart'" [size]="16" />
                    </span>
                    <div class="min-w-0">
                      <p class="max-w-[170px] truncate font-medium text-slate-900 sm:max-w-none">
                        {{ movimiento.nota }}
                      </p>
                      <div class="mt-1 flex flex-wrap items-center gap-1.5">
                        <span class="badge bg-slate-100 text-slate-600">{{ movimiento.nombreGasto }}</span>
                        <span class="text-xs text-slate-400 md:hidden">
                          {{ nombreCartera(movimiento.idCartera) }} · {{ nombreUsuario(movimiento.idUsuario) }}
                        </span>
                        <span class="hidden text-xs text-slate-400 md:inline lg:hidden">
                          {{ nombreUsuario(movimiento.idUsuario) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="td hidden md:table-cell">
                  <a
                    [routerLink]="['/app/carteras', movimiento.idCartera]"
                    class="inline-flex items-center gap-2 font-medium text-slate-700 transition-colors hover:text-brand-700"
                  >
                    <span class="h-2.5 w-2.5 rounded-full" [style.background-color]="colorCartera(movimiento.idCartera)"></span>
                    {{ nombreCartera(movimiento.idCartera) }}
                  </a>
                </td>
                <td class="td hidden lg:table-cell">
                  <div class="flex items-center gap-2">
                    <app-avatar [usuario]="usuarioDe(movimiento.idUsuario)" tamano="xs" />
                    <span class="whitespace-nowrap">{{ nombreUsuario(movimiento.idUsuario) }}</span>
                  </div>
                </td>
                <td class="td hidden capitalize xl:table-cell">{{ movimiento.metodoPago }}</td>
                <td class="td text-right">
                  <span
                    class="font-semibold whitespace-nowrap"
                    [class]="movimiento.tipo === 'ingreso' ? 'text-brand-700' : 'text-slate-900'"
                  >
                    {{ movimiento.tipo === 'ingreso' ? '+' : '−' }}{{ moneda(movimiento.monto) }}
                  </span>
                </td>
                <td class="td">
                  <div class="flex justify-end gap-1">
                    <button type="button" class="btn btn-ghost btn-sm" title="Editar" (click)="editar(movimiento)">
                      <app-icon name="edit" [size]="14" />
                    </button>
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm text-rose-600"
                      title="Eliminar"
                      (click)="eliminar.set(movimiento)"
                    >
                      <app-icon name="trash" [size]="14" />
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (visibles().length < filtradas().length) {
        <div class="mt-4 flex justify-center">
          <button type="button" class="btn btn-outline" (click)="limite.set(limite() + 15)">
            Cargar más movimientos
            <app-icon name="chevron-down" [size]="16" />
          </button>
        </div>
      }
    } @else {
      <div class="mt-6">
        <app-empty-state
          titulo="Sin movimientos"
          descripcion="No hay transacciones que coincidan con los filtros. Registra un movimiento o ajusta la búsqueda."
          icono="receipt"
        >
          <button type="button" class="btn btn-primary btn-sm" (click)="nuevo()">
            <app-icon name="plus" [size]="14" />
            Registrar movimiento
          </button>
        </app-empty-state>
      </div>
    }

    <app-transaccion-form
      [abierto]="formAbierto()"
      [transaccion]="enEdicion()"
      (cerrar)="cerrarForm()"
      (guardado)="alGuardar($event)"
    />

    <app-confirm-modal
      [abierto]="eliminar() !== null"
      titulo="Eliminar movimiento"
      [mensaje]="'Se eliminará “' + (eliminar()?.nota ?? '') + '” de la cartera. Esta acción no se puede deshacer.'"
      textoConfirmar="Eliminar"
      (confirmar)="confirmarEliminar()"
      (cerrar)="eliminar.set(null)"
    />
  `,
})
export class Transacciones {
  private readonly auth = inject(AuthService);
  private readonly carterasService = inject(CarterasService);
  private readonly transaccionesService = inject(TransaccionesService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly toast = inject(ToastService);

  protected readonly categorias = this.transaccionesService.categorias;
  protected readonly moneda = moneda;
  protected readonly fecha = fechaCorta;

  protected readonly filtro = signal<FiltroTransacciones>({ ...FILTRO_VACIO });
  protected readonly limite = signal(15);
  protected readonly formAbierto = signal(false);
  protected readonly enEdicion = signal<Transaccion | null>(null);
  protected readonly eliminar = signal<Transaccion | null>(null);

  protected readonly movimientos = computed(() => {
    const usuario = this.auth.usuario();
    if (!usuario) return [];
    const ids = new Set(
      this.carterasService
        .carteras()
        .filter(
          (cartera) =>
            cartera.idPropietario === usuario.idUsuario ||
            this.carterasService.esMiembro(cartera.idCartera, usuario.idUsuario),
        )
        .map((cartera) => cartera.idCartera),
    );
    return this.transaccionesService.transacciones().filter((t) => ids.has(t.idCartera));
  });

  protected readonly carteras = computed(() =>
    this.carterasService
      .carteras()
      .slice()
      .sort((a, b) => a.nombreCartera.localeCompare(b.nombreCartera)),
  );

  protected readonly meses = computed(() => mesesDisponibles(this.movimientos()));

  protected readonly carteraSeleccionada = computed(() =>
    this.filtro().idCartera === 'todas' ? 0 : this.filtro().idCartera,
  );

  protected readonly categoriaSeleccionada = computed(() =>
    this.filtro().idCategoriaGasto === 'todas' ? 0 : this.filtro().idCategoriaGasto,
  );

  protected readonly filtradas = computed(() => filtrar(this.movimientos(), this.filtro()));

  protected readonly visibles = computed(() => this.filtradas().slice(0, this.limite()));

  protected readonly ingresos = computed(() => sumar(this.filtradas(), 'ingreso'));
  protected readonly gastos = computed(() => sumar(this.filtradas(), 'gasto'));

  protected actualizarTexto(texto: string): void {
    this.filtro.update((filtro) => ({ ...filtro, texto }));
    this.limite.set(15);
  }

  protected actualizarTipo(tipo: string): void {
    this.filtro.update((filtro) => ({ ...filtro, tipo: tipo as FiltroTransacciones['tipo'] }));
    this.limite.set(15);
  }

  protected actualizarCartera(idCartera: number): void {
    this.filtro.update((filtro) => ({ ...filtro, idCartera: idCartera === 0 ? 'todas' : idCartera }));
    this.limite.set(15);
  }

  protected actualizarCategoria(idCategoriaGasto: number): void {
    this.filtro.update((filtro) => ({
      ...filtro,
      idCategoriaGasto: idCategoriaGasto === 0 ? 'todas' : idCategoriaGasto,
    }));
    this.limite.set(15);
  }

  protected actualizarMes(mes: string): void {
    this.filtro.update((filtro) => ({ ...filtro, mes }));
    this.limite.set(15);
  }

  protected limpiar(): void {
    this.filtro.set({ ...FILTRO_VACIO });
    this.limite.set(15);
  }

  protected nombreCartera(idCartera: number): string {
    return this.carterasService.porId(idCartera)?.nombreCartera ?? 'Cartera eliminada';
  }

  protected colorCartera(idCartera: number): string {
    return this.carterasService.porId(idCartera)?.color ?? '#94a3b8';
  }

  protected usuarioDe(idUsuario: number) {
    return this.usuariosService.porId(idUsuario) ?? null;
  }

  protected nombreUsuario(idUsuario: number): string {
    const usuario = this.usuariosService.porId(idUsuario);
    return usuario ? `${usuario.nombreUsuario} ${usuario.APaterno}` : '—';
  }

  protected nuevo(): void {
    this.enEdicion.set(null);
    this.formAbierto.set(true);
  }

  protected editar(movimiento: Transaccion): void {
    this.enEdicion.set(movimiento);
    this.formAbierto.set(true);
  }

  protected cerrarForm(): void {
    this.formAbierto.set(false);
    this.enEdicion.set(null);
  }

  protected alGuardar(movimiento: Transaccion): void {
    const editando = this.enEdicion() !== null;
    this.cerrarForm();
    this.toast.mostrar(
      editando
        ? 'Movimiento actualizado correctamente.'
        : `Movimiento de ${moneda(movimiento.monto)} registrado en ${this.nombreCartera(movimiento.idCartera)}.`,
    );
  }

  protected confirmarEliminar(): void {
    const movimiento = this.eliminar();
    if (!movimiento) return;
    this.transaccionesService.eliminar(movimiento.idTransaccion);
    this.eliminar.set(null);
    this.toast.mostrar('Movimiento eliminado.', 'info');
  }
}
