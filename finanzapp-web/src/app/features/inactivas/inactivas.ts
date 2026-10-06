import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cartera } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CarterasService } from '../../core/services/carteras.service';
import { ToastService } from '../../core/services/toast.service';
import { TransaccionesService } from '../../core/services/transacciones.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { fechaCorta, moneda } from '../../core/utils/format';
import { calcularResumen, RESUMEN_VACIO, sumar } from '../../core/utils/finanzas';
import { Icon } from '../../shared/icon';
import {
  AvatarStack,
  ConfirmModal,
  EmptyState,
  Modal,
  PageHeader,
  ProgressBar,
  StatCard,
} from '../../shared/ui';

@Component({
  selector: 'app-inactivas',
  imports: [
    RouterLink,
    Icon,
    AvatarStack,
    ConfirmModal,
    EmptyState,
    Modal,
    PageHeader,
    ProgressBar,
    StatCard,
  ],
  template: `
    <app-page-header
      titulo="Carteras inactivas"
      descripcion="Histórico de carteras finalizadas. Consulta el balance de gastos final y retoma una cartera si es necesario."
    >
      <a routerLink="/app/carteras" class="btn btn-outline">
        <app-icon name="wallet" [size]="16" />
        Ver activas
      </a>
    </app-page-header>

    <div class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      <app-stat-card
        etiqueta="Carteras finalizadas"
        [valor]="inactivas().length"
        formato="numero"
        icono="archive"
        tono="slate"
      />
      <app-stat-card etiqueta="Gastos históricos" [valor]="gastosHistoricos()" icono="cart" tono="rose" />
      <app-stat-card
        etiqueta="Movimientos archivados"
        [valor]="movimientosHistoricos()"
        formato="numero"
        icono="receipt"
        tono="violet"
      />
    </div>

    @if (inactivas().length) {
      <div class="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        @for (cartera of inactivas(); track cartera.idCartera) {
          <article class="card card-pad">
            <div class="flex items-start gap-3">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                <app-icon name="archive" [size]="20" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-base font-semibold text-slate-900">{{ cartera.nombreCartera }}</p>
                <p class="mt-0.5 text-xs text-slate-500">
                  {{ nombreCategoria(cartera.idCategoriaCartera) }} ·
                  cerrada el {{ fecha(cartera.fechaCierre ?? cartera.fechaCreacion) }}
                </p>
              </div>
              <app-avatar-stack [usuarios]="usuariosDe(cartera.idCartera)" [limite]="3" />
            </div>

            <p class="mt-3 line-clamp-2 text-sm text-slate-600">{{ cartera.descripcion }}</p>

            <div class="mt-4">
              <div class="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Ejecución del presupuesto</span>
                <span>{{ avanceDe(cartera) }}%</span>
              </div>
              <app-progress [valor]="avanceDe(cartera)" color="#64748b" />
            </div>

            <dl class="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
              <div>
                <dt class="text-[11px] font-medium text-slate-400">Gastado</dt>
                <dd class="mt-0.5 text-sm font-semibold text-slate-900">{{ moneda(gastosDe(cartera.idCartera)) }}</dd>
              </div>
              <div>
                <dt class="text-[11px] font-medium text-slate-400">Aportado</dt>
                <dd class="mt-0.5 text-sm font-semibold text-brand-700">
                  {{ moneda(ingresosDe(cartera.idCartera)) }}
                </dd>
              </div>
              <div>
                <dt class="text-[11px] font-medium text-slate-400">Balance</dt>
                <dd
                  class="mt-0.5 text-sm font-semibold"
                  [class]="balanceDe(cartera) >= 0 ? 'text-brand-700' : 'text-rose-600'"
                >
                  {{ moneda(balanceDe(cartera)) }}
                </dd>
              </div>
            </dl>

            <div class="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
              <button type="button" class="btn btn-dark btn-sm flex-1" (click)="verBalance(cartera)">
                <app-icon name="chart" [size]="14" />
                Ver balance final
              </button>
              @if (esPropietario(cartera)) {
                <button type="button" class="btn btn-outline btn-sm" title="Reactivar" (click)="reactivar.set(cartera)">
                  <app-icon name="refresh" [size]="14" />
                </button>
              }
            </div>
          </article>
        }
      </div>
    } @else {
      <div class="mt-6">
        <app-empty-state
          titulo="Sin carteras inactivas"
          descripcion="Cuando finalices una cartera aparecerá aquí con su balance de gastos final."
          icono="archive"
        />
      </div>
    }

    <app-modal
      [abierto]="seleccionada() !== null"
      [titulo]="'Balance final · ' + (seleccionada()?.nombreCartera ?? '')"
      subtitulo="Resumen del cierre financiero de la cartera."
      ancho="lg"
      (cerrar)="seleccionada.set(null)"
    >
      @if (seleccionada(); as cartera) {
        <div class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          <div class="rounded-2xl bg-slate-50 p-4">
            <p class="text-xs font-medium text-slate-400">Gastos totales</p>
            <p class="mt-1 text-lg font-bold text-slate-900">{{ moneda(balance().totalGastos) }}</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4">
            <p class="text-xs font-medium text-slate-400">Aportaciones</p>
            <p class="mt-1 text-lg font-bold text-brand-700">{{ moneda(balance().totalIngresos) }}</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4">
            <p class="text-xs font-medium text-slate-400">Cuota por integrante</p>
            <p class="mt-1 text-lg font-bold text-slate-900">{{ moneda(balance().cuotaPorMiembro) }}</p>
          </div>
        </div>

        <div class="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="th">Integrante</th>
                <th class="th text-right">Pagó de su bolsillo</th>
                <th class="th hidden text-right sm:table-cell">Le correspondía</th>
                <th class="th text-right">Saldo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (saldo of balance().saldos; track saldo.usuario.idUsuario) {
                <tr>
                  <td class="td font-medium text-slate-900">{{ saldo.usuario.nombreUsuario }} {{ saldo.usuario.APaterno }}</td>
                  <td class="td text-right">{{ moneda(saldo.pagado) }}</td>
                  <td class="td hidden text-right text-slate-500 sm:table-cell">{{ moneda(saldo.cuota) }}</td>
                  <td class="td text-right">
                    <span class="font-semibold" [class]="saldo.saldo >= 0 ? 'text-brand-700' : 'text-rose-600'">
                      {{ saldo.saldo >= 0 ? '+' : '' }}{{ moneda(saldo.saldo) }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-5">
          <h3 class="text-sm font-semibold text-slate-900">Liquidación sugerida</h3>
          @if (balance().liquidaciones.length) {
            <ul class="mt-3 space-y-2">
              @for (liquidacion of balance().liquidaciones; track $index) {
                <li class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm">
                  <span class="text-slate-700">
                    {{ liquidacion.de.nombreUsuario }} → {{ liquidacion.para.nombreUsuario }}
                  </span>
                  <span class="font-bold text-brand-700">{{ moneda(liquidacion.monto) }}</span>
                </li>
              }
            </ul>
          } @else {
            <p class="mt-2 text-sm text-slate-500">La cartera quedó equilibrada, no hay transferencias pendientes.</p>
          }
        </div>

        <p class="mt-4 text-xs text-slate-400">
          Cartera cerrada el {{ fecha(cartera.fechaCierre ?? cartera.fechaCreacion) }} · {{ cartera.nombreCartera }}
        </p>
      }

      <div modal-footer class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="btn btn-outline" (click)="imprimir()">
          <app-icon name="print" [size]="16" />
          Imprimir
        </button>
        <button type="button" class="btn btn-primary" (click)="seleccionada.set(null)">Cerrar</button>
      </div>
    </app-modal>

    <app-confirm-modal
      [abierto]="reactivar() !== null"
      titulo="Reactivar cartera"
      [mensaje]="'La cartera ' + (reactivar()?.nombreCartera ?? '') + ' volverá a estar activa y podrás registrar nuevos movimientos.'"
      textoConfirmar="Reactivar"
      tono="primary"
      (confirmar)="confirmarReactivar()"
      (cerrar)="reactivar.set(null)"
    />
  `,
})
export class Inactivas {
  private readonly auth = inject(AuthService);
  private readonly carterasService = inject(CarterasService);
  private readonly transaccionesService = inject(TransaccionesService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly toast = inject(ToastService);

  protected readonly moneda = moneda;
  protected readonly fecha = fechaCorta;

  protected readonly seleccionada = signal<Cartera | null>(null);
  protected readonly reactivar = signal<Cartera | null>(null);

  protected readonly inactivas = computed(() => {
    const idUsuario = this.auth.usuario()?.idUsuario ?? 0;
    return this.carterasService
      .inactivasDe(idUsuario)
      .slice()
      .sort((a, b) => (a.fechaCierre ?? '') < (b.fechaCierre ?? '') ? 1 : -1);
  });

  private readonly movimientos = computed(() => {
    const ids = new Set(this.inactivas().map((cartera) => cartera.idCartera));
    return this.transaccionesService.transacciones().filter((t) => ids.has(t.idCartera));
  });

  protected readonly gastosHistoricos = computed(() => sumar(this.movimientos(), 'gasto'));
  protected readonly movimientosHistoricos = computed(() => this.movimientos().length);

  protected readonly balance = computed(() => {
    const cartera = this.seleccionada();
    if (!cartera) return RESUMEN_VACIO;
    return calcularResumen(
      cartera,
      this.transaccionesService.porCartera(cartera.idCartera),
      this.carterasService.miembrosDe(cartera.idCartera),
      this.usuariosService.usuarios(),
    );
  });

  protected nombreCategoria(idCategoria: number): string {
    return this.carterasService.nombreCategoria(idCategoria);
  }

  protected usuariosDe(idCartera: number) {
    return this.carterasService.usuariosDe(idCartera);
  }

  protected gastosDe(idCartera: number): number {
    return sumar(this.transaccionesService.porCartera(idCartera), 'gasto');
  }

  protected ingresosDe(idCartera: number): number {
    return sumar(this.transaccionesService.porCartera(idCartera), 'ingreso');
  }

  protected balanceDe(cartera: Cartera): number {
    return this.ingresosDe(cartera.idCartera) - this.gastosDe(cartera.idCartera);
  }

  protected avanceDe(cartera: Cartera): number {
    const base = cartera.presupuestoInicial ?? 0;
    if (!base) return 0;
    return Math.min(100, Math.round((this.gastosDe(cartera.idCartera) / base) * 100));
  }

  protected esPropietario(cartera: Cartera): boolean {
    return cartera.idPropietario === this.auth.usuario()?.idUsuario;
  }

  protected verBalance(cartera: Cartera): void {
    this.seleccionada.set(cartera);
  }

  protected confirmarReactivar(): void {
    const cartera = this.reactivar();
    if (!cartera) return;
    this.carterasService.reactivar(cartera.idCartera);
    this.reactivar.set(null);
    this.toast.mostrar(`"${cartera.nombreCartera}" volvió a estar activa.`);
  }

  protected imprimir(): void {
    window.print();
  }
}
