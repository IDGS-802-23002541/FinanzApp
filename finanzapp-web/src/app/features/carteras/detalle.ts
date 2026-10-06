import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import QRCode from 'qrcode';
import { Transaccion } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CarterasService } from '../../core/services/carteras.service';
import { ToastService } from '../../core/services/toast.service';
import { TransaccionesService } from '../../core/services/transacciones.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { fechaCorta, moneda, porcentaje } from '../../core/utils/format';
import {
  avancePresupuesto,
  calcularResumen,
  FILTRO_VACIO,
  filtrar,
  gastosPorCategoria,
  RESUMEN_VACIO,
  serieMensual,
} from '../../core/utils/finanzas';
import { BarChart, DonutChart } from '../../shared/charts';
import { Icon } from '../../shared/icon';
import {
  Avatar,
  AvatarStack,
  ConfirmModal,
  EmptyState,
  ProgressBar,
  StatCard,
} from '../../shared/ui';
import { CarteraForm } from './cartera-form';
import { TransaccionForm } from './transaccion-form';
import { MiembroForm } from '../contribuyentes/miembro-form';

type Vista = 'resumen' | 'movimientos' | 'contribuyentes' | 'invitacion' | 'cierre';

@Component({
  selector: 'app-detalle-cartera',
  imports: [
    RouterLink,
    Icon,
    BarChart,
    DonutChart,
    StatCard,
    Avatar,
    AvatarStack,
    ProgressBar,
    EmptyState,
    ConfirmModal,
    CarteraForm,
    TransaccionForm,
    MiembroForm,
  ],
  template: `
    @if (cartera(); as c) {
      <a
        routerLink="/app/carteras"
        class="no-print inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <app-icon name="arrow-left" [size]="16" />
        Volver a mis carteras
      </a>

      <div class="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="flex items-start gap-4">
          <span
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
            [style.background-color]="c.color"
          >
            <app-icon [name]="iconoCategoria(c.idCategoriaCartera)" [size]="26" />
          </span>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{{ c.nombreCartera }}</h1>
              <span
                class="badge"
                [class]="c.estado === 'activa' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'"
              >
                {{ c.estado === 'activa' ? 'Activa' : 'Inactiva' }}
              </span>
              @if (esPropietario()) {
                <span class="badge bg-violet-50 text-violet-700">Administrador</span>
              }
            </div>
            <p class="mt-1.5 max-w-2xl text-sm text-slate-500">{{ c.descripcion }}</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="chip">
                <app-icon [name]="iconoCategoria(c.idCategoriaCartera)" [size]="13" />
                {{ nombreCategoria(c.idCategoriaCartera) }}
              </span>
              <span class="chip">
                <app-icon name="calendar" [size]="13" />
                Creada el {{ fecha(c.fechaCreacion) }}
              </span>
              @if (c.fechaInicio) {
                <span class="chip">
                  <app-icon name="clock" [size]="13" />
                  Del {{ fecha(c.fechaInicio) }}
                  @if (c.fechaFin) {
                    al {{ fecha(c.fechaFin) }}
                  }
                </span>
              }
              @if (c.fechaCierre) {
                <span class="chip">
                  <app-icon name="archive" [size]="13" />
                  Finalizada el {{ fecha(c.fechaCierre) }}
                </span>
              }
            </div>
          </div>
        </div>

        <div class="no-print flex flex-1 flex-wrap items-center gap-2 lg:flex-none">
          <app-avatar-stack [usuarios]="integrantes()" [limite]="4" />
          <button type="button" class="btn btn-outline flex-1 justify-center lg:flex-none" (click)="editarCartera()">
            <app-icon name="edit" [size]="16" />
            Editar
          </button>
          <button type="button" class="btn btn-primary flex-1 justify-center lg:flex-none" (click)="nuevoMovimiento()">
            <app-icon name="plus" [size]="16" />
            Movimiento
          </button>
        </div>
      </div>

      <div class="no-print -mx-4 mt-6 flex gap-1 overflow-x-auto border-b border-slate-200 px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        @for (item of tabs; track item.id) {
          <button
            type="button"
            class="flex cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors"
            [class]="vista() === item.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'"
            (click)="vista.set(item.id)"
          >
            <app-icon [name]="item.icono" [size]="16" />
            {{ item.etiqueta }}
          </button>
        }
      </div>

      @if (c.estado === 'inactiva') {
        <div class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4">
          <div class="flex items-start gap-3">
            <span class="mt-0.5 text-slate-500"><app-icon name="archive" [size]="20" /></span>
            <div>
              <p class="text-sm font-semibold text-slate-900">Esta cartera está finalizada</p>
              <p class="text-xs text-slate-600">
                Se cerró el {{ fecha(c.fechaCierre ?? c.fechaCreacion) }}. El balance final permanece disponible para consulta.
              </p>
            </div>
          </div>
          @if (esPropietario()) {
            <button type="button" class="btn btn-outline btn-sm" (click)="reactivar()">
              <app-icon name="refresh" [size]="14" />
              Reactivar cartera
            </button>
          }
        </div>
      }

      @switch (vista()) {
        @case ('resumen') {
          <div class="mt-6 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
            <app-stat-card
              etiqueta="Presupuesto inicial"
              [valor]="c.presupuestoInicial ?? 0"
              icono="target"
              tono="slate"
              [nota]="c.presupuestoInicial ? 'Avance del ' + avance() + '%' : 'Sin presupuesto definido'"
            />
            <app-stat-card
              etiqueta="Gastos acumulados"
              [valor]="resumen().totalGastos"
              icono="cart"
              tono="rose"
              [nota]="resumen().movimientos + ' movimientos registrados'"
            />
            <app-stat-card
              etiqueta="Aportaciones"
              [valor]="resumen().totalIngresos"
              icono="trend-up"
              tono="brand"
              [nota]="'Cuota por integrante: ' + moneda(resumen().cuotaPorMiembro)"
            />
            <app-stat-card
              etiqueta="Disponible"
              [valor]="resumen().disponible"
              icono="wallet"
              [tono]="resumen().disponible >= 0 ? 'brand' : 'rose'"
              [nota]="integrantes().length + ' contribuyentes activos'"
            />
          </div>

          <div class="mt-5 grid gap-5 xl:grid-cols-5">
            <section class="card card-pad xl:col-span-3">
              <h2 class="section-title">Evolución mensual</h2>
              <p class="mt-0.5 text-sm text-slate-500">Gastos e ingresos de los últimos 6 meses</p>
              <div class="mt-6">
                <app-bar-chart
                  [datos]="serie()"
                  [alto]="220"
                  [mostrarSecundario]="true"
                  [color]="c.color"
                  leyendaPrincipal="Gastos"
                  leyendaSecundario="Ingresos"
                />
              </div>
            </section>

            <section class="card card-pad xl:col-span-2">
              <h2 class="section-title">Gastos por categoría</h2>
              <p class="mt-0.5 text-sm text-slate-500">Histórico de la cartera</p>
              <div class="mt-6">
                @if (porCategoria().length) {
                  <app-donut-chart [segmentos]="porCategoria()" etiquetaCentro="Gastado" />
                } @else {
                  <app-empty-state
                    titulo="Sin gastos registrados"
                    descripcion="Cuando registres gastos verás aquí el desglose por categoría."
                    icono="cart"
                  />
                }
              </div>
            </section>
          </div>

          <div class="mt-5 grid gap-5 xl:grid-cols-2">
            <section class="card card-pad">
              <h2 class="section-title">Pagos por contribuyente</h2>
              <p class="mt-0.5 text-sm text-slate-500">Quién ha pagado más gastos de la cartera</p>
              @if (resumen().saldos.length) {
                <ul class="mt-5 space-y-4">
                  @for (saldo of resumen().saldos; track saldo.usuario.idUsuario) {
                    <li class="flex items-center gap-3">
                      <app-avatar [usuario]="saldo.usuario" tamano="sm" />
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2 text-sm">
                          <span class="truncate font-medium text-slate-800">{{ saldo.usuario.nombreUsuario }}</span>
                          <span class="font-semibold text-slate-900">{{ moneda(saldo.pagado) }}</span>
                        </div>
                        <div class="mt-1.5">
                          <app-progress
                            [valor]="porcentajeDe(saldo.pagado)"
                            [color]="saldo.saldo >= 0 ? '#108354' : '#e11d48'"
                            altura="h-2"
                          />
                        </div>
                      </div>
                      <span
                        class="badge shrink-0"
                        [class]="saldo.saldo >= 0 ? 'bg-brand-50 text-brand-700' : 'bg-rose-50 text-rose-600'"
                      >
                        {{ saldo.saldo >= 0 ? '+' : '' }}{{ moneda(saldo.saldo) }}
                      </span>
                    </li>
                  }
                </ul>
              } @else {
                <p class="mt-4 text-sm text-slate-500">Todavía no hay movimientos registrados.</p>
              }
            </section>

            <section class="card card-pad">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="section-title">Últimos movimientos</h2>
                  <p class="mt-0.5 text-sm text-slate-500">Actividad reciente de la cartera</p>
                </div>
                <button type="button" class="btn btn-ghost btn-sm" (click)="vista.set('movimientos')">
                  Ver todos
                  <app-icon name="chevron-right" [size]="14" />
                </button>
              </div>
              @if (movimientos().length) {
                <ul class="mt-5 divide-y divide-slate-100">
                  @for (movimiento of movimientos().slice(0, 5); track movimiento.idTransaccion) {
                    <li class="flex items-center gap-3 py-3">
                      <span
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        [class]="movimiento.tipo === 'ingreso' ? 'bg-brand-50 text-brand-700' : 'bg-rose-50 text-rose-600'"
                      >
                        <app-icon [name]="movimiento.tipo === 'ingreso' ? 'trend-up' : 'cart'" [size]="16" />
                      </span>
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-slate-800">{{ movimiento.nota }}</p>
                        <p class="text-xs text-slate-500">
                          {{ nombreUsuario(movimiento.idUsuario) }} · {{ fecha(movimiento.fecha) }}
                        </p>
                      </div>
                      <span
                        class="text-sm font-semibold"
                        [class]="movimiento.tipo === 'ingreso' ? 'text-brand-700' : 'text-slate-900'"
                      >
                        {{ movimiento.tipo === 'ingreso' ? '+' : '−' }}{{ moneda(movimiento.monto) }}
                      </span>
                    </li>
                  }
                </ul>
              } @else {
                <p class="mt-4 text-sm text-slate-500">Aún no hay movimientos en esta cartera.</p>
              }
            </section>
          </div>
        }

        @case ('movimientos') {
          <section class="card mt-6">
            <div class="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex flex-wrap gap-2">
                <select class="input sm:w-40" [value]="filtroTipo()" (change)="filtroTipo.set($any($event.target).value)">
                  <option value="todos">Todos</option>
                  <option value="gasto">Gastos</option>
                  <option value="ingreso">Ingresos</option>
                </select>
                <select
                  class="input sm:w-56"
                  [value]="filtroCategoria()"
                  (change)="filtroCategoria.set(+$any($event.target).value)"
                >
                  <option [value]="0">Todas las categorías</option>
                  @for (categoria of categorias; track categoria.idCategoriaGasto) {
                    <option [value]="categoria.idCategoriaGasto">{{ categoria.nombreGasto }}</option>
                  }
                </select>
                <input
                  type="search"
                  class="input sm:w-56"
                  placeholder="Buscar movimiento…"
                  [value]="filtroTexto()"
                  (input)="filtroTexto.set($any($event.target).value)"
                />
              </div>
              <button type="button" class="btn btn-primary" (click)="nuevoMovimiento()">
                <app-icon name="plus" [size]="16" />
                Registrar movimiento
              </button>
            </div>

            @if (movimientosFiltrados().length) {
              <ul class="divide-y divide-slate-100 md:hidden">
                @for (movimiento of movimientosFiltrados(); track movimiento.idTransaccion) {
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
                          {{ fecha(movimiento.fecha) }} · {{ nombreUsuario(movimiento.idUsuario) }}
                        </span>
                      </div>
                    </div>
                    <div class="flex shrink-0 flex-col items-end gap-2">
                      <span
                        class="text-sm font-semibold whitespace-nowrap"
                        [class]="movimiento.tipo === 'ingreso' ? 'text-brand-700' : 'text-slate-900'"
                      >
                        {{ movimiento.tipo === 'ingreso' ? '+' : '−' }}{{ moneda(movimiento.monto) }}
                      </span>
                      <div class="flex gap-1">
                        <button
                          type="button"
                          class="btn btn-ghost btn-sm"
                          aria-label="Editar movimiento"
                          (click)="editarMovimiento(movimiento)"
                        >
                          <app-icon name="edit" [size]="14" />
                        </button>
                        <button
                          type="button"
                          class="btn btn-ghost btn-sm text-rose-600"
                          aria-label="Eliminar movimiento"
                          (click)="eliminarMovimiento.set(movimiento)"
                        >
                          <app-icon name="trash" [size]="14" />
                        </button>
                      </div>
                    </div>
                  </li>
                }
              </ul>

              <div class="hidden overflow-x-auto md:block">
                <table class="w-full">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="th">Fecha</th>
                      <th class="th">Descripción</th>
                      <th class="th hidden md:table-cell">Responsable</th>
                      <th class="th hidden xl:table-cell">Método</th>
                      <th class="th text-right">Monto</th>
                      <th class="th text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (movimiento of movimientosFiltrados(); track movimiento.idTransaccion) {
                      <tr class="transition-colors hover:bg-slate-50">
                        <td class="td whitespace-nowrap">{{ fecha(movimiento.fecha) }}</td>
                        <td class="td">
                          <p class="max-w-[170px] truncate font-medium text-slate-900 sm:max-w-none">
                            {{ movimiento.nota }}
                          </p>
                          <div class="mt-1 flex flex-wrap items-center gap-1.5">
                            <span class="badge bg-slate-100 text-slate-600">{{ movimiento.nombreGasto }}</span>
                            <span class="text-xs text-slate-400 md:hidden">
                              {{ nombreUsuario(movimiento.idUsuario) }} · {{ movimiento.metodoPago }}
                            </span>
                          </div>
                        </td>
                        <td class="td hidden md:table-cell">
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
                            <button
                              type="button"
                              class="btn btn-ghost btn-sm"
                              title="Editar movimiento"
                              (click)="editarMovimiento(movimiento)"
                            >
                              <app-icon name="edit" [size]="14" />
                            </button>
                            <button
                              type="button"
                              class="btn btn-ghost btn-sm text-rose-600"
                              title="Eliminar movimiento"
                              (click)="eliminarMovimiento.set(movimiento)"
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
              <div class="p-6">
                <app-empty-state
                  titulo="Sin movimientos"
                  descripcion="No hay movimientos que coincidan con los filtros seleccionados."
                  icono="receipt"
                >
                  <button type="button" class="btn btn-primary btn-sm" (click)="nuevoMovimiento()">
                    <app-icon name="plus" [size]="14" />
                    Registrar el primero
                  </button>
                </app-empty-state>
              </div>
            }
          </section>
        }

        @case ('contribuyentes') {
          <section class="card mt-6">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <h2 class="section-title">Contribuyentes de la cartera</h2>
                <p class="mt-0.5 text-sm text-slate-500">{{ integrantes().length }} personas participando</p>
              </div>
              <button type="button" class="btn btn-primary" (click)="agregarContribuyente()">
                <app-icon name="plus" [size]="16" />
                Meter contribuyente
              </button>
            </div>

            @if (resumen().saldos.length) {
              <ul class="divide-y divide-slate-100 md:hidden">
                @for (saldo of resumen().saldos; track saldo.usuario.idUsuario) {
                  <li class="flex items-start gap-3 p-4">
                    <app-avatar [usuario]="saldo.usuario" tamano="sm" />
                    <div class="min-w-0 flex-1">
                      <p class="truncate font-medium text-slate-900">
                        {{ nombreCompletoUsuario(saldo.usuario.idUsuario) }}
                      </p>
                      <p class="truncate text-xs text-slate-500">{{ saldo.usuario.correo }}</p>
                      <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          class="badge"
                          [class]="miembroDe(saldo.usuario.idUsuario)?.rol === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'"
                        >
                          {{ miembroDe(saldo.usuario.idUsuario)?.rol === 'admin' ? 'Administrador' : 'Miembro' }}
                        </span>
                        <span class="text-xs text-slate-400">
                          Aportó {{ moneda(saldo.aportado) }} · {{ saldo.movimientos }} movimientos
                        </span>
                      </div>
                    </div>
                    <div class="flex shrink-0 flex-col items-end gap-2">
                      <span
                        class="text-sm font-semibold whitespace-nowrap"
                        [class]="saldo.saldo >= 0 ? 'text-brand-700' : 'text-rose-600'"
                      >
                        {{ saldo.saldo >= 0 ? '+' : '' }}{{ moneda(saldo.saldo) }}
                      </span>
                      @if (saldo.usuario.idUsuario !== c.idPropietario) {
                        <button
                          type="button"
                          class="btn btn-ghost btn-sm text-rose-600"
                          aria-label="Quitar de la cartera"
                          (click)="quitar.set(miembroDe(saldo.usuario.idUsuario) ?? null)"
                        >
                          <app-icon name="trash" [size]="14" />
                        </button>
                      }
                    </div>
                  </li>
                }
              </ul>

              <div class="hidden overflow-x-auto md:block">
                <table class="w-full">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="th">Contribuyente</th>
                      <th class="th hidden lg:table-cell">Rol</th>
                      <th class="th hidden text-right xl:table-cell">Aporte comprometido</th>
                      <th class="th text-right">Aportado</th>
                      <th class="th hidden text-right xl:table-cell">Movimientos</th>
                      <th class="th text-right">Saldo</th>
                      <th class="th text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (saldo of resumen().saldos; track saldo.usuario.idUsuario) {
                      <tr class="transition-colors hover:bg-slate-50">
                        <td class="td">
                          <div class="flex items-center gap-3">
                            <app-avatar [usuario]="saldo.usuario" tamano="sm" />
                            <div class="min-w-0">
                              <p class="font-medium text-slate-900">{{ nombreCompletoUsuario(saldo.usuario.idUsuario) }}</p>
                              <p class="text-xs text-slate-500">{{ saldo.usuario.correo }}</p>
                              <p class="mt-0.5 text-xs text-slate-400 md:hidden">
                                {{ miembroDe(saldo.usuario.idUsuario)?.rol === 'admin' ? 'Administrador' : 'Miembro' }}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td class="td hidden lg:table-cell">
                          <span
                            class="badge"
                            [class]="miembroDe(saldo.usuario.idUsuario)?.rol === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'"
                          >
                            {{ miembroDe(saldo.usuario.idUsuario)?.rol === 'admin' ? 'Administrador' : 'Miembro' }}
                          </span>
                        </td>
                        <td class="td hidden text-right xl:table-cell">
                          {{ moneda(miembroDe(saldo.usuario.idUsuario)?.aporteComprometido ?? 0) }}
                        </td>
                        <td class="td text-right font-semibold">{{ moneda(saldo.aportado) }}</td>
                        <td class="td hidden text-right xl:table-cell">{{ saldo.movimientos }}</td>
                        <td class="td text-right">
                          <span
                            class="font-semibold"
                            [class]="saldo.saldo >= 0 ? 'text-brand-700' : 'text-rose-600'"
                          >
                            {{ saldo.saldo >= 0 ? '+' : '' }}{{ moneda(saldo.saldo) }}
                          </span>
                        </td>
                        <td class="td">
                          <div class="flex justify-end">
                            @if (saldo.usuario.idUsuario !== c.idPropietario) {
                              <button
                                type="button"
                                class="btn btn-ghost btn-sm text-rose-600"
                                title="Quitar de la cartera"
                                (click)="quitar.set(miembroDe(saldo.usuario.idUsuario) ?? null)"
                              >
                                <app-icon name="trash" [size]="14" />
                              </button>
                            } @else {
                              <span class="text-xs text-slate-400">Propietario</span>
                            }
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="p-6">
                <app-empty-state
                  titulo="Sin contribuyentes"
                  descripcion="Agrega participantes para repartir los gastos de esta cartera."
                  icono="users"
                />
              </div>
            }
          </section>
        }

        @case ('invitacion') {
          <div class="mt-6 grid gap-5 lg:grid-cols-2">
            <section class="card card-pad text-center">
              <h2 class="section-title">Invita con código QR</h2>
              <p class="mt-1 text-sm text-slate-500">
                Comparte este código para que los contribuyentes se unan a {{ c.nombreCartera }}.
              </p>

              <div class="mt-6 flex justify-center">
                @if (qr(); as imagen) {
                  <img
                    [src]="imagen"
                    alt="Código QR para unirse a la cartera"
                    class="h-56 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                  />
                } @else {
                  <div class="skeleton h-56 w-56"></div>
                }
              </div>

              <div class="mt-6 inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5">
                <span class="font-mono text-lg font-bold tracking-widest text-slate-900">{{ c.codigoInvitacion }}</span>
                <button type="button" class="btn btn-ghost btn-sm" title="Copiar código" (click)="copiar(c.codigoInvitacion)">
                  <app-icon name="copy" [size]="15" />
                </button>
              </div>

              <div class="mt-6 flex flex-wrap justify-center gap-2">
                <button type="button" class="btn btn-primary" (click)="compartir()">
                  <app-icon name="share" [size]="16" />
                  Compartir invitación
                </button>
                <button type="button" class="btn btn-outline" (click)="regenerarCodigo()">
                  <app-icon name="refresh" [size]="16" />
                  Regenerar código
                </button>
              </div>
            </section>

            <section class="card card-pad">
              <h2 class="section-title">¿Cómo se unen los contribuyentes?</h2>
              <ol class="mt-5 space-y-5">
                @for (paso of pasosInvitacion; track paso.titulo) {
                  <li class="flex gap-4">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                      {{ paso.numero }}
                    </span>
                    <div>
                      <p class="text-sm font-semibold text-slate-900">{{ paso.titulo }}</p>
                      <p class="mt-0.5 text-sm text-slate-500">{{ paso.descripcion }}</p>
                    </div>
                  </li>
                }
              </ol>

              <div class="mt-6 rounded-2xl bg-slate-900 p-5">
                <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">Clave de invitación</p>
                <p class="mt-2 font-mono text-sm break-all text-white">{{ enlaceInvitacion() }}</p>
                <button type="button" class="btn btn-outline btn-sm mt-4 border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800" (click)="copiar(enlaceInvitacion())">
                  <app-icon name="copy" [size]="14" />
                  Copiar enlace
                </button>
              </div>
            </section>
          </div>
        }

        @case ('cierre') {
          <div class="mt-6 grid gap-5 xl:grid-cols-3">
            <section class="card card-pad xl:col-span-2">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 class="section-title">Balance de gastos final</h2>
                  <p class="mt-0.5 text-sm text-slate-500">
                    Cuota por integrante calculada sobre {{ moneda(resumen().totalGastos) }} de gastos totales.
                  </p>
                </div>
                <span class="badge bg-slate-100 text-slate-600">
                  {{ integrantes().length }} integrantes · cuota {{ moneda(resumen().cuotaPorMiembro) }}
                </span>
              </div>

              <div class="mt-5 overflow-x-auto">
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
                    @for (saldo of resumen().saldos; track saldo.usuario.idUsuario) {
                      <tr>
                        <td class="td">
                          <div class="flex items-center gap-3">
                            <app-avatar [usuario]="saldo.usuario" tamano="xs" />
                            <span class="font-medium text-slate-900">{{ saldo.usuario.nombreUsuario }}</span>
                          </div>
                        </td>
                        <td class="td text-right font-semibold">{{ moneda(saldo.pagado) }}</td>
                        <td class="td hidden text-right text-slate-500 sm:table-cell">{{ moneda(saldo.cuota) }}</td>
                        <td class="td text-right">
                          <span class="font-semibold" [class]="saldo.saldo >= 0 ? 'text-brand-700' : 'text-rose-600'">
                            {{ saldo.saldo >= 0 ? '+' : '' }}{{ moneda(saldo.saldo) }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                  <tfoot class="bg-slate-50">
                    <tr>
                      <td class="td font-semibold text-slate-900">
                        Totales
                        <span class="block text-xs font-normal text-slate-500 sm:inline">
                          · {{ moneda(resumen().totalIngresos) }} de aportaciones al fondo
                        </span>
                      </td>
                      <td class="td text-right font-semibold">{{ moneda(resumen().totalGastos) }}</td>
                      <td class="td hidden text-right font-semibold text-slate-500 sm:table-cell">
                        {{ moneda(resumen().totalGastos) }}
                      </td>
                      <td class="td text-right font-semibold">—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            <section class="card card-pad">
              <h2 class="section-title">Liquidación sugerida</h2>
              <p class="mt-0.5 text-sm text-slate-500">Movimientos mínimos para dejar la cartera en cero.</p>

              @if (resumen().liquidaciones.length) {
                <ul class="mt-5 space-y-3">
                  @for (liquidacion of resumen().liquidaciones; track $index) {
                    <li class="rounded-2xl border border-slate-200 p-4">
                      <p class="text-sm text-slate-700">
                        <span class="font-semibold text-slate-900">{{ liquidacion.de.nombreUsuario }}</span>
                        debe pagarle a
                        <span class="font-semibold text-slate-900">{{ liquidacion.para.nombreUsuario }}</span>
                      </p>
                      <p class="mt-2 text-xl font-bold text-brand-700">{{ moneda(liquidacion.monto) }}</p>
                    </li>
                  }
                </ul>
              } @else {
                <div class="mt-5 rounded-2xl border border-brand-200 bg-brand-50/70 p-4 text-sm text-brand-900">
                  <div class="flex items-center gap-2 font-semibold">
                    <app-icon name="check" [size]="16" />
                    Cartera equilibrada
                  </div>
                  <p class="mt-1 text-brand-800">Todas las aportaciones cubren exactamente la cuota de cada integrante.</p>
                </div>
              }
            </section>
          </div>

          <div class="no-print mt-5 flex flex-wrap items-center gap-2">
            <button type="button" class="btn btn-dark" (click)="imprimir()">
              <app-icon name="print" [size]="16" />
              Imprimir balance
            </button>
            @if (c.estado === 'activa' && esPropietario()) {
              <button type="button" class="btn btn-danger" (click)="finalizar.set(true)">
                <app-icon name="check" [size]="16" />
                Finalizar cartera
              </button>
            }
          </div>
        }
      }

      <app-transaccion-form
        [abierto]="formMovimiento()"
        [transaccion]="movimientoEnEdicion()"
        [carteraFija]="c.idCartera"
        [usuarioFijo]="usuarioFijo()"
        (cerrar)="cerrarFormMovimiento()"
        (guardado)="alGuardarMovimiento($event)"
      />

      <app-cartera-form
        [abierto]="formCartera()"
        [cartera]="c"
        (cerrar)="formCartera.set(false)"
        (guardado)="alGuardarCartera()"
      />

      <app-miembro-form
        [abierto]="formMiembro()"
        [idCartera]="c.idCartera"
        (cerrar)="formMiembro.set(false)"
        (guardado)="alAgregarContribuyente($event)"
      />

      <app-confirm-modal
        [abierto]="eliminarMovimiento() !== null"
        titulo="Eliminar movimiento"
        [mensaje]="'Se eliminará “' + (eliminarMovimiento()?.nota ?? '') + '”. Esta acción no se puede deshacer.'"
        textoConfirmar="Eliminar"
        (confirmar)="confirmarEliminarMovimiento()"
        (cerrar)="eliminarMovimiento.set(null)"
      />

      <app-confirm-modal
        [abierto]="quitar() !== null"
        titulo="Quitar contribuyente"
        [mensaje]="'La persona dejará de participar en esta cartera. Sus movimientos registrados se conservarán en el historial.'"
        textoConfirmar="Quitar de la cartera"
        (confirmar)="confirmarQuitar()"
        (cerrar)="quitar.set(null)"
      />

      <app-confirm-modal
        [abierto]="finalizar()"
        titulo="Finalizar cartera"
        [mensaje]="'Se generará el balance de gastos final y la cartera pasará a la sección de inactivas. Podrás consultar los resultados pero no registrar más movimientos.'"
        textoConfirmar="Finalizar ahora"
        (confirmar)="confirmarFinalizar()"
        (cerrar)="finalizar.set(false)"
      />
    } @else {
      <app-empty-state
        titulo="Cartera no encontrada"
        descripcion="La cartera que buscas no existe o fue eliminada."
        icono="alert"
      >
        <a routerLink="/app/carteras" class="btn btn-primary btn-sm">Volver a mis carteras</a>
      </app-empty-state>
    }
  `,
})
export class DetalleCartera {
  private readonly carterasService = inject(CarterasService);
  private readonly transaccionesService = inject(TransaccionesService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly tabs: { id: Vista; etiqueta: string; icono: string }[] = [
    { id: 'resumen', etiqueta: 'Resumen', icono: 'chart' },
    { id: 'movimientos', etiqueta: 'Movimientos', icono: 'receipt' },
    { id: 'contribuyentes', etiqueta: 'Contribuyentes', icono: 'users' },
    { id: 'invitacion', etiqueta: 'Invitación QR', icono: 'qr' },
    { id: 'cierre', etiqueta: 'Cierre y balance', icono: 'archive' },
  ];

  protected readonly pasosInvitacion = [
    { numero: '1', titulo: 'Comparte el código', descripcion: 'Envía el QR o la clave única por WhatsApp, correo o en persona.' },
    { numero: '2', titulo: 'Escanea desde la app', descripcion: 'Desde la app móvil, la persona escanea el QR y solicita unirse a la cartera.' },
    { numero: '3', titulo: 'Confirma la participación', descripcion: 'Acepta el aporte comprometido y comienza a registrar movimientos.' },
  ];

  readonly vista = signal<Vista>('resumen');
  protected readonly categorias = this.transaccionesService.categorias;
  protected readonly moneda = moneda;
  protected readonly fecha = fechaCorta;

  protected readonly filtroTexto = signal('');
  protected readonly filtroTipo = signal<'todos' | 'gasto' | 'ingreso'>('todos');
  protected readonly filtroCategoria = signal(0);

  protected readonly formMovimiento = signal(false);
  protected readonly movimientoEnEdicion = signal<Transaccion | null>(null);
  protected readonly eliminarMovimiento = signal<Transaccion | null>(null);
  protected readonly formCartera = signal(false);
  protected readonly formMiembro = signal(false);
  protected readonly quitar = signal<{ idMiembro: number } | null>(null);
  protected readonly finalizar = signal(false);
  protected readonly qr = signal<string | null>(null);

  protected readonly cartera = computed(() => this.carterasService.porId(Number(this.id())) ?? null);

  protected readonly movimientos = computed(() => {
    const cartera = this.cartera();
    return cartera ? this.transaccionesService.porCartera(cartera.idCartera) : [];
  });

  protected readonly miembros = computed(() => {
    const cartera = this.cartera();
    return cartera ? this.carterasService.miembrosDe(cartera.idCartera) : [];
  });

  protected readonly integrantes = computed(() => {
    const cartera = this.cartera();
    return cartera ? this.carterasService.usuariosDe(cartera.idCartera) : [];
  });

  protected readonly resumen = computed(() => {
    const cartera = this.cartera();
    if (!cartera) return RESUMEN_VACIO;
    return calcularResumen(cartera, this.movimientos(), this.miembros(), this.usuariosService.usuarios());
  });

  protected readonly esPropietario = computed(
    () => this.cartera()?.idPropietario === this.auth.usuario()?.idUsuario,
  );

  protected readonly usuarioFijo = computed(() => this.auth.usuario()?.idUsuario ?? null);

  protected readonly serie = computed(() => serieMensual(this.movimientos(), 6));

  protected readonly porCategoria = computed(() =>
    gastosPorCategoria(this.movimientos(), this.transaccionesService.categorias, 6),
  );

  protected readonly movimientosFiltrados = computed(() => {
    const categoria = this.filtroCategoria();
    return filtrar(this.movimientos(), {
      ...FILTRO_VACIO,
      texto: this.filtroTexto(),
      tipo: this.filtroTipo(),
      idCategoriaGasto: categoria === 0 ? 'todas' : categoria,
    });
  });

  protected readonly avance = computed(() => {
    const cartera = this.cartera();
    return cartera ? avancePresupuesto(cartera, this.movimientos()) : 0;
  });

  protected readonly enlaceInvitacion = computed(
    () => `https://finanzapp.mx/unirse?codigo=${this.cartera()?.codigoInvitacion ?? ''}`,
  );

  constructor() {
    effect(() => {
      const cartera = this.cartera();
      if (!cartera) return;

      QRCode.toDataURL(this.enlaceInvitacion(), {
        width: 320,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#0f172a', light: '#ffffff' },
      })
        .then((imagen) => this.qr.set(imagen))
        .catch(() => this.qr.set(null));
    });
  }

  protected nombreCategoria(idCategoria: number): string {
    return this.carterasService.nombreCategoria(idCategoria);
  }

  protected iconoCategoria(idCategoria: number): string {
    return this.carterasService.categoria(idCategoria)?.icono ?? 'tag';
  }

  protected usuarioDe(idUsuario: number) {
    return this.usuariosService.porId(idUsuario) ?? null;
  }

  protected nombreUsuario(idUsuario: number): string {
    return this.usuariosService.porId(idUsuario)?.nombreUsuario ?? '—';
  }

  protected nombreCompletoUsuario(idUsuario: number): string {
    const usuario = this.usuariosService.porId(idUsuario);
    return usuario ? `${usuario.nombreUsuario} ${usuario.APaterno}` : '—';
  }

  protected miembroDe(idUsuario: number) {
    return this.miembros().find((m) => m.idUsuario === idUsuario);
  }

  protected porcentajeDe(valor: number): number {
    const maximo = Math.max(1, ...this.resumen().saldos.map((s) => s.pagado));
    return porcentaje(valor, maximo);
  }

  protected nuevoMovimiento(): void {
    if (this.cartera()?.estado === 'inactiva') {
      this.toast.mostrar('La cartera está finalizada; reactívala para registrar movimientos.', 'error');
      return;
    }
    this.movimientoEnEdicion.set(null);
    this.formMovimiento.set(true);
  }

  protected editarMovimiento(movimiento: Transaccion): void {
    this.movimientoEnEdicion.set(movimiento);
    this.formMovimiento.set(true);
  }

  protected cerrarFormMovimiento(): void {
    this.formMovimiento.set(false);
    this.movimientoEnEdicion.set(null);
  }

  protected alGuardarMovimiento(movimiento: Transaccion): void {
    const editando = this.movimientoEnEdicion() !== null;
    this.cerrarFormMovimiento();
    this.toast.mostrar(
      editando ? 'Movimiento actualizado.' : `${movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'} de ${moneda(movimiento.monto)} registrado.`,
    );
  }

  protected confirmarEliminarMovimiento(): void {
    const movimiento = this.eliminarMovimiento();
    if (!movimiento) return;
    this.transaccionesService.eliminar(movimiento.idTransaccion);
    this.eliminarMovimiento.set(null);
    this.toast.mostrar('Movimiento eliminado.', 'info');
  }

  protected editarCartera(): void {
    this.formCartera.set(true);
  }

  protected alGuardarCartera(): void {
    this.formCartera.set(false);
    this.toast.mostrar('Cartera actualizada correctamente.');
  }

  protected agregarContribuyente(): void {
    this.formMiembro.set(true);
  }

  protected alAgregarContribuyente(evento: { nombre: string }): void {
    this.formMiembro.set(false);
    this.toast.mostrar(`${evento.nombre} se agregó a la cartera.`);
  }

  protected confirmarQuitar(): void {
    const miembro = this.quitar();
    if (!miembro) return;
    this.carterasService.eliminarMiembro(miembro.idMiembro);
    this.quitar.set(null);
    this.toast.mostrar('Contribuyente retirado de la cartera.', 'info');
  }

  protected confirmarFinalizar(): void {
    const cartera = this.cartera();
    if (!cartera) return;
    this.carterasService.archivar(cartera.idCartera);
    this.finalizar.set(false);
    this.toast.mostrar(`"${cartera.nombreCartera}" se finalizó. Balance disponible en la pestaña de cierre.`, 'info');
  }

  protected reactivar(): void {
    const cartera = this.cartera();
    if (!cartera) return;
    this.carterasService.reactivar(cartera.idCartera);
    this.toast.mostrar('Cartera reactivada. Ya puedes registrar movimientos.');
  }

  protected regenerarCodigo(): void {
    const cartera = this.cartera();
    if (!cartera) return;
    const codigo = this.carterasService.regenerarCodigo(cartera.idCartera);
    this.toast.mostrar(`Nuevo código generado: ${codigo}. El anterior ya no es válido.`, 'info');
  }

  protected copiar(texto: string): void {
    navigator.clipboard
      .writeText(texto)
      .then(() => this.toast.mostrar('Copiado al portapapeles.'))
      .catch(() => this.toast.mostrar('No fue posible copiar automáticamente.', 'error'));
  }

  protected compartir(): void {
    const cartera = this.cartera();
    if (!cartera) return;

    const datos = {
      title: `Únete a ${cartera.nombreCartera}`,
      text: `Te invito a participar en la cartera "${cartera.nombreCartera}" en FinanzApp. Código: ${cartera.codigoInvitacion}`,
      url: this.enlaceInvitacion(),
    };

    if (typeof navigator.share === 'function') {
      navigator.share(datos).catch(() => undefined);
      return;
    }

    this.copiar(`${datos.text} ${datos.url}`);
  }

  protected imprimir(): void {
    window.print();
  }
}
