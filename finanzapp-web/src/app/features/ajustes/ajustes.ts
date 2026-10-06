import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CarterasService } from '../../core/services/carteras.service';
import { ToastService } from '../../core/services/toast.service';
import { TransaccionesService } from '../../core/services/transacciones.service';
import { fechaLarga, moneda } from '../../core/utils/format';
import { sumar } from '../../core/utils/finanzas';
import { Icon } from '../../shared/icon';
import { Avatar, ConfirmModal, PageHeader } from '../../shared/ui';

type Seccion = 'perfil' | 'preferencias' | 'seguridad' | 'sesion';

@Component({
  selector: 'app-ajustes',
  imports: [ReactiveFormsModule, Icon, Avatar, ConfirmModal, PageHeader],
  template: `
    <app-page-header
      titulo="Ajustes"
      descripcion="Gestiona tu perfil, preferencias de la cuenta y opciones de seguridad."
    />

    <div class="grid gap-6 lg:grid-cols-3">
      <aside class="card h-max p-3">
        <div class="flex items-center gap-3 p-3">
          <app-avatar [usuario]="usuario()" tamano="md" />
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-slate-900">{{ usuario()?.nombreUsuario }}</p>
            <p class="truncate text-xs text-slate-500">{{ usuario()?.correo }}</p>
          </div>
        </div>
        <nav class="mt-2 space-y-1">
          @for (item of secciones; track item.id) {
            <button
              type="button"
              class="nav-link w-full cursor-pointer text-left"
              [class.nav-link-active]="seccion() === item.id"
              (click)="seccion.set(item.id)"
            >
              <app-icon [name]="item.icono" [size]="18" />
              {{ item.etiqueta }}
            </button>
          }
        </nav>
      </aside>

      <div class="lg:col-span-2">
        @switch (seccion()) {
          @case ('perfil') {
            <section class="card card-pad">
              <h2 class="section-title">Perfil</h2>
              <p class="mt-0.5 text-sm text-slate-500">Estos datos se muestran a los contribuyentes de tus carteras.</p>

              <form class="mt-6 space-y-5" [formGroup]="perfil" (ngSubmit)="guardarPerfil()">
                <div class="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label class="label" for="nombreUsuario">Nombre</label>
                    <input id="nombreUsuario" type="text" formControlName="nombreUsuario" class="input" />
                  </div>
                  <div>
                    <label class="label" for="APaterno">Apellido paterno</label>
                    <input id="APaterno" type="text" formControlName="APaterno" class="input" />
                  </div>
                  <div>
                    <label class="label" for="AMaterno">Apellido materno</label>
                    <input id="AMaterno" type="text" formControlName="AMaterno" class="input" />
                  </div>
                  <div>
                    <label class="label" for="telefono">Teléfono</label>
                    <input id="telefono" type="tel" formControlName="telefono" class="input" />
                  </div>
                </div>

                <div>
                  <label class="label" for="correo">Correo electrónico</label>
                  <input id="correo" type="email" formControlName="correo" class="input bg-slate-50" readonly />
                  <p class="help">El correo identifica tu cuenta y no puede modificarse en la demo.</p>
                </div>

                <div class="flex justify-end">
                  <button type="submit" class="btn btn-primary">
                    <app-icon name="check" [size]="16" />
                    Guardar cambios
                  </button>
                </div>
              </form>
            </section>
          }

          @case ('preferencias') {
            <section class="card card-pad">
              <h2 class="section-title">Preferencias</h2>
              <p class="mt-0.5 text-sm text-slate-500">Configura cómo quieres recibir la información de tus carteras.</p>

              <div class="mt-6 divide-y divide-slate-100">
                @for (preferencia of preferencias; track preferencia.clave) {
                  <div class="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p class="text-sm font-medium text-slate-900">{{ preferencia.titulo }}</p>
                      <p class="mt-0.5 text-xs text-slate-500">{{ preferencia.descripcion }}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      [attr.aria-checked]="valorPreferencia(preferencia.clave)"
                      class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors"
                      [class]="valorPreferencia(preferencia.clave) ? 'bg-brand-600' : 'bg-slate-300'"
                      (click)="alternar(preferencia.clave)"
                    >
                      <span
                        class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                        [class.translate-x-5]="valorPreferencia(preferencia.clave)"
                      ></span>
                    </button>
                  </div>
                }
              </div>

              <div class="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label class="label" for="moneda">Moneda</label>
                  <select id="moneda" class="input" [value]="monedaPreferida()" (change)="monedaPreferida.set($any($event.target).value)">
                    <option value="MXN">Peso mexicano (MXN)</option>
                    <option value="USD">Dólar estadounidense (USD)</option>
                  </select>
                  <p class="help">La versión demo opera con MXN en todos los reportes.</p>
                </div>
                <div>
                  <label class="label" for="inicio">Vista inicial</label>
                  <select id="inicio" class="input" [value]="vistaInicial()" (change)="vistaInicial.set($any($event.target).value)">
                    <option value="inicio">Panel de inicio</option>
                    <option value="carteras">Mis carteras</option>
                    <option value="transacciones">Transacciones</option>
                  </select>
                </div>
              </div>
            </section>
          }

          @case ('seguridad') {
            <section class="card card-pad">
              <h2 class="section-title">Seguridad</h2>
              <p class="mt-0.5 text-sm text-slate-500">Actualiza tu contraseña de acceso al panel web.</p>

              <form class="mt-6 space-y-5" [formGroup]="contrasenas" (ngSubmit)="cambiarContrasena()">
                <div>
                  <label class="label" for="actual">Contraseña actual</label>
                  <input id="actual" type="password" formControlName="actual" class="input" placeholder="••••••••" />
                  @if (invalido('actual')) {
                    <p class="field-error">Escribe tu contraseña actual.</p>
                  }
                </div>
                <div class="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label class="label" for="nueva">Nueva contraseña</label>
                    <input id="nueva" type="password" formControlName="nueva" class="input" placeholder="••••••••" />
                    @if (invalido('nueva')) {
                      <p class="field-error">Mínimo 6 caracteres.</p>
                    }
                  </div>
                  <div>
                    <label class="label" for="repetir">Repetir nueva contraseña</label>
                    <input id="repetir" type="password" formControlName="repetir" class="input" placeholder="••••••••" />
                  </div>
                </div>

                @if (errorContrasena()) {
                  <div class="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                    <app-icon name="alert" [size]="18" />
                    <span>{{ errorContrasena() }}</span>
                  </div>
                }

                <div class="flex justify-end">
                  <button type="submit" class="btn btn-primary">
                    <app-icon name="lock" [size]="16" />
                    Actualizar contraseña
                  </button>
                </div>
              </form>

              <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="flex items-start gap-3">
                  <span class="mt-0.5 text-slate-500"><app-icon name="shield" [size]="18" /></span>
                  <p class="text-xs text-slate-600">
                    En la versión de demostración las credenciales se almacenan en el navegador. En producción se
                    usaría autenticación con tokens y hash de contraseñas.
                  </p>
                </div>
              </div>
            </section>
          }

          @case ('sesion') {
            <section class="card card-pad">
              <h2 class="section-title">Cuenta y sesión</h2>
              <p class="mt-0.5 text-sm text-slate-500">Información general de tu cuenta en la demo.</p>

              <dl class="mt-6 grid gap-4 sm:grid-cols-2">
                <div class="rounded-2xl bg-slate-50 p-4">
                  <dt class="text-xs font-medium text-slate-400">Miembro desde</dt>
                  <dd class="mt-1 text-sm font-semibold text-slate-900">{{ fechaRegistro() }}</dd>
                </div>
                <div class="rounded-2xl bg-slate-50 p-4">
                  <dt class="text-xs font-medium text-slate-400">Rol</dt>
                  <dd class="mt-1 text-sm font-semibold text-slate-900">
                    {{ usuario()?.rol === 'admin' ? 'Administrador' : 'Miembro' }}
                  </dd>
                </div>
                <div class="rounded-2xl bg-slate-50 p-4">
                  <dt class="text-xs font-medium text-slate-400">Carteras propias</dt>
                  <dd class="mt-1 text-sm font-semibold text-slate-900">{{ carterasPropias() }}</dd>
                </div>
                <div class="rounded-2xl bg-slate-50 p-4">
                  <dt class="text-xs font-medium text-slate-400">Movimientos registrados</dt>
                  <dd class="mt-1 text-sm font-semibold text-slate-900">{{ movimientosPropios() }}</dd>
                </div>
              </dl>

              <div class="mt-6 flex flex-wrap gap-2">
                <button type="button" class="btn btn-outline" (click)="salir()">
                  <app-icon name="logout" [size]="16" />
                  Cerrar sesión
                </button>
                <button type="button" class="btn btn-danger" (click)="eliminarCuenta.set(true)">
                  <app-icon name="trash" [size]="16" />
                  Eliminar mi cuenta
                </button>
              </div>
            </section>
          }
        }
      </div>
    </div>

    <app-confirm-modal
      [abierto]="eliminarCuenta()"
      titulo="Eliminar cuenta"
      mensaje="Se eliminará tu sesión y tus datos locales de demostración. Las carteras creadas se conservarán en el navegador."
      textoConfirmar="Eliminar cuenta"
      (confirmar)="confirmarEliminarCuenta()"
      (cerrar)="eliminarCuenta.set(false)"
    />
  `,
})
export class Ajustes {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly carterasService = inject(CarterasService);
  private readonly transaccionesService = inject(TransaccionesService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly usuario = this.auth.usuario;
  protected readonly seccion = signal<Seccion>('perfil');
  protected readonly eliminarCuenta = signal(false);
  protected readonly errorContrasena = signal('');

  protected readonly secciones: { id: Seccion; etiqueta: string; icono: string }[] = [
    { id: 'perfil', etiqueta: 'Perfil', icono: 'user' },
    { id: 'preferencias', etiqueta: 'Preferencias', icono: 'settings' },
    { id: 'seguridad', etiqueta: 'Seguridad', icono: 'lock' },
    { id: 'sesion', etiqueta: 'Cuenta y sesión', icono: 'shield' },
  ];

  protected readonly preferencias = [
    {
      clave: 'notificaciones',
      titulo: 'Notificaciones de movimientos',
      descripcion: 'Avisar cuando alguien registre un gasto en mis carteras.',
    },
    {
      clave: 'resumenSemanal',
      titulo: 'Resumen semanal',
      descripcion: 'Recibir cada lunes el resumen de gastos e ingresos.',
    },
    {
      clave: 'alertasPresupuesto',
      titulo: 'Alertas de presupuesto',
      descripcion: 'Notificar cuando una cartera supere el 80% del presupuesto.',
    },
  ];

  private readonly activas = signal<Record<string, boolean>>({
    notificaciones: true,
    resumenSemanal: false,
    alertasPresupuesto: true,
  });

  protected readonly monedaPreferida = signal('MXN');
  protected readonly vistaInicial = signal('inicio');

  protected readonly perfil = this.fb.nonNullable.group({
    nombreUsuario: [this.usuario()?.nombreUsuario ?? '', [Validators.required]],
    APaterno: [this.usuario()?.APaterno ?? '', [Validators.required]],
    AMaterno: [this.usuario()?.AMaterno ?? ''],
    telefono: [this.usuario()?.telefono ?? ''],
    correo: [this.usuario()?.correo ?? ''],
  });

  protected readonly contrasenas = this.fb.nonNullable.group({
    actual: ['', [Validators.required]],
    nueva: ['', [Validators.required, Validators.minLength(6)]],
    repetir: ['', [Validators.required]],
  });

  protected readonly fechaRegistro = computed(() =>
    this.usuario() ? fechaLarga(this.usuario()!.fechaCreacion) : '—',
  );

  protected readonly carterasPropias = computed(() => {
    const id = this.usuario()?.idUsuario ?? 0;
    return this.carterasService.carteras().filter((cartera) => cartera.idPropietario === id).length;
  });

  protected readonly movimientosPropios = computed(() => {
    const id = this.usuario()?.idUsuario ?? 0;
    return this.transaccionesService.deUsuario(id).length;
  });

  protected readonly totalAportado = computed(() => {
    const id = this.usuario()?.idUsuario ?? 0;
    return sumar(
      this.transaccionesService.deUsuario(id).filter((t) => t.tipo === 'gasto'),
      'gasto',
    );
  });

  protected valorPreferencia(clave: string): boolean {
    return this.activas()[clave] ?? false;
  }

  protected alternar(clave: string): void {
    this.activas.update((activas) => ({ ...activas, [clave]: !activas[clave] }));
    this.toast.mostrar('Preferencia actualizada.', 'info');
  }

  protected invalido(campo: 'actual' | 'nueva'): boolean {
    const control = this.contrasenas.controls[campo];
    return control.touched && control.invalid;
  }

  protected guardarPerfil(): void {
    if (this.perfil.invalid) {
      this.perfil.markAllAsTouched();
      return;
    }
    const valores = this.perfil.getRawValue();
    this.auth.actualizar({
      nombreUsuario: valores.nombreUsuario.trim(),
      APaterno: valores.APaterno.trim(),
      AMaterno: valores.AMaterno.trim(),
      telefono: valores.telefono.trim(),
    });
    this.toast.mostrar('Perfil actualizado correctamente.');
  }

  protected cambiarContrasena(): void {
    this.errorContrasena.set('');
    if (this.contrasenas.invalid) {
      this.contrasenas.markAllAsTouched();
      return;
    }

    const valores = this.contrasenas.getRawValue();
    if (valores.actual !== this.usuario()?.contrasena) {
      this.errorContrasena.set('La contraseña actual no es correcta.');
      return;
    }
    if (valores.nueva !== valores.repetir) {
      this.errorContrasena.set('Las contraseñas nuevas no coinciden.');
      return;
    }

    this.auth.actualizar({ contrasena: valores.nueva });
    this.contrasenas.reset({ actual: '', nueva: '', repetir: '' });
    this.toast.mostrar('Contraseña actualizada correctamente.');
  }

  protected salir(): void {
    this.auth.salir();
    this.toast.mostrar('Cerraste sesión correctamente.', 'info');
    this.router.navigateByUrl('/');
  }

  protected confirmarEliminarCuenta(): void {
    this.eliminarCuenta.set(false);
    this.auth.salir();
    this.toast.mostrar('Tu cuenta demo se eliminó de esta sesión.', 'error');
    this.router.navigateByUrl('/');
  }

  protected readonly moneda = moneda;
}
