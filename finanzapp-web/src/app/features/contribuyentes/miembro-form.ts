import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolUsuario, Usuario } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CarterasService } from '../../core/services/carteras.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { Icon } from '../../shared/icon';
import { Modal } from '../../shared/ui';
import { nombreCompleto } from '../../core/utils/format';

@Component({
  selector: 'app-miembro-form',
  imports: [ReactiveFormsModule, Modal, Icon],
  template: `
    <app-modal
      [abierto]="abierto()"
      titulo="Agregar contribuyente"
      subtitulo="Puedes invitar a un usuario registrado o registrar a una persona nueva en la cartera."
      (cerrar)="cerrar.emit()"
    >
      <form [formGroup]="formulario" class="space-y-5" (ngSubmit)="guardar()">
        @if (idCartera()) {
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
            <p class="text-xs font-medium text-slate-500">Cartera destino</p>
            <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ nombreCarteraFija() }}</p>
          </div>
        } @else {
          <div>
            <label class="label" for="cartera">Cartera</label>
            <select
              id="cartera"
              formControlName="idCartera"
              class="input"
              (change)="carteraElegida.set(+$any($event.target).value)"
            >
              @for (cartera of carteras(); track cartera.idCartera) {
                <option [value]="cartera.idCartera">{{ cartera.nombreCartera }}</option>
              }
            </select>
          </div>
        }

        <div class="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
          <button
            type="button"
            class="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            [class]="modo() === 'existente' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            (click)="modo.set('existente')"
          >
            Usuario registrado
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            [class]="modo() === 'nuevo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            (click)="modo.set('nuevo')"
          >
            Persona nueva
          </button>
        </div>

        @if (modo() === 'existente') {
          @if (disponibles().length) {
            <div>
              <label class="label" for="idUsuario">Usuario</label>
              <select id="idUsuario" formControlName="idUsuario" class="input">
                @for (usuario of disponibles(); track usuario.idUsuario) {
                  <option [value]="usuario.idUsuario">{{ nombre(usuario) }} · {{ usuario.correo }}</option>
                }
              </select>
              <p class="help">Solo se muestran usuarios que aún no pertenecen a la cartera.</p>
            </div>
          } @else {
            <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center">
              <p class="text-sm font-medium text-slate-700">Todos los usuarios ya están en esta cartera</p>
              <p class="mt-1 text-xs text-slate-500">Cambia a “Persona nueva” para registrar a alguien más.</p>
            </div>
          }
        } @else {
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="label" for="nombre">Nombre</label>
              <input id="nombre" type="text" formControlName="nombreUsuario" class="input" placeholder="Nombre" />
              @if (invalido('nombreUsuario')) {
                <p class="field-error">Escribe el nombre.</p>
              }
            </div>
            <div>
              <label class="label" for="paterno">Apellido paterno</label>
              <input id="paterno" type="text" formControlName="APaterno" class="input" placeholder="Apellido" />
              @if (invalido('APaterno')) {
                <p class="field-error">Escribe el apellido.</p>
              }
            </div>
            <div>
              <label class="label" for="materno">Apellido materno</label>
              <input id="materno" type="text" formControlName="AMaterno" class="input" placeholder="Apellido" />
            </div>
            <div>
              <label class="label" for="telefono">Teléfono</label>
              <input id="telefono" type="tel" formControlName="telefono" class="input" placeholder="477 000 0000" />
            </div>
            <div class="sm:col-span-2">
              <label class="label" for="correo">Correo electrónico</label>
              <input id="correo" type="email" formControlName="correo" class="input" placeholder="correo@ejemplo.com" />
              @if (invalido('correo')) {
                <p class="field-error">Ingresa un correo válido.</p>
              }
            </div>
          </div>
        }

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="label" for="rol">Rol en la cartera</label>
            <select id="rol" formControlName="rol" class="input">
              <option value="miembro">Miembro</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div>
            <label class="label" for="aporte">Aporte comprometido (MXN)</label>
            <input id="aporte" type="number" min="0" step="100" formControlName="aporte" class="input" placeholder="2500" />
          </div>
        </div>
      </form>

      <div modal-footer class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="btn btn-outline" (click)="cerrar.emit()">Cancelar</button>
        <button type="button" class="btn btn-primary" (click)="guardar()" [disabled]="modo() === 'existente' && !disponibles().length">
          <app-icon name="plus" [size]="16" />
          Agregar a la cartera
        </button>
      </div>
    </app-modal>
  `,
})
export class MiembroForm {
  private readonly fb = inject(FormBuilder);
  private readonly carterasService = inject(CarterasService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly auth = inject(AuthService);

  readonly abierto = input(false);
  readonly idCartera = input<number | null>(null);
  readonly cerrar = output<void>();
  readonly guardado = output<{ idCartera: number; idUsuario: number; nombre: string }>();

  protected readonly modo = signal<'existente' | 'nuevo'>('existente');
  protected readonly carteraElegida = signal(0);

  protected readonly carteras = computed(() => {
    const idUsuario = this.auth.usuario()?.idUsuario ?? 0;
    return this.carterasService
      .carteras()
      .filter(
        (c) =>
          c.estado === 'activa' &&
          (c.idPropietario === idUsuario || this.carterasService.esMiembro(c.idCartera, idUsuario)),
      );
  });

  protected readonly disponibles = computed(() =>
    this.carterasService.usuariosDisponibles(this.carteraElegida()),
  );

  protected readonly nombreCarteraFija = computed(
    () => this.carterasService.porId(this.idCartera() ?? 0)?.nombreCartera ?? '',
  );

  protected readonly formulario = this.fb.nonNullable.group({
    idCartera: [0, [Validators.required]],
    idUsuario: [0],
    nombreUsuario: [''],
    APaterno: [''],
    AMaterno: [''],
    correo: [''],
    telefono: [''],
    rol: ['miembro' as RolUsuario, [Validators.required]],
    aporte: [null as number | null],
  });

  constructor() {
    effect(() => {
      if (!this.abierto()) return;

      const fija = this.idCartera();
      const disponibles = this.carteras();
      const idCartera = fija ?? disponibles[0]?.idCartera ?? 0;

      this.modo.set('existente');
      this.carteraElegida.set(idCartera);
      this.formulario.reset({
        idCartera,
        idUsuario: this.carterasService.usuariosDisponibles(idCartera)[0]?.idUsuario ?? 0,
        nombreUsuario: '',
        APaterno: '',
        AMaterno: '',
        correo: '',
        telefono: '',
        rol: 'miembro',
        aporte: null,
      });
    });
  }

  protected nombre(usuario: Usuario): string {
    return `${usuario.nombreUsuario} ${usuario.APaterno}`.trim();
  }

  protected invalido(campo: 'nombreUsuario' | 'APaterno' | 'correo'): boolean {
    const control = this.formulario.controls[campo];
    return control.touched && control.invalid;
  }

  protected guardar(): void {
    const valores = this.formulario.getRawValue();
    const idCartera = Number(valores.idCartera);
    const aporte = valores.aporte ? Number(valores.aporte) : null;

    if (this.modo() === 'existente') {
      const idUsuario = Number(valores.idUsuario);
      if (!idUsuario) return;
      this.carterasService.crearMiembro(idCartera, idUsuario, valores.rol, aporte);
      const usuario = this.usuariosService.porId(idUsuario);
      this.guardado.emit({ idCartera, idUsuario, nombre: nombreCompleto(usuario) });
      return;
    }

    if (!valores.nombreUsuario.trim() || !valores.APaterno.trim() || !this.formulario.controls.correo.valid) {
      this.formulario.controls.nombreUsuario.markAsTouched();
      this.formulario.controls.APaterno.markAsTouched();
      this.formulario.controls.correo.markAsTouched();
      return;
    }

    const usuario = this.usuariosService.registrarNuevo({
      nombreUsuario: valores.nombreUsuario.trim(),
      APaterno: valores.APaterno.trim(),
      AMaterno: valores.AMaterno.trim(),
      correo: valores.correo.trim(),
      telefono: valores.telefono.trim(),
    });

    this.carterasService.crearMiembro(idCartera, usuario.idUsuario, valores.rol, aporte);
    this.guardado.emit({ idCartera, idUsuario: usuario.idUsuario, nombre: nombreCompleto(usuario) });
  }
}
