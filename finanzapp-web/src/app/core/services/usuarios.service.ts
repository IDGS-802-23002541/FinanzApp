import { Injectable, signal } from '@angular/core';
import { USUARIOS } from '../data/mock-data';
import { Usuario } from '../models';
import { colorAleatorio, hoyISO } from '../utils/format';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly lista = signal<Usuario[]>([...USUARIOS]);

  readonly usuarios = this.lista.asReadonly();

  porId(id: number): Usuario | undefined {
    return this.lista().find((u) => u.idUsuario === id);
  }

  porCorreo(correo: string): Usuario | undefined {
    const buscado = correo.trim().toLowerCase();
    return this.lista().find((u) => u.correo.toLowerCase() === buscado);
  }

  buscar(texto: string): Usuario[] {
    const buscado = texto.trim().toLowerCase();
    if (!buscado) return this.lista();
    return this.lista().filter((u) =>
      `${u.nombreUsuario} ${u.APaterno} ${u.AMaterno} ${u.correo}`.toLowerCase().includes(buscado),
    );
  }

  crear(datos: Omit<Usuario, 'idUsuario'>): Usuario {
    const siguiente = Math.max(0, ...this.lista().map((u) => u.idUsuario)) + 1;
    const nuevo: Usuario = { ...datos, idUsuario: siguiente };
    this.lista.update((lista) => [...lista, nuevo]);
    return nuevo;
  }

  registrarNuevo(datos: {
    nombreUsuario: string;
    APaterno: string;
    AMaterno: string;
    correo: string;
    telefono: string;
  }): Usuario {
    return this.crear({
      ...datos,
      correo: datos.correo.trim(),
      contrasena: 'demo123',
      rol: 'miembro',
      fechaCreacion: hoyISO(),
      color: colorAleatorio(datos.correo),
    });
  }

  actualizar(id: number, cambios: Partial<Usuario>): void {
    this.lista.update((lista) => lista.map((u) => (u.idUsuario === id ? { ...u, ...cambios } : u)));
  }
}
