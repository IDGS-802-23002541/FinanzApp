import { create } from 'zustand';
import { CARTERAS, MIEMBROS } from '../data/mock-data';
import type { Cartera, MiembroCartera, RolUsuario, Usuario } from '../types/models';
import { hoyISO } from '../utils/format';
import { useUsuariosStore } from './usuarios';

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

interface CarterasState {
  carteras: Cartera[];
  miembros: MiembroCartera[];
  crear: (datos: DatosCartera, idPropietario: number) => Cartera;
  actualizar: (id: number, cambios: Partial<Cartera>) => void;
  archivar: (id: number) => void;
  reactivar: (id: number) => void;
  eliminar: (id: number) => void;
  crearMiembro: (
    idCartera: number,
    idUsuario: number,
    rol: RolUsuario,
    aporteComprometido: number | null,
  ) => MiembroCartera;
  eliminarMiembro: (idMiembro: number) => void;
  regenerarCodigo: (idCartera: number) => string;
}

export const useCarterasStore = create<CarterasState>((set, get) => ({
  carteras: [...CARTERAS],
  miembros: [...MIEMBROS],

  crear(datos, idPropietario) {
    const siguiente = Math.max(0, ...get().carteras.map((c) => c.idCartera)) + 1;
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
      codigoInvitacion: generarCodigo(),
      color: datos.color,
    };
    set((s) => ({ carteras: [...s.carteras, cartera] }));
    get().crearMiembro(siguiente, idPropietario, 'admin', datos.presupuestoInicial);
    return cartera;
  },

  actualizar(id, cambios) {
    set((s) => ({
      carteras: s.carteras.map((c) => (c.idCartera === id ? { ...c, ...cambios } : c)),
    }));
  },

  archivar(id) {
    get().actualizar(id, { estado: 'inactiva', fechaCierre: hoyISO() });
  },

  reactivar(id) {
    set((s) => ({
      carteras: s.carteras.map((c) =>
        c.idCartera === id ? { ...c, estado: 'activa', fechaCierre: undefined } : c,
      ),
    }));
  },

  eliminar(id) {
    set((s) => ({
      carteras: s.carteras.filter((c) => c.idCartera !== id),
      miembros: s.miembros.filter((m) => m.idCartera !== id),
    }));
  },

  crearMiembro(idCartera, idUsuario, rol, aporteComprometido) {
    const siguiente = Math.max(0, ...get().miembros.map((m) => m.idMiembro)) + 1;
    const miembro: MiembroCartera = {
      idMiembro: siguiente,
      idCartera,
      idUsuario,
      rol,
      aporteComprometido,
      fechaUnion: hoyISO(),
    };
    set((s) => ({ miembros: [...s.miembros, miembro] }));
    return miembro;
  },

  eliminarMiembro(idMiembro) {
    set((s) => ({ miembros: s.miembros.filter((m) => m.idMiembro !== idMiembro) }));
  },

  regenerarCodigo(idCartera) {
    const codigo = generarCodigo();
    get().actualizar(idCartera, { codigoInvitacion: codigo });
    return codigo;
  },
}));

function generarCodigo(): string {
  let codigo = 'FZ-';
  for (let i = 0; i < 6; i++) codigo += ALFABETO.charAt(Math.floor(Math.random() * ALFABETO.length));
  return codigo;
}

/* ------------------------- lectura (no reactiva) ------------------------- */

export function carteraPorId(id: number): Cartera | undefined {
  return useCarterasStore.getState().carteras.find((c) => c.idCartera === id);
}

export function esPropietario(idCartera: number, idUsuario: number): boolean {
  return carteraPorId(idCartera)?.idPropietario === idUsuario;
}

export function esMiembroDe(idCartera: number, idUsuario: number): boolean {
  return useCarterasStore
    .getState()
    .miembros.some((m) => m.idCartera === idCartera && m.idUsuario === idUsuario);
}

export function miembrosDe(idCartera: number): MiembroCartera[] {
  return useCarterasStore.getState().miembros.filter((m) => m.idCartera === idCartera);
}

/* --------------------------- hooks reactivos ---------------------------- */

export function useCarteras(): Cartera[] {
  return useCarterasStore((s) => s.carteras);
}

export function useMiembros(): MiembroCartera[] {
  return useCarterasStore((s) => s.miembros);
}

export function useCarteraPorId(id: number): Cartera | undefined {
  const carteras = useCarteras();
  return carteras.find((c) => c.idCartera === id);
}

export function useMiembrosDe(idCartera: number): MiembroCartera[] {
  const miembros = useMiembros();
  return miembros.filter((m) => m.idCartera === idCartera);
}

export function useUsuariosDe(idCartera: number): Usuario[] {
  const miembros = useMiembrosDe(idCartera);
  const usuarios = useUsuariosStore((s) => s.usuarios);
  return miembros
    .map((m) => usuarios.find((u) => u.idUsuario === m.idUsuario))
    .filter((u): u is Usuario => u !== undefined);
}

export function useCarterasPropias(
  idUsuario: number | null | undefined,
  estado: 'activa' | 'inactiva',
): Cartera[] {
  const carteras = useCarteras();
  if (idUsuario === null || idUsuario === undefined) return [];
  return carteras.filter((c) => c.idPropietario === idUsuario && c.estado === estado);
}

export function useColaboraciones(
  idUsuario: number | null | undefined,
  estado: 'activa' | 'inactiva' = 'activa',
): Cartera[] {
  const carteras = useCarteras();
  const miembros = useMiembros();
  if (idUsuario === null || idUsuario === undefined) return [];
  return carteras.filter(
    (c) =>
      c.idPropietario !== idUsuario &&
      c.estado === estado &&
      miembros.some((m) => m.idCartera === c.idCartera && m.idUsuario === idUsuario),
  );
}

export function useInactivasDe(idUsuario: number | null | undefined): Cartera[] {
  const carteras = useCarteras();
  const miembros = useMiembros();
  if (idUsuario === null || idUsuario === undefined) return [];
  return carteras.filter(
    (c) =>
      c.estado === 'inactiva' &&
      (c.idPropietario === idUsuario ||
        miembros.some((m) => m.idCartera === c.idCartera && m.idUsuario === idUsuario)),
  );
}

export function useUsuariosDisponibles(idCartera: number): Usuario[] {
  const miembros = useMiembrosDe(idCartera);
  const usuarios = useUsuariosStore((s) => s.usuarios);
  const actuales = new Set(miembros.map((m) => m.idUsuario));
  return usuarios.filter((u) => !actuales.has(u.idUsuario));
}
