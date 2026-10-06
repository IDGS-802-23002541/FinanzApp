import { inject, Injectable, signal } from '@angular/core';
import { CARTERAS, CATEGORIAS_CARTERA, MIEMBROS } from '../data/mock-data';
import { Cartera, CategoriaCartera, MiembroCartera, RolUsuario, Usuario } from '../models';
import { hoyISO } from '../utils/format';
import { UsuariosService } from './usuarios.service';

export interface DatosCartera {
  nombreCartera: string;
  descripcion: string;
  idCategoriaCartera: number;
  presupuestoInicial: number | null;
  color: string;
  fechaInicio?: string;
  fechaFin?: string;
}

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable({ providedIn: 'root' })
export class CarterasService {
  private readonly usuariosService = inject(UsuariosService);

  private readonly lista = signal<Cartera[]>([...CARTERAS]);
  private readonly listaMiembros = signal<MiembroCartera[]>([...MIEMBROS]);

  readonly carteras = this.lista.asReadonly();
  readonly miembros = this.listaMiembros.asReadonly();
  readonly categorias: CategoriaCartera[] = CATEGORIAS_CARTERA;

  porId(id: number): Cartera | undefined {
    return this.lista().find((c) => c.idCartera === id);
  }

  categoria(id: number): CategoriaCartera | undefined {
    return CATEGORIAS_CARTERA.find((c) => c.idCategoriaCartera === id);
  }

  nombreCategoria(id: number): string {
    return this.categoria(id)?.nombreCategoriaCartera ?? 'Otro';
  }

  miembrosDe(idCartera: number): MiembroCartera[] {
    return this.listaMiembros().filter((m) => m.idCartera === idCartera);
  }

  usuariosDe(idCartera: number): Usuario[] {
    return this.miembrosDe(idCartera)
      .map((m) => this.usuariosService.porId(m.idUsuario))
      .filter((u): u is Usuario => u !== undefined);
  }

  esPropietario(idCartera: number, idUsuario: number): boolean {
    return this.porId(idCartera)?.idPropietario === idUsuario;
  }

  esMiembro(idCartera: number, idUsuario: number): boolean {
    return this.listaMiembros().some((m) => m.idCartera === idCartera && m.idUsuario === idUsuario);
  }

  propiasDe(idUsuario: number, estado: 'activa' | 'inactiva'): Cartera[] {
    return this.lista().filter((c) => c.idPropietario === idUsuario && c.estado === estado);
  }

  colaboracionesDe(idUsuario: number, estado: 'activa' | 'inactiva' = 'activa'): Cartera[] {
    return this.lista().filter(
      (c) => c.idPropietario !== idUsuario && c.estado === estado && this.esMiembro(c.idCartera, idUsuario),
    );
  }

  inactivasDe(idUsuario: number): Cartera[] {
    return this.lista().filter(
      (c) =>
        c.estado === 'inactiva' && (c.idPropietario === idUsuario || this.esMiembro(c.idCartera, idUsuario)),
    );
  }

  usuariosDisponibles(idCartera: number): Usuario[] {
    const actuales = new Set(this.miembrosDe(idCartera).map((m) => m.idUsuario));
    return this.usuariosService.usuarios().filter((u) => !actuales.has(u.idUsuario));
  }

  crear(datos: DatosCartera, idPropietario: number): Cartera {
    const siguiente = Math.max(0, ...this.lista().map((c) => c.idCartera)) + 1;
    const cartera: Cartera = {
      idCartera: siguiente,
      nombreCartera: datos.nombreCartera,
      descripcion: datos.descripcion,
      idCategoriaCartera: datos.idCategoriaCartera,
      idPropietario,
      presupuestoInicial: datos.presupuestoInicial,
      estado: 'activa',
      fechaCreacion: hoyISO(),
      fechaInicio: datos.fechaInicio,
      fechaFin: datos.fechaFin,
      codigoInvitacion: this.generarCodigo(),
      color: datos.color,
    };
    this.lista.update((lista) => [...lista, cartera]);
    this.crearMiembro(siguiente, idPropietario, 'admin', datos.presupuestoInicial);
    return cartera;
  }

  actualizar(id: number, cambios: Partial<Cartera>): void {
    this.lista.update((lista) => lista.map((c) => (c.idCartera === id ? { ...c, ...cambios } : c)));
  }

  archivar(id: number): void {
    this.actualizar(id, { estado: 'inactiva', fechaCierre: hoyISO() });
  }

  reactivar(id: number): void {
    this.lista.update((lista) =>
      lista.map((c) => (c.idCartera === id ? { ...c, estado: 'activa', fechaCierre: undefined } : c)),
    );
  }

  eliminar(id: number): void {
    this.lista.update((lista) => lista.filter((c) => c.idCartera !== id));
    this.listaMiembros.update((lista) => lista.filter((m) => m.idCartera !== id));
  }

  crearMiembro(
    idCartera: number,
    idUsuario: number,
    rol: RolUsuario,
    aporteComprometido: number | null,
  ): MiembroCartera {
    const siguiente = Math.max(0, ...this.listaMiembros().map((m) => m.idMiembro)) + 1;
    const miembro: MiembroCartera = {
      idMiembro: siguiente,
      idCartera,
      idUsuario,
      rol,
      aporteComprometido,
      fechaUnion: hoyISO(),
    };
    this.listaMiembros.update((lista) => [...lista, miembro]);
    return miembro;
  }

  eliminarMiembro(idMiembro: number): void {
    this.listaMiembros.update((lista) => lista.filter((m) => m.idMiembro !== idMiembro));
  }

  regenerarCodigo(idCartera: number): string {
    const codigo = this.generarCodigo();
    this.actualizar(idCartera, { codigoInvitacion: codigo });
    return codigo;
  }

  private generarCodigo(): string {
    let codigo = 'FZ-';
    for (let i = 0; i < 6; i++) codigo += ALFABETO.charAt(Math.floor(Math.random() * ALFABETO.length));
    return codigo;
  }
}
