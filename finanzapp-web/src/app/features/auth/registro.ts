import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Icon } from '../../shared/icon';

function contrasenasIguales(control: AbstractControl): ValidationErrors | null {
  const contrasena = control.get('contrasena')?.value;
  const confirmar = control.get('confirmar')?.value;
  return contrasena && confirmar && contrasena !== confirmar ? { distintas: true } : null;
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  template: `
    <div class="flex min-h-screen">
      <div class="hidden w-1/2 flex-col justify-between bg-slate-900 bg-linear-to-br from-brand-900 via-brand-800 to-slate-900 p-12 lg:flex">
        <a routerLink="/" class="flex items-center gap-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-brand-800">F</span>
          <span class="text-base font-bold tracking-tight text-white">FinanzApp</span>
        </a>

        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white">Crea tu primera cartera en minutos</h2>
          <p class="mt-4 max-w-md text-sm text-brand-100">
            Registra tu cuenta, define el presupuesto inicial y comparte el código QR con los participantes. No
            necesitas tarjeta ni instalar nada.
          </p>

          <div class="mt-8 grid grid-cols-2 gap-4">
            @for (dato of datos; track dato.etiqueta) {
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p class="text-xl font-bold text-white">{{ dato.valor }}</p>
                <p class="mt-1 text-xs text-brand-100">{{ dato.etiqueta }}</p>
              </div>
            }
          </div>
        </div>

        <p class="text-xs text-brand-200">Datos de demostración almacenados localmente en el navegador.</p>
      </div>

      <div class="flex w-full items-center justify-center px-4 py-10 sm:px-8 lg:w-1/2">
        <div class="w-full max-w-md">
          <a routerLink="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
            <app-icon name="arrow-left" [size]="16" />
            Volver al inicio
          </a>

          <h1 class="mt-8 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Crea tu cuenta</h1>
          <p class="mt-2 text-sm text-slate-500">Completa tus datos para comenzar a usar FinanzApp.</p>

          <form class="mt-8 space-y-5" [formGroup]="formulario" (ngSubmit)="enviar()" novalidate>
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label class="label" for="nombre">Nombre</label>
                <input id="nombre" type="text" formControlName="nombreUsuario" class="input" placeholder="Diego Yair" />
                @if (invalido('nombreUsuario')) {
                  <p class="field-error">Escribe tu nombre.</p>
                }
              </div>
              <div>
                <label class="label" for="telefono">Teléfono</label>
                <input id="telefono" type="tel" formControlName="telefono" class="input" placeholder="477 000 0000" />
              </div>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label class="label" for="paterno">Apellido paterno</label>
                <input id="paterno" type="text" formControlName="APaterno" class="input" placeholder="Borja" />
                @if (invalido('APaterno')) {
                  <p class="field-error">Escribe tu apellido paterno.</p>
                }
              </div>
              <div>
                <label class="label" for="materno">Apellido materno</label>
                <input id="materno" type="text" formControlName="AMaterno" class="input" placeholder="Romero" />
              </div>
            </div>

            <div>
              <label class="label" for="correo">Correo electrónico</label>
              <input id="correo" type="email" formControlName="correo" class="input" placeholder="tucorreo@finanzapp.mx" />
              @if (invalido('correo')) {
                <p class="field-error">Ingresa un correo electrónico válido.</p>
              }
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label class="label" for="contrasena">Contraseña</label>
                <input id="contrasena" type="password" formControlName="contrasena" class="input" placeholder="••••••••" />
                @if (invalido('contrasena')) {
                  <p class="field-error">Mínimo 6 caracteres.</p>
                }
              </div>
              <div>
                <label class="label" for="confirmar">Confirmar contraseña</label>
                <input id="confirmar" type="password" formControlName="confirmar" class="input" placeholder="••••••••" />
                @if (formulario.errors?.['distintas'] && formulario.controls.confirmar.touched) {
                  <p class="field-error">Las contraseñas no coinciden.</p>
                }
              </div>
            </div>

            <label class="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                formControlName="terminos"
                class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30"
              />
              <span>
                Acepto el uso de mis datos para fines académicos y de demostración de este proyecto integrador.
              </span>
            </label>
            @if (invalido('terminos')) {
              <p class="field-error">Confirma que aceptas los términos para continuar.</p>
            }

            @if (error()) {
              <div class="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                <app-icon name="alert" [size]="18" />
                <span>{{ error() }}</span>
              </div>
            }

            <button type="submit" class="btn btn-primary w-full py-3" [disabled]="cargando()">
              @if (cargando()) {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                Creando cuenta…
              } @else {
                Crear mi cuenta
                <app-icon name="chevron-right" [size]="16" />
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes una cuenta?
            <a routerLink="/login" class="link">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly datos = [
    { valor: '7', etiqueta: 'Carteras en la demo' },
    { valor: '3', etiqueta: 'Tipos de categoría' },
    { valor: '0$', etiqueta: 'Costo de uso' },
    { valor: '100%', etiqueta: 'Datos locales' },
  ];

  protected readonly formulario = this.fb.nonNullable.group(
    {
      nombreUsuario: ['', [Validators.required]],
      APaterno: ['', [Validators.required]],
      AMaterno: [''],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', [Validators.required]],
      terminos: [false, [Validators.requiredTrue]],
    },
    { validators: contrasenasIguales },
  );

  protected readonly error = signal('');
  protected readonly cargando = signal(false);

  protected invalido(campo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[campo];
    return control.touched && control.invalid;
  }

  protected enviar(): void {
    this.error.set('');
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      if (this.formulario.errors?.['distintas']) this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.cargando.set(true);
    const valores = this.formulario.getRawValue();

    setTimeout(() => {
      const resultado = this.auth.registrar({
        nombreUsuario: valores.nombreUsuario,
        APaterno: valores.APaterno,
        AMaterno: valores.AMaterno,
        correo: valores.correo,
        contrasena: valores.contrasena,
        telefono: valores.telefono,
      });
      this.cargando.set(false);

      if (!resultado.ok) {
        this.error.set(resultado.mensaje);
        return;
      }

      this.toast.mostrar('¡Bienvenido a FinanzApp! Tu cuenta quedó lista.');
      this.router.navigateByUrl('/app/carteras');
    }, 500);
  }
}
