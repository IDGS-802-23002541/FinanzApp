import { Component, computed, input } from '@angular/core';
import { moneda, monedaCompacta, porcentaje } from '../core/utils/format';

export interface PuntoBarra {
  etiqueta: string;
  valor: number;
  secundario?: number;
}

@Component({
  selector: 'app-bar-chart',
  template: `
    <div class="w-full">
      @if (leyendaPrincipal()) {
        <div class="mb-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
          <span class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full" [style.background-color]="color()"></span>
            {{ leyendaPrincipal() }}
          </span>
          @if (mostrarSecundario()) {
            <span class="flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
              {{ leyendaSecundario() }}
            </span>
          }
        </div>
      }

      <div class="relative" [style.height.px]="alto()">
        @for (marca of marcas; track marca) {
          <div class="absolute inset-x-0 hidden items-center sm:flex" [style.bottom.%]="marca">
            <span class="w-12 shrink-0 text-right text-[10px] font-medium text-slate-400">
              {{ monedaCompacta((maximo() * marca) / 100) }}
            </span>
            <span class="ml-2 h-px flex-1 bg-slate-100"></span>
          </div>
        }

        <div class="absolute inset-y-0 right-0 left-0 flex items-end gap-1.5 sm:left-14 sm:gap-3">
          @for (punto of puntos(); track punto.etiqueta) {
            <div class="group relative flex h-full flex-1 items-end justify-center gap-1">
              <div
                class="w-full max-w-7 rounded-t-md transition-all duration-500"
                [style.height.%]="punto.porcentaje"
                [style.background-color]="color()"
              ></div>
              @if (mostrarSecundario()) {
                <div
                  class="w-full max-w-7 rounded-t-md bg-slate-300 transition-all duration-500"
                  [style.height.%]="punto.porcentajeSecundario"
                ></div>
              }
              <div
                class="pointer-events-none absolute bottom-full z-10 mb-2 hidden w-max rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg group-hover:block"
              >
                {{ punto.etiqueta }} · {{ moneda(punto.valor) }}
                @if (mostrarSecundario() && punto.secundario > 0) {
                  <span class="block font-medium text-slate-300">
                    {{ leyendaSecundario() }}: {{ moneda(punto.secundario) }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <div class="mt-2 flex gap-1.5 sm:gap-3 sm:pl-14">
        @for (punto of puntos(); track punto.etiqueta) {
          <span class="flex-1 truncate text-center text-[10px] font-medium text-slate-500 sm:text-[11px]">
            {{ punto.etiqueta }}
          </span>
        }
      </div>
    </div>
  `,
})
export class BarChart {
  readonly datos = input.required<PuntoBarra[]>();
  readonly alto = input(200);
  readonly color = input('#108354');
  readonly mostrarSecundario = input(false);
  readonly leyendaPrincipal = input('');
  readonly leyendaSecundario = input('Ingresos');

  protected readonly marcas = [100, 75, 50, 25, 0];

  protected readonly maximo = computed(() => {
    const valores = this.datos().flatMap((p) => [p.valor, this.mostrarSecundario() ? (p.secundario ?? 0) : 0]);
    const bruto = Math.max(1, ...valores);
    const magnitud = Math.pow(10, Math.floor(Math.log10(bruto)));
    return Math.ceil(bruto / magnitud) * magnitud;
  });

  protected readonly puntos = computed(() => {
    const maximo = this.maximo();
    return this.datos().map((punto) => ({
      etiqueta: punto.etiqueta,
      valor: punto.valor,
      secundario: punto.secundario ?? 0,
      porcentaje: Math.max(2, (punto.valor / maximo) * 100),
      porcentajeSecundario: this.mostrarSecundario()
        ? Math.max(2, ((punto.secundario ?? 0) / maximo) * 100)
        : 0,
    }));
  });

  protected readonly moneda = moneda;
  protected readonly monedaCompacta = monedaCompacta;
}

export interface SegmentoDona {
  etiqueta: string;
  valor: number;
  color: string;
}

@Component({
  selector: 'app-donut-chart',
  template: `
    <div class="flex flex-col items-center gap-6 sm:flex-row">
      <div class="relative h-44 w-44 shrink-0">
        <svg viewBox="0 0 42 42" class="h-full w-full -rotate-90">
          <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#f1f5f9" stroke-width="6" />
          @for (arco of arcos(); track arco.etiqueta) {
            <circle
              cx="21"
              cy="21"
              r="15.9155"
              fill="none"
              pathLength="100"
              stroke-width="6"
              [attr.stroke]="arco.color"
              [attr.stroke-dasharray]="arco.dash"
              [attr.stroke-dashoffset]="arco.offset"
            />
          }
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span class="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">{{ etiquetaCentro() }}</span>
          <span class="text-lg font-bold text-slate-900">{{ moneda(totalReal()) }}</span>
        </div>
      </div>

      <ul class="w-full space-y-2.5">
        @for (arco of arcos(); track arco.etiqueta) {
          <li class="flex items-center gap-3 text-sm">
            <span class="h-2.5 w-2.5 shrink-0 rounded-full" [style.background-color]="arco.color"></span>
            <span class="flex-1 truncate text-slate-600">{{ arco.etiqueta }}</span>
            <span class="font-semibold text-slate-900">{{ moneda(arco.valor) }}</span>
            <span class="w-10 text-right text-xs font-medium text-slate-400">{{ arco.porcentaje }}%</span>
          </li>
        } @empty {
          <li class="text-sm text-slate-500">Sin movimientos registrados.</li>
        }
      </ul>
    </div>
  `,
})
export class DonutChart {
  readonly segmentos = input.required<SegmentoDona[]>();
  readonly etiquetaCentro = input('Total');

  protected readonly totalReal = computed(() =>
    this.segmentos().reduce((total, segmento) => total + segmento.valor, 0),
  );

  protected readonly arcos = computed(() => {
    const total = this.totalReal() || 1;
    let acumulado = 0;
    return this.segmentos().map((segmento) => {
      const parte = porcentaje(segmento.valor, total);
      const arco = {
        etiqueta: segmento.etiqueta,
        valor: segmento.valor,
        color: segmento.color,
        porcentaje: parte,
        dash: `${parte} ${100 - parte}`,
        offset: -acumulado,
      };
      acumulado += parte;
      return arco;
    });
  });

  protected readonly moneda = moneda;
}
