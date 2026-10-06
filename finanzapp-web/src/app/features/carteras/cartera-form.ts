import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cartera } from '../../core/models';
import { CarterasService, DatosCartera } from '../../core/services/carteras.service';
import { AuthService } from '../../core/services/auth.service';
import { Icon } from '../../shared/icon';
import { Modal } from '../../shared/ui';

@Component({
  selector: 'app-cartera-form',
  imports: [ReactiveFormsModule, Modal, Icon],
  template: `
    <app-modal
      [abierto]="abierto()"
      [titulo]="cartera() ? 'Editar cartera' : 'Nueva cartera'"
      subtitulo="Define la categoría, el presupuesto y el color de identificación."
      (cerrar)="cerrar.emit()"
    >
      <form [formGroup]="formulario" class="space-y-5" (ngSubmit)="guardar()">
        <div>
          <label class="label" for="nombreCartera">Nombre de la cartera</label>
          <input id="nombreCartera" type="text" formControlName="nombreCartera" class="input" placeholder="Viaje a Cancún" />
          @if (invalido('nombreCartera')) {
            <p class="field-error">Escribe un nombre de al menos 3 caracteres.</p>
          }
        </div>

        <div>
          <label class="label" for="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            rows="2"
            formControlName="descripcion"
            class="input resize-none"
            placeholder="¿Para qué se usará esta cartera?"
          ></textarea>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="label" for="categoria">Categoría</label>
            <select id="categoria" formControlName="idCategoriaCartera" class="input" (change)="categoria.set(+$any($event.target).value)">
              @for (item of categorias; track item.idCategoriaCartera) {
                <option [value]="item.idCategoriaCartera">{{ item.nombreCategoriaCartera }}</option>
              }
            </select>
            <p class="help">{{ ayudaCategoria() }}</p>
          </div>

          <div>
            <label class="label" for="presupuesto">Presupuesto inicial (MXN)</label>
            <input
              id="presupuesto"
              type="number"
              min="0"
              step="100"
              formControlName="presupuestoInicial"
              class="input"
              placeholder="15000"
            />
            <p class="help">Opcional. Se usa para calcular el avance.</p>
          </div>
        </div>

        @if (esFechas()) {
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="label" for="fechaInicio">Fecha de inicio</label>
              <input id="fechaInicio" type="date" formControlName="fechaInicio" class="input" />
            </div>
            <div>
              <label class="label" for="fechaFin">Fecha de fin</label>
              <input id="fechaFin" type="date" formControlName="fechaFin" class="input" />
            </div>
          </div>
        }

        <div>
          <span class="label">Color de la cartera</span>
          <div class="flex flex-wrap gap-2.5">
            @for (tono of colores; track tono) {
              <button
                type="button"
                class="h-9 w-9 cursor-pointer rounded-xl ring-offset-2 transition-transform hover:scale-105"
                [class.ring-2]="formulario.controls.color.value === tono"
                [class.ring-slate-900]="formulario.controls.color.value === tono"
                [style.background-color]="tono"
                (click)="formulario.controls.color.setValue(tono)"
                [attr.aria-label]="'Seleccionar color ' + tono"
              ></button>
            }
          </div>
        </div>
      </form>

      <div modal-footer class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="btn btn-outline" (click)="cerrar.emit()">Cancelar</button>
        <button type="button" class="btn btn-primary" (click)="guardar()">
          <app-icon name="check" [size]="16" />
          {{ cartera() ? 'Guardar cambios' : 'Crear cartera' }}
        </button>
      </div>
    </app-modal>
  `,
})
export class CarteraForm {
  private readonly fb = inject(FormBuilder);
  private readonly carterasService = inject(CarterasService);
  private readonly auth = inject(AuthService);

  readonly abierto = input(false);
  readonly cartera = input<Cartera | null>(null);
  readonly cerrar = output<void>();
  readonly guardado = output<Cartera>();

  protected readonly categorias = this.carterasService.categorias;
  protected readonly categoria = signal(1);
  protected readonly colores = [
    '#0d6945',
    '#2563eb',
    '#7c3aed',
    '#d97706',
    '#0891b2',
    '#e11d48',
    '#4f46e5',
    '#65a30d',
  ];

  protected readonly formulario = this.fb.nonNullable.group({
    nombreCartera: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    idCategoriaCartera: [1, [Validators.required]],
    presupuestoInicial: [null as number | null],
    color: ['#0d6945'],
    fechaInicio: [''],
    fechaFin: [''],
  });

  constructor() {
    effect(() => {
      const cartera = this.cartera();
      const abierto = this.abierto();
      if (!abierto) return;

      if (cartera) {
        this.categoria.set(cartera.idCategoriaCartera);
        this.formulario.reset({
          nombreCartera: cartera.nombreCartera,
          descripcion: cartera.descripcion,
          idCategoriaCartera: cartera.idCategoriaCartera,
          presupuestoInicial: cartera.presupuestoInicial,
          color: cartera.color,
          fechaInicio: cartera.fechaInicio ?? '',
          fechaFin: cartera.fechaFin ?? '',
        });
      } else {
        this.categoria.set(1);
        this.formulario.reset({
          nombreCartera: '',
          descripcion: '',
          idCategoriaCartera: 1,
          presupuestoInicial: null,
          color: this.colores[Math.floor(Math.random() * this.colores.length)],
          fechaInicio: '',
          fechaFin: '',
        });
      }
    });
  }

  protected esFechas(): boolean {
    return this.categoria() === 2 || this.categoria() === 3;
  }

  protected ayudaCategoria(): string {
    if (this.categoria() === 1) return 'Ideal para gastos recurrentes del hogar.';
    if (this.categoria() === 2) return 'Permite registrar fecha de inicio y fin del viaje.';
    if (this.categoria() === 3) return 'Bodas, posadas, cumpleaños y eventos del grupo.';
    return 'Proyectos y gastos especiales.';
  }

  protected invalido(campo: 'nombreCartera'): boolean {
    const control = this.formulario.controls[campo];
    return control.touched && control.invalid;
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const datos: DatosCartera = {
      nombreCartera: valores.nombreCartera.trim(),
      descripcion: valores.descripcion.trim(),
      idCategoriaCartera: Number(valores.idCategoriaCartera),
      presupuestoInicial: valores.presupuestoInicial ? Number(valores.presupuestoInicial) : null,
      color: valores.color,
      fechaInicio: this.esFechas() && valores.fechaInicio ? valores.fechaInicio : undefined,
      fechaFin: this.esFechas() && valores.fechaFin ? valores.fechaFin : undefined,
    };

    const existente = this.cartera();
    if (existente) {
      this.carterasService.actualizar(existente.idCartera, datos);
      this.guardado.emit({ ...existente, ...datos });
      return;
    }

    const propietario = this.auth.usuario()?.idUsuario ?? 1;
    this.guardado.emit(this.carterasService.crear(datos, propietario));
  }
}
