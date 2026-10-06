import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cartera, MiembroCartera, RolUsuario, Usuario } from '../../core/models';
import { CarterasService } from '../../core/services/carteras.service';
import { ToastService } from '../../core/services/toast.service';
import { TransaccionesService } from '../../core/services/transacciones.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { fechaCorta, moneda } from '../../core/utils/format';
import { Icon } from '../../shared/icon';
import { Avatar, ConfirmModal, EmptyState, PageHeader, StatCard } from '../../shared/ui';
import { MiembroForm } from './miembro-form';

interface FilaContribuyente {
  miembro: MiembroCartera;
  usuario: Usuario;
  cartera: Cartera;
  movimientos: number;
  pagado: number;
  aportado: number;
}

@Component({
  selector: 'app-contribuyentes',
  imports: [RouterLink, Icon, Avatar, ConfirmModal, EmptyState, PageHeader, StatCard, MiembroForm],
  template: `
    <app-page-header
      titulo="Contribuyentes"
      descripcion="Consulta y administra a las personas que participan en tus carteras. Puedes filtrar por nombre, cartera o rol."
    >
      <button type="button" class="btn btn-primary" (click)="formAbierto.set(true)">
        <app-icon name="plus" [size]="16" />
        Meter contribuyente
      </button>
    </app-page-header>

    <div class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      <app-stat-card
        etiqueta="Contribuyentes registrados"
        [valor]="filas().length"
        formato="numero"
        icono="users"
        tono="violet"
        [nota]="carterasInvolucradas() + ' carteras con participantes'"
      />
      <app-stat-card
        etiqueta="Pagado por el grupo"
        [valor]="pagadoTotal()"
        icono="wallet"
        tono="brand"
        nota="Gastos atribuidos a cada contribuyente"
      />
      <app-stat-card
        etiqueta="Aporte comprometido"
        [valor]="comprometidoTotal()"
        icono="target"
        tono="slate"
        nota="Monto acordado por los participantes"
      />
    </div>

    <div class="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-wrap gap-2">
        <select class="input sm:w-56" [value]="carteraFiltro()" (change)="carteraFiltro.set(+$any($event.target).value)">
          <option [value]="0">Todas las carteras</option>
          @for (cartera of carterasDisponibles(); track cartera.idCartera) {
            <option [value]="cartera.idCartera">{{ cartera.nombreCartera }}</option>
          }
        </select>
        <select class="input sm:w-44" [value]="rolFiltro()" (change)="rolFiltro.set($any($event.target).value)">
          <option value="todos">Todos los roles</option>
          <option value="admin">Administradores</option>
          <option value="miembro">Miembros</option>
        </select>
      </div>
      <div class="relative lg:w-72">
        <span class="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
          <app-icon name="search" [size]="16" />
        </span>
        <input
          type="search"
          class="input pl-9"
          placeholder="Filtrar por nombre o correo…"
          [value]="texto()"
          (input)="texto.set($any($event.target).value)"
        />
      </div>
    </div>

    @if (filas().length) {
      <ul class="card mt-6 divide-y divide-slate-100 md:hidden">
        @for (fila of filas(); track fila.miembro.idMiembro) {
          <li class="flex items-start gap-3 p-4">
            <app-avatar [usuario]="fila.usuario" tamano="sm" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-slate-900">
                {{ fila.usuario.nombreUsuario }} {{ fila.usuario.APaterno }}
              </p>
              <p class="truncate text-xs text-slate-500">{{ fila.usuario.correo }}</p>
              <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span class="badge bg-slate-100 text-slate-600">{{ fila.cartera.nombreCartera }}</span>
                <span
                  class="badge"
                  [class]="fila.miembro.rol === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'"
                >
                  {{ fila.miembro.rol === 'admin' ? 'Administrador' : 'Miembro' }}
                </span>
                <span class="text-xs text-slate-400">{{ fila.movimientos }} movimientos</span>
              </div>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-2">
              <span class="text-sm font-semibold whitespace-nowrap">{{ moneda(fila.pagado) }}</span>
              <button
                type="button"
                class="btn btn-ghost btn-sm text-rose-600"
                aria-label="Quitar de la cartera"
                (click)="quitar.set(fila)"
              >
                <app-icon name="trash" [size]="14" />
              </button>
            </div>
          </li>
        }
      </ul>

      <div class="table-wrap mt-6 hidden md:block">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="th">Contribuyente</th>
              <th class="th hidden md:table-cell">Cartera</th>
              <th class="th hidden lg:table-cell">Rol</th>
              <th class="th hidden text-right xl:table-cell">Aporte comprometido</th>
              <th class="th text-right">Pagado</th>
              <th class="th hidden text-right xl:table-cell">Movimientos</th>
              <th class="th hidden xl:table-cell">Desde</th>
              <th class="th text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (fila of filas(); track fila.miembro.idMiembro) {
              <tr class="transition-colors hover:bg-slate-50">
                <td class="td">
                  <div class="flex items-center gap-3">
                    <app-avatar [usuario]="fila.usuario" tamano="sm" />
                    <div class="min-w-0">
                      <p class="max-w-[170px] truncate font-medium text-slate-900 sm:max-w-none">
                        {{ fila.usuario.nombreUsuario }} {{ fila.usuario.APaterno }}
                      </p>
                      <p class="max-w-[170px] truncate text-xs text-slate-500 sm:max-w-none">
                        {{ fila.usuario.correo }}
                      </p>
                      <p class="mt-0.5 text-xs font-medium text-slate-400 md:hidden">{{ fila.cartera.nombreCartera }}</p>
                    </div>
                  </div>
                </td>
                <td class="td hidden md:table-cell">
                  <a
                    [routerLink]="['/app/carteras', fila.cartera.idCartera]"
                    class="inline-flex items-center gap-2 font-medium text-slate-700 transition-colors hover:text-brand-700"
                  >
                    <span class="h-2.5 w-2.5 rounded-full" [style.background-color]="fila.cartera.color"></span>
                    {{ fila.cartera.nombreCartera }}
                  </a>
                </td>
                <td class="td hidden lg:table-cell">
                  <span
                    class="badge"
                    [class]="fila.miembro.rol === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'"
                  >
                    {{ fila.miembro.rol === 'admin' ? 'Administrador' : 'Miembro' }}
                  </span>
                </td>
                <td class="td hidden text-right xl:table-cell">{{ moneda(fila.miembro.aporteComprometido ?? 0) }}</td>
                <td class="td text-right font-semibold">{{ moneda(fila.pagado) }}</td>
                <td class="td hidden text-right xl:table-cell">{{ fila.movimientos }}</td>
                <td class="td hidden whitespace-nowrap xl:table-cell">{{ fecha(fila.miembro.fechaUnion) }}</td>
                <td class="td">
                  <div class="flex justify-end">
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm text-rose-600"
                      title="Quitar de la cartera"
                      (click)="quitar.set(fila)"
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
    } @else {
      <div class="mt-6">
        <app-empty-state
          titulo="Sin contribuyentes"
          descripcion="No hay participantes que coincidan con los filtros seleccionados."
          icono="users"
        >
          <button type="button" class="btn btn-primary btn-sm" (click)="formAbierto.set(true)">
            <app-icon name="plus" [size]="14" />
            Meter contribuyente
          </button>
        </app-empty-state>
      </div>
    }

    <app-miembro-form
      [abierto]="formAbierto()"
      [idCartera]="null"
      (cerrar)="formAbierto.set(false)"
      (guardado)="alAgregar($event)"
    />

    <app-confirm-modal
      [abierto]="quitar() !== null"
      titulo="Quitar contribuyente"
      [mensaje]="'Se retirará a ' + (quitar()?.usuario?.nombreUsuario ?? '') + ' de la cartera ' + (quitar()?.cartera?.nombreCartera ?? '') + '. Sus movimientos permanecerán en el historial.'"
      textoConfirmar="Quitar de la cartera"
      (confirmar)="confirmarQuitar()"
      (cerrar)="quitar.set(null)"
    />
  `,
})
export class Contribuyentes {
  private readonly carterasService = inject(CarterasService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly transaccionesService = inject(TransaccionesService);
  private readonly toast = inject(ToastService);

  protected readonly moneda = moneda;
  protected readonly fecha = fechaCorta;

  protected readonly texto = signal('');
  protected readonly carteraFiltro = signal(0);
  protected readonly rolFiltro = signal<RolUsuario | 'todos'>('todos');
  protected readonly formAbierto = signal(false);
  protected readonly quitar = signal<FilaContribuyente | null>(null);

  protected readonly filas = computed(() => {
    const texto = this.texto().trim().toLowerCase();
    const idCartera = this.carteraFiltro();
    const rol = this.rolFiltro();

    return this.carterasService
      .miembros()
      .map((miembro) => this.construirFila(miembro))
      .filter((fila): fila is FilaContribuyente => fila !== null)
      .filter(
        (fila) =>
          (idCartera === 0 || fila.cartera.idCartera === idCartera) &&
          (rol === 'todos' || fila.miembro.rol === rol) &&
          (!texto ||
            `${fila.usuario.nombreUsuario} ${fila.usuario.APaterno} ${fila.usuario.AMaterno} ${fila.usuario.correo}`
              .toLowerCase()
              .includes(texto)),
      )
      .sort((a, b) =>
        a.cartera.nombreCartera === b.cartera.nombreCartera
          ? a.usuario.nombreUsuario.localeCompare(b.usuario.nombreUsuario)
          : a.cartera.nombreCartera.localeCompare(b.cartera.nombreCartera),
      );
  });

  protected readonly carterasDisponibles = computed(() =>
    this.carterasService
      .carteras()
      .slice()
      .sort((a, b) => a.nombreCartera.localeCompare(b.nombreCartera)),
  );

  protected readonly carterasInvolucradas = computed(
    () => new Set(this.filas().map((fila) => fila.cartera.idCartera)).size,
  );

  protected readonly pagadoTotal = computed(() =>
    this.filas().reduce((total, fila) => total + fila.pagado, 0),
  );

  protected readonly comprometidoTotal = computed(() =>
    this.filas().reduce((total, fila) => total + (fila.miembro.aporteComprometido ?? 0), 0),
  );

  private construirFila(miembro: MiembroCartera): FilaContribuyente | null {
    const usuario = this.usuariosService.porId(miembro.idUsuario);
    const cartera = this.carterasService.porId(miembro.idCartera);
    if (!usuario || !cartera) return null;

    const propios = this.transaccionesService
      .porCartera(miembro.idCartera)
      .filter((t) => t.idUsuario === miembro.idUsuario);
    const gastos = propios.filter((t) => t.tipo === 'gasto');

    return {
      miembro,
      usuario,
      cartera,
      movimientos: propios.length,
      pagado: gastos.reduce((total, t) => total + t.monto, 0),
      aportado: propios
        .filter((t) => t.tipo === 'ingreso')
        .reduce((total, t) => total + t.monto, 0),
    };
  }

  protected alAgregar(evento: { nombre: string; cartera?: string }): void {
    this.formAbierto.set(false);
    this.toast.mostrar(`${evento.nombre} se agregó correctamente a la cartera.`);
  }

  protected confirmarQuitar(): void {
    const fila = this.quitar();
    if (!fila) return;
    this.carterasService.eliminarMiembro(fila.miembro.idMiembro);
    this.quitar.set(null);
    this.toast.mostrar('El contribuyente se retiró de la cartera.', 'info');
  }
}
