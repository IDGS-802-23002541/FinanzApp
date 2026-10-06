import { computed, inject, Injectable, signal } from '@angular/core';
import { Usuario } from '../models';
import { UsuariosService } from './usuarios.service';

const CLAVE_SESION = 'finanzapp.sesion';

export interface ResultadoAuth {
  ok: boolean;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuariosService = inject(UsuariosService);
  private readonly idUsuario = signal<number | null>(this.leerSesion());

  readonly usuario = computed<Usuario | null>(() => {
    const id = this.idUsuario();
    return id === null ? null : (this.usuariosService.porId(id) ?? null);
  });

  readonly autenticado = computed(() => this.usuario() !== null);

  login(correo: string, contrasena: string): ResultadoAuth {
    const usuario = this.usuariosService.porCorreo(correo);
    if (!usuario) return { ok: false, mensaje: 'No existe una cuenta con ese correo electrónico.' };
    if (usuario.contrasena !== contrasena) return { ok: false, mensaje: 'La contraseña es incorrecta.' };
    this.guardar(usuario.idUsuario);
    return { ok: true, mensaje: `Bienvenido de nuevo, ${usuario.nombreUsuario}.` };
  }

  registrar(datos: {
    nombreUsuario: string;
    APaterno: string;
    AMaterno: string;
    correo: string;
    contrasena: string;
    telefono: string;
  }): ResultadoAuth {
    if (this.usuariosService.porCorreo(datos.correo)) {
      return { ok: false, mensaje: 'Ese correo ya tiene una cuenta registrada.' };
    }
    const usuario = this.usuariosService.registrarNuevo({
      nombreUsuario: datos.nombreUsuario,
      APaterno: datos.APaterno,
      AMaterno: datos.AMaterno,
      correo: datos.correo,
      telefono: datos.telefono,
    });
    this.usuariosService.actualizar(usuario.idUsuario, { rol: 'admin', contrasena: datos.contrasena });
    this.guardar(usuario.idUsuario);
    return { ok: true, mensaje: 'Tu cuenta se creó correctamente.' };
  }

  actualizar(cambios: Partial<Usuario>): void {
    const actual = this.usuario();
    if (!actual) return;
    this.usuariosService.actualizar(actual.idUsuario, cambios);
  }

  salir(): void {
    this.idUsuario.set(null);
    localStorage.removeItem(CLAVE_SESION);
  }

  private guardar(id: number): void {
    this.idUsuario.set(id);
    localStorage.setItem(CLAVE_SESION, String(id));
  }

  private leerSesion(): number | null {
    try {
      const crudo = localStorage.getItem(CLAVE_SESION);
      return crudo ? Number(crudo) : null;
    } catch {
      return null;
    }
  }
}
