import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetodoPago, TipoTransaccion, Transaccion } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CarterasService } from '../../core/services/carteras.service';
import { TransaccionesService } from '../../core/services/transacciones.service';
import { hoyISO } from '../../core/utils/format';
import { Icon } from '../../shared/icon';
import { Modal } from '../../shared/ui';

@Component({
  selector: 'app-transaccion-form',
  imports: [ReactiveFormsModule, Modal, Icon],
  template: `
    <app-modal
      [abierto]="abierto()"
      [titulo]="transaccion() ? 'Editar movimiento' : 'Registrar movimiento'"
      subtitulo="Los ingresos representan aportaciones al fondo; los gastos son consumos de la cartera."
      (cerrar)="cerrar.emit()"
    >
      <form [formGroup]="formulario" class="space-y-5" (ngSubmit)="guardar()">
        <div class="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
          <button
            type="button"
            class="flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            [class]="tipo() === 'gasto' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            (click)="tipo.set('gasto')"
          >
            <app-icon name="cart" [size]="16" />
            Gasto
          </button>
          <button
            type="button"
            class="flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            [class]="tipo() === 'ingreso' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            (click)="tipo.set('ingreso')"
          >
            <app-icon name="trend-up" [size]="16" />
            Ingreso
          </button>
        </div>

        @if (carteraFija()) {
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
            <p class="text-xs font-medium text-slate-500">Cartera</p>
            <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ nombreCarteraFija() }}</p>
          </div>
        } @else {
          <div>
            <label class="label" for="idCartera">Cartera</label>
            <select
              id="idCartera"
              formControlName="idCartera"
              class="input"
              (change)="cambiarCartera(+$any($event.target).value)"
            >
              @for (cartera of carterasDisponibles(); track cartera.idCartera) {
                <option [value]="cartera.idCartera">{{ cartera.nombreCartera }}</option>
              }
            </select>
          </div>
        }

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="label" for="idUsuario">Responsable</label>
            <select id="idUsuario" formControlName="idUsuario" class="input">
              @for (miembro of miembros(); track miembro.idUsuario) {
                <option [value]="miembro.idUsuario">{{ miembro.nombreUsuario }} {{ miembro.APaterno }}</option>
              }
            </select>
          </div>
          <div>
            <label class="label" for="monto">Monto (MXN)</label>
            <input id="monto" type="number" min="1" step="10" formControlName="monto" class="input" placeholder="850" />
            @if (invalido('monto')) {
              <p class="field-error">Ingresa un monto mayor a cero.</p>
            }
          </div>
        </div>

        @if (tipo() === 'gasto') {
          <div>
            <label class="label" for="categoria">Categoría del gasto</label>
            <select id="categoria" formControlName="idCategoriaGasto" class="input">
              @for (categoria of categorias; track categoria.idCategoriaGasto) {
                <option [value]="categoria.idCategoriaGasto">{{ categoria.nombreGasto }}</option>
              }
            </select>
          </div>
        }

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="label" for="fecha">Fecha</label>
            <input id="fecha" type="date" formControlName="fecha" class="input" />
            @if (invalido('fecha')) {
              <p class="field-error">Selecciona la fecha del movimiento.</p>
            }
          </div>
          <div>
            <label class="label" for="metodoPago">Método de pago</label>
            <select id="metodoPago" formControlName="metodoPago" class="input">
              @for (metodo of metodos; track metodo.valor) {
                <option [value]="metodo.valor">{{ metodo.etiqueta }}</option>
              }
            </select>
          </div>
        </div>

        <div>
          <label class="label" for="nota">Descripción</label>
          <input
            id="nota"
            type="text"
            formControlName="nota"
            class="input"
            placeholder="Despensa de la semana"
          />
          @if (invalido('nota')) {
            <p class="field-error">Agrega una descripción breve.</p>
          }
        </div>
      </form>

      <div modal-footer class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="btn btn-outline" (click)="cerrar.emit()">Cancelar</button>
        <button type="button" class="btn btn-primary" (click)="guardar()">
          <app-icon name="check" [size]="16" />
          {{ transaccion() ? 'Guardar cambios' : 'Registrar movimiento' }}
        </button>
      </div>
    </app-modal>
  `,
})
export class TransaccionForm {
  private readonly fb = inject(FormBuilder);
  private readonly carterasService = inject(CarterasService);
  private readonly transaccionesService = inject(TransaccionesService);
  private readonly auth = inject(AuthService);

  readonly abierto = input(false);
  readonly transaccion = input<Transaccion | null>(null);
  readonly carteraFija = input<number | null>(null);
  readonly usuarioFijo = input<number | null>(null);
  readonly cerrar = output<void>();
  readonly guardado = output<Transaccion>();

  protected readonly categorias = this.transaccionesService.categorias;
  protected readonly metodos: { valor: MetodoPago; etiqueta: string }[] = [
    { valor: 'efectivo', etiqueta: 'Efectivo' },
    { valor: 'tarjeta', etiqueta: 'Tarjeta' },
    { valor: 'transferencia', etiqueta: 'Transferencia' },
  ];
  protected readonly tipo = signal<TipoTransaccion>('gasto');
  protected readonly carteraSeleccionada = signal(0);

  protected readonly carterasDisponibles = computed(() => {
    const fija = this.carteraFija();
    if (fija) return this.carterasService.carteras().filter((c) => c.idCartera === fija);

    const idUsuario = this.auth.usuario()?.idUsuario ?? 0;
    return this.carterasService
      .carteras()
      .filter(
        (c) =>
          c.estado === 'activa' &&
          (c.idPropietario === idUsuario || this.carterasService.esMiembro(c.idCartera, idUsuario)),
      );
  });

  protected readonly miembros = computed(() => this.carterasService.usuariosDe(this.carteraSeleccionada()));

  protected readonly nombreCarteraFija = computed(
    () => this.carterasService.porId(this.carteraFija() ?? 0)?.nombreCartera ?? '',
  );

  protected readonly formulario = this.fb.nonNullable.group({
    idCartera: [0, [Validators.required]],
    idUsuario: [0, [Validators.required]],
    idCategoriaGasto: [1, [Validators.required]],
    monto: [null as number | null, [Validators.required, Validators.min(1)]],
    fecha: [hoyISO(), [Validators.required]],
    metodoPago: ['efectivo' as MetodoPago, [Validators.required]],
    nota: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor() {
    effect(() => {
      if (!this.abierto()) return;

      const transaccion = this.transaccion();
      const fija = this.carteraFija();
      const usuarioFijo = this.usuarioFijo();
      const disponibles = this.carterasDisponibles();

      if (transaccion) {
        this.tipo.set(transaccion.tipo);
        this.carteraSeleccionada.set(transaccion.idCartera);
        this.formulario.reset({
          idCartera: transaccion.idCartera,
          idUsuario: transaccion.idUsuario,
          idCategoriaGasto: transaccion.idCategoriaGasto,
          monto: transaccion.monto,
          fecha: transaccion.fecha,
          metodoPago: transaccion.metodoPago,
          nota: transaccion.nota,
        });
        return;
      }

      const idCartera = fija ?? disponibles[0]?.idCartera ?? 0;
      const idUsuario =
        usuarioFijo ?? this.carterasService.miembrosDe(idCartera)[0]?.idUsuario ?? 0;

      this.tipo.set('gasto');
      this.carteraSeleccionada.set(idCartera);
      this.formulario.reset({
        idCartera,
        idUsuario,
        idCategoriaGasto: 1,
        monto: null,
        fecha: hoyISO(),
        metodoPago: 'efectivo',
        nota: '',
      });
    });
  }

  protected cambiarCartera(idCartera: number): void {
    this.carteraSeleccionada.set(idCartera);
    const primerMiembro = this.carterasService.miembrosDe(idCartera)[0];
    if (primerMiembro) this.formulario.controls.idUsuario.setValue(primerMiembro.idUsuario);
  }

  protected invalido(campo: 'monto' | 'fecha' | 'nota'): boolean {
    const control = this.formulario.controls[campo];
    return control.touched && control.invalid;
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const categoria = this.transaccionesService.categoria(Number(valores.idCategoriaGasto));
    const datos = {
      idCartera: Number(valores.idCartera),
      idUsuario: Number(valores.idUsuario),
      idCategoriaGasto: this.tipo() === 'ingreso' ? 10 : Number(valores.idCategoriaGasto),
      nombreGasto: this.tipo() === 'ingreso' ? 'Aportación' : (categoria?.nombreGasto ?? 'Otros gastos'),
      tipo: this.tipo(),
      monto: Number(valores.monto),
      fecha: valores.fecha,
      metodoPago: valores.metodoPago,
      nota: valores.nota.trim(),
    };

    const existente = this.transaccion();
    if (existente) {
      this.transaccionesService.actualizar(existente.idTransaccion, datos);
      this.guardado.emit({ ...existente, ...datos });
      return;
    }

    this.guardado.emit(this.transaccionesService.crear(datos));
  }
}
