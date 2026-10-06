import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BarChart } from '../../shared/charts';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, Icon, BarChart],
  template: `
    <header class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <a routerLink="/" class="flex items-center gap-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white">F</span>
          <span class="text-base font-bold tracking-tight text-slate-900">
            Finanz<span class="text-brand-700">App</span>
          </span>
        </a>

        <nav class="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#problema" class="transition-colors hover:text-slate-900">El problema</a>
          <a href="#caracteristicas" class="transition-colors hover:text-slate-900">Características</a>
          <a href="#como-funciona" class="transition-colors hover:text-slate-900">Cómo funciona</a>
          <a href="#modulos" class="transition-colors hover:text-slate-900">App y web</a>
        </nav>

        <div class="flex items-center gap-2">
          <a routerLink="/login" class="btn btn-ghost btn-sm hidden sm:inline-flex">Iniciar sesión</a>
          <a routerLink="/registro" class="btn btn-primary btn-sm">
            Crear cuenta
            <app-icon name="chevron-right" [size]="14" />
          </a>
        </div>
      </div>
    </header>

    <section class="relative overflow-hidden bg-white">
      <div class="pointer-events-none absolute -top-40 -right-32 h-96 w-96 rounded-full bg-brand-100/70 blur-3xl"></div>
      <div class="pointer-events-none absolute top-40 -left-40 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl"></div>

      <div class="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div class="animate-elevar">
          <span class="chip border-brand-200 bg-brand-50 text-brand-800">
            <app-icon name="sparkles" [size]="14" />
            Finanzas compartidas, sin discusiones
          </span>

          <h1 class="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Todas las cuentas claras en
            <span class="text-brand-700">una sola cartera</span>
          </h1>

          <p class="mt-5 max-w-xl text-lg text-slate-600">
            FinanzApp centraliza los gastos del hogar, los viajes y los eventos. Registra movimientos desde el
            celular y analiza balances, aportaciones y cierres desde el panel web.
          </p>

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <a routerLink="/registro" class="btn btn-primary px-5 py-3">
              Comenzar gratis
              <app-icon name="chevron-right" [size]="16" />
            </a>
            <a routerLink="/login" class="btn btn-outline px-5 py-3">
              <app-icon name="eye" [size]="16" />
              Ver demo
            </a>
          </div>

          <dl class="mt-10 grid max-w-lg grid-cols-3 gap-4">
            <div>
              <dt class="text-2xl font-bold text-slate-900">7</dt>
              <dd class="text-xs font-medium text-slate-500">Carteras activas en la demo</dd>
            </div>
            <div>
              <dt class="text-2xl font-bold text-slate-900">28</dt>
              <dd class="text-xs font-medium text-slate-500">Contribuyentes registrados</dd>
            </div>
            <div>
              <dt class="text-2xl font-bold text-slate-900">4.9</dt>
              <dd class="text-xs font-medium text-slate-500">Satisfacción del equipo</dd>
            </div>
          </dl>
        </div>

        <div class="animate-elevar relative">
          <div class="card card-pad mx-auto max-w-md">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">Casa Borja · Hogar</p>
                <p class="mt-1 text-2xl font-bold text-slate-900">$68,770</p>
              </div>
              <span class="badge bg-brand-50 text-brand-700">
                <app-icon name="trend-up" [size]="14" />
                80% del presupuesto
              </span>
            </div>
            <div class="mt-5">
              <app-bar-chart
                [datos]="serieDemo"
                [alto]="150"
                color="#0d6945"
                leyendaPrincipal="Gastos por mes"
              />
            </div>
            <div class="mt-5 space-y-3 border-t border-slate-100 pt-5">
              @for (movimiento of movimientosDemo; track movimiento.nota) {
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-9 w-9 items-center justify-center rounded-xl"
                    [class]="movimiento.tipo === 'ingreso' ? 'bg-brand-50 text-brand-700' : 'bg-rose-50 text-rose-600'"
                  >
                    <app-icon [name]="movimiento.tipo === 'ingreso' ? 'trend-up' : 'cart'" [size]="17" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-slate-800">{{ movimiento.nota }}</p>
                    <p class="text-xs text-slate-500">{{ movimiento.usuario }}</p>
                  </div>
                  <span
                    class="text-sm font-bold"
                    [class]="movimiento.tipo === 'ingreso' ? 'text-brand-700' : 'text-slate-900'"
                  >
                    {{ movimiento.tipo === 'ingreso' ? '+' : '−' }}&#36;{{ movimiento.monto }}
                  </span>
                </div>
              }
            </div>
          </div>

          <div class="card absolute -bottom-10 -left-2 hidden w-56 p-4 shadow-lg sm:block lg:-left-12">
            <div class="flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <app-icon name="qr" [size]="20" />
              </span>
              <div>
                <p class="text-xs font-semibold text-slate-900">Únete con QR</p>
                <p class="text-[11px] text-slate-500">Escanea y aporta en segundos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="problema" class="border-y border-slate-200 bg-slate-50 py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <span class="text-xs font-bold tracking-widest text-brand-700 uppercase">El problema</span>
          <h2 class="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Coordinar gastos compartidos suele terminar en descontrol
          </h2>
          <p class="mt-4 text-slate-600">
            En México existe un alto grado de analfabetismo financiero y una falta de herramientas para coordinar
            gastos grupales. El resultado: presupuestos rebasados, falta de transparencia y desacuerdos.
          </p>
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-3">
          @for (problema of problemas; track problema.titulo) {
            <div class="card card-pad">
              <span class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <app-icon [name]="problema.icono" [size]="22" />
              </span>
              <h3 class="mt-4 text-base font-semibold text-slate-900">{{ problema.titulo }}</h3>
              <p class="mt-2 text-sm text-slate-600">{{ problema.descripcion }}</p>
            </div>
          }
        </div>

        <div class="mt-10 rounded-2xl border border-brand-200 bg-brand-50/70 p-6 sm:p-8">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white">
              <app-icon name="shield" [size]="24" />
            </span>
            <div>
              <h3 class="text-base font-semibold text-slate-900">La solución: transparencia por diseño</h3>
              <p class="mt-1 text-sm text-slate-700">
                Cada aportación, gasto y saldo queda registrado en su cartera. Al cerrar, FinanzApp calcula el
                balance final y sugiere quién debe pagarle a quién.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="caracteristicas" class="bg-white py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <span class="text-xs font-bold tracking-widest text-brand-700 uppercase">Características</span>
          <h2 class="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Todo lo que necesitas para administrar dinero en grupo
          </h2>
        </div>

        <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (caracteristica of caracteristicas; track caracteristica.titulo) {
            <div class="card card-pad transition-shadow hover:shadow-md">
              <span class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <app-icon [name]="caracteristica.icono" [size]="22" />
              </span>
              <h3 class="mt-4 text-base font-semibold text-slate-900">{{ caracteristica.titulo }}</h3>
              <p class="mt-2 text-sm text-slate-600">{{ caracteristica.descripcion }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <section id="como-funciona" class="border-y border-slate-200 bg-slate-50 py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <span class="text-xs font-bold tracking-widest text-brand-700 uppercase">Cómo funciona</span>
          <h2 class="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tres pasos para tener tus cuentas claras
          </h2>
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-3">
          @for (paso of pasos; track paso.numero) {
            <div class="card card-pad">
              <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white">
                {{ paso.numero }}
              </span>
              <h3 class="mt-4 text-base font-semibold text-slate-900">{{ paso.titulo }}</h3>
              <p class="mt-2 text-sm text-slate-600">{{ paso.descripcion }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <section id="modulos" class="bg-white py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <span class="text-xs font-bold tracking-widest text-brand-700 uppercase">Dos plataformas</span>
          <h2 class="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            La app registra, la web analiza
          </h2>
        </div>

        <div class="mt-10 grid gap-6 lg:grid-cols-2">
          <div class="card card-pad">
            <div class="flex items-center gap-3">
              <span class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <app-icon name="mobile" [size]="22" />
              </span>
              <div>
                <h3 class="text-base font-semibold text-slate-900">App móvil</h3>
                <p class="text-xs text-slate-500">Registro rápido en campo</p>
              </div>
            </div>
            <ul class="mt-5 space-y-3">
              @for (item of modulosMovil; track item) {
                <li class="flex items-start gap-3 text-sm text-slate-700">
                  <span class="mt-0.5 text-brand-600"><app-icon name="check" [size]="16" /></span>
                  {{ item }}
                </li>
              }
            </ul>
          </div>

          <div class="card card-pad">
            <div class="flex items-center gap-3">
              <span class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <app-icon name="chart" [size]="22" />
              </span>
              <div>
                <h3 class="text-base font-semibold text-slate-900">Panel web</h3>
                <p class="text-xs text-slate-500">Centro de control analítico</p>
              </div>
            </div>
            <ul class="mt-5 space-y-3">
              @for (item of modulosWeb; track item) {
                <li class="flex items-start gap-3 text-sm text-slate-700">
                  <span class="mt-0.5 text-brand-600"><app-icon name="check" [size]="16" /></span>
                  {{ item }}
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="border-y border-slate-200 bg-slate-50 py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <span class="text-xs font-bold tracking-widest text-brand-700 uppercase">Testimonios</span>
          <h2 class="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Equipos que ya dividen cuentas sin discutir
          </h2>
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-3">
          @for (testimonio of testimonios; track testimonio.nombre) {
            <figure class="card card-pad">
              <div class="flex gap-1 text-amber-500">
                @for (estrella of [1, 2, 3, 4, 5]; track estrella) {
                  <app-icon name="star" [size]="16" />
                }
              </div>
              <blockquote class="mt-4 text-sm text-slate-700">“{{ testimonio.texto }}”</blockquote>
              <figcaption class="mt-4 border-t border-slate-100 pt-4">
                <p class="text-sm font-semibold text-slate-900">{{ testimonio.nombre }}</p>
                <p class="text-xs text-slate-500">{{ testimonio.rol }}</p>
              </figcaption>
            </figure>
          }
        </div>
      </div>
    </section>

    <section class="bg-slate-900 py-16 lg:py-20">
      <div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Empieza a organizar tus finanzas compartidas hoy
        </h2>
        <p class="mx-auto mt-4 max-w-2xl text-slate-300">
          Crea tu cartera, invita a los participantes con un código QR y registra el primer movimiento en menos de
          un minuto.
        </p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a routerLink="/registro" class="btn btn-primary px-6 py-3">
            Crear cuenta gratis
            <app-icon name="chevron-right" [size]="16" />
          </a>
          <a routerLink="/login" class="btn btn-outline border-slate-700 bg-transparent px-6 py-3 text-slate-100 hover:bg-slate-800">
            Entrar a la demo
          </a>
        </div>
      </div>
    </section>

    <footer class="border-t border-slate-200 bg-white py-10">
      <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white">F</span>
            <span class="text-sm font-bold text-slate-900">FinanzApp</span>
          </div>
          <p class="mt-3 max-w-sm text-xs text-slate-500">
            Proyecto integrador de la Universidad Tecnológica de León · Ingeniería en Desarrollo y Gestión de
            Software · Grupo IDGS1002.
          </p>
        </div>
        <div class="flex flex-wrap gap-x-8 gap-y-2 text-xs font-medium text-slate-500">
          <a routerLink="/login" class="transition-colors hover:text-slate-900">Iniciar sesión</a>
          <a routerLink="/registro" class="transition-colors hover:text-slate-900">Crear cuenta</a>
          <a href="#caracteristicas" class="transition-colors hover:text-slate-900">Características</a>
          <a href="#modulos" class="transition-colors hover:text-slate-900">Plataformas</a>
        </div>
      </div>
    </footer>
  `,
})
export class Landing {
  protected readonly serieDemo = [
    { etiqueta: 'abr', valor: 9800 },
    { etiqueta: 'may', valor: 12400 },
    { etiqueta: 'jun', valor: 8600 },
    { etiqueta: 'jul', valor: 13100 },
    { etiqueta: 'ago', valor: 11900 },
    { etiqueta: 'sep', valor: 12970 },
  ];

  protected readonly movimientosDemo = [
    { nota: 'Recibo de luz', usuario: 'Diego Borja', monto: '1,240', tipo: 'gasto' },
    { nota: 'Aportación al fondo', usuario: 'Aideé Casillas', monto: '4,500', tipo: 'ingreso' },
    { nota: 'Despensa de la semana', usuario: 'Diego Borja', monto: '1,510', tipo: 'gasto' },
  ];

  protected readonly problemas = [
    {
      icono: 'alert',
      titulo: 'Presupuestos rebasados',
      descripcion: 'Sin un registro común es imposible saber cuánto se ha gastado y cuánto queda disponible.',
    },
    {
      icono: 'eye-off',
      titulo: 'Falta de transparencia',
      descripcion: 'Los aportes se pierden entre transferencias y notas de voz, nadie sabe quién puso qué.',
    },
    {
      icono: 'users',
      titulo: 'Desacuerdos al cerrar',
      descripcion: 'Al final del viaje o del mes nadie coincide con los números y la convivencia se tensa.',
    },
  ];

  protected readonly caracteristicas = [
    {
      icono: 'wallet',
      titulo: 'Carteras colaborativas',
      descripcion: 'Crea carteras para el hogar, un viaje o un evento, e invita a todos los participantes.',
    },
    {
      icono: 'qr',
      titulo: 'Invitación con código QR',
      descripcion: 'Cada cartera genera un QR y una clave única para unir contribuyentes en segundos.',
    },
    {
      icono: 'receipt',
      titulo: 'Registro de movimientos',
      descripcion: 'Ingresos y gastos categorizados, con foto opcional y responsable identificado.',
    },
    {
      icono: 'chart',
      titulo: 'Panel analítico',
      descripcion: 'Gráficas de gasto por categoría y por mes, avance del presupuesto y top de contribuyentes.',
    },
    {
      icono: 'users',
      titulo: 'Gestión de contribuyentes',
      descripcion: 'Agrega, consulta o elimina participantes de cada cartera con su aporte comprometido.',
    },
    {
      icono: 'archive',
      titulo: 'Cierre y balance final',
      descripcion: 'Finaliza la cartera y obtén el balance de gastos con la liquidación sugerida entre miembros.',
    },
  ];

  protected readonly pasos = [
    {
      numero: '1',
      titulo: 'Crea tu cartera',
      descripcion: 'Define categoría, presupuesto inicial y fechas. Si es un viaje o evento, agrega el rango completo.',
    },
    {
      numero: '2',
      titulo: 'Invita y registra',
      descripcion: 'Comparte el QR y registra ingresos y gastos desde el celular o desde el panel web.',
    },
    {
      numero: '3',
      titulo: 'Analiza y cierra',
      descripcion: 'Consulta estadísticas en la web, finaliza la cartera y comparte el balance de gastos.',
    },
  ];

  protected readonly modulosMovil = [
    'Login y consulta rápida de tus carteras',
    'Registro de ingresos y egresos diarios en segundos',
    'Unirse a una cartera escaneando el código QR',
    'Resumen con accesos directos a cada cartera',
    'Ajustes de cuenta y preferencias de eventos',
  ];

  protected readonly modulosWeb = [
    'Landing informativa y registro de usuarios',
    'CRUD completo de carteras, contribuyentes y transacciones',
    'Estadísticas por cartera y avance del presupuesto',
    'Generación de QR y clave única de invitación',
    'Finalizar cartera con balance de gastos final',
  ];

  protected readonly testimonios = [
    {
      texto:
        'Antes llevábamos todo en una libreta y siempre faltaba dinero. Con FinanzApp terminamos el viaje sin una sola discusión.',
      nombre: 'Mariana López',
      rol: 'Organizadora de viajes grupales',
    },
    {
      texto:
        'La cartera del hogar nos cambió la vida: cada quien registra su gasto desde el celular y el viernes revisamos juntos las gráficas.',
      nombre: 'Carlos Méndez',
      rol: 'Administrador del hogar',
    },
    {
      texto:
        'Usamos las carteras del grupo para la posada y el balance final llegó solo. Ya no hay rifas raras para ver quién pagó qué.',
      nombre: 'Ricardo Medina',
      rol: 'Representante de grupo universitario',
    },
  ];
}
