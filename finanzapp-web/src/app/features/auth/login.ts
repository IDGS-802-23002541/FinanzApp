import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  template: `
    <div class="flex min-h-screen">
      <div class="hidden w-1/2 flex-col justify-between bg-brand-900 bg-linear-to-br from-brand-900 via-brand-800 to-slate-900 p-12 lg:flex">
        <a routerLink="/" class="flex items-center gap-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-brand-800">F</span>
          <span class="text-base font-bold tracking-tight text-white">FinanzApp</span>
        </a>

        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white">
            Las cuentas claras también se ven bien
          </h2>
          <p class="mt-4 max-w-md text-sm text-brand-100">
            Administra las carteras del hogar, tus viajes y los eventos del grupo con estadísticas en vivo y un
            cierre financiero automático.
          </p>

          <ul class="mt-8 space-y-4">
            @for (beneficio of beneficios; track beneficio) {
              <li class="flex items-start gap-3 text-sm text-brand-50">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <app-icon name="check" [size]="13" />
                </span>
                {{ beneficio }}
              </li>
            }
          </ul>
        </div>

        <p class="text-xs text-brand-200">
          Proyecto integrador · Universidad Tecnológica de León · IDGS1002
        </p>
      </div>

      <div class="flex w-full items-center justify-center px-4 py-10 sm:px-8 lg:w-1/2">
        <div class="w-full max-w-md">
          <a routerLink="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
            <app-icon name="arrow-left" [size]="16" />
            Volver al inicio
          </a>

          <div class="mt-8 lg:hidden">
            <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-700 text-base font-bold text-white">F</span>
          </div>

          <h1 class="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Inicia sesión</h1>
          <p class="mt-2 text-sm text-slate-500">
            Accede al panel web para consultar tus carteras, estadísticas y balances.
          </p>

          <form class="mt-8 space-y-5" [formGroup]="formulario" (ngSubmit)="enviar()" novalidate>
            <div>
              <label class="label" for="correo">Correo electrónico</label>
              <input
                id="correo"
                type="email"
                formControlName="correo"
                autocomplete="email"
                class="input"
                [class.border-rose-400]="correoInvalido()"
                placeholder="tucorreo@finanzapp.mx"
              />
              @if (correoInvalido()) {
                <p class="field-error">Ingresa un correo electrónico válido.</p>
              }
            </div>

            <div>
              <label class="label" for="contrasena">Contraseña</label>
              <div class="relative">
                <input
                  id="contrasena"
                  [type]="verContrasena() ? 'text' : 'password'"
                  formControlName="contrasena"
                  autocomplete="current-password"
                  class="input pr-11"
                  [class.border-rose-400]="contrasenaInvalida()"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-700"
                  (click)="verContrasena.set(!verContrasena())"
                  [attr.aria-label]="verContrasena() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <app-icon [name]="verContrasena() ? 'eye-off' : 'eye'" [size]="18" />
                </button>
              </div>
              @if (contrasenaInvalida()) {
                <p class="field-error">La contraseña debe tener al menos 6 caracteres.</p>
              }
            </div>

            @if (error()) {
              <div class="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                <app-icon name="alert" [size]="18" />
                <span>{{ error() }}</span>
              </div>
            }

            <button type="submit" class="btn btn-primary w-full py-3" [disabled]="cargando()">
              @if (cargando()) {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                Validando…
              } @else {
                Entrar al panel
                <app-icon name="chevron-right" [size]="16" />
              }
            </button>
          </form>

          <div class="mt-6 rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 p-4">
            <div class="flex items-start gap-3">
              <span class="mt-0.5 text-brand-700"><app-icon name="sparkles" [size]="18" /></span>
              <div class="flex-1">
                <p class="text-sm font-semibold text-slate-900">Cuenta demo</p>
                <p class="mt-0.5 text-xs text-slate-600">
                  Correo <span class="font-semibold">diego&#64;finanzapp.mx</span> · Contraseña
                  <span class="font-semibold">demo123</span>
                </p>
                <button type="button" class="btn btn-outline btn-sm mt-3" (click)="usarDemo()">
                  <app-icon name="eye" [size]="14" />
                  Entrar con la cuenta demo
                </button>
              </div>
            </div>
          </div>

          <p class="mt-6 text-center text-sm text-slate-500">
            ¿Aún no tienes cuenta?
            <a routerLink="/registro" class="link">Regístrate gratis</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected readonly beneficios = [
    'Carteras ilimitadas para hogar, viajes y eventos',
    'Invitaciones con código QR y clave única',
    'Estadísticas de gasto por categoría y por mes',
    'Cierre de cartera con balance y liquidación sugerida',
  ];

  protected readonly formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly verContrasena = signal(false);
  protected readonly error = signal('');
  protected readonly cargando = signal(false);

  protected correoInvalido(): boolean {
    const control = this.formulario.controls.correo;
    return control.touched && control.invalid;
  }

  protected contrasenaInvalida(): boolean {
    const control = this.formulario.controls.contrasena;
    return control.touched && control.invalid;
  }

  protected usarDemo(): void {
    this.formulario.setValue({ correo: 'diego@finanzapp.mx', contrasena: 'demo123' });
    this.enviar();
  }

  protected enviar(): void {
    this.error.set('');
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const { correo, contrasena } = this.formulario.getRawValue();

    setTimeout(() => {
      const resultado = this.auth.login(correo, contrasena);
      this.cargando.set(false);

      if (!resultado.ok) {
        this.error.set(resultado.mensaje);
        return;
      }

      this.toast.mostrar(resultado.mensaje);
      const destino = this.ruta.snapshot.queryParamMap.get('destino') ?? '/app/carteras';
      this.router.navigateByUrl(destino);
    }, 400);
  }
}
