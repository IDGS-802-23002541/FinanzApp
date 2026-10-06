import { create } from 'zustand';
import { USUARIOS } from '../data/mock-data';
import type { Usuario } from '../types/models';
import { colorAleatorio, hoyISO } from '../utils/format';

export interface DatosNuevoUsuario {
  nombreUsuario: string;
  APaterno: string;
  AMaterno: string;
  correo: string;
  telefono: string;
}

interface UsuariosState {
  usuarios: Usuario[];
  crear: (datos: Omit<Usuario, 'idUsuario'>) => Usuario;
  registrarNuevo: (datos: DatosNuevoUsuario) => Usuario;
  actualizar: (id: number, cambios: Partial<Usuario>) => void;
}

export const useUsuariosStore = create<UsuariosState>((set, get) => ({
  usuarios: [...USUARIOS],

  crear(datos) {
    const siguiente = Math.max(0, ...get().usuarios.map((u) => u.idUsuario)) + 1;
    const nuevo: Usuario = { ...datos, idUsuario: siguiente };
    set((s) => ({ usuarios: [...s.usuarios, nuevo] }));
    return nuevo;
  },

  registrarNuevo(datos) {
    return get().crear({
      ...datos,
      correo: datos.correo.trim(),
      contrasena: 'demo123',
      rol: 'miembro',
      fechaCreacion: hoyISO(),
      color: colorAleatorio(datos.correo),
    });
  },

  actualizar(id, cambios) {
    set((s) => ({
      usuarios: s.usuarios.map((u) => (u.idUsuario === id ? { ...u, ...cambios } : u)),
    }));
  },
}));

/* ------------------------- lectura (no reactiva) ------------------------- */

export function usuarioPorId(id: number): Usuario | undefined {
  return useUsuariosStore.getState().usuarios.find((u) => u.idUsuario === id);
}

export function usuarioPorCorreo(correo: string): Usuario | undefined {
  const buscado = correo.trim().toLowerCase();
  return useUsuariosStore.getState().usuarios.find((u) => u.correo.toLowerCase() === buscado);
}

export function buscarUsuarios(texto: string): Usuario[] {
  const buscado = texto.trim().toLowerCase();
  const usuarios = useUsuariosStore.getState().usuarios;
  if (!buscado) return usuarios;
  return usuarios.filter((u) =>
    `${u.nombreUsuario} ${u.APaterno} ${u.AMaterno} ${u.correo}`.toLowerCase().includes(buscado),
  );
}

/* --------------------------- hooks reactivos ---------------------------- */

export function useUsuarios(): Usuario[] {
  return useUsuariosStore((s) => s.usuarios);
}

export function useUsuarioPorId(id: number | null | undefined): Usuario | undefined {
  const usuarios = useUsuariosStore((s) => s.usuarios);
  if (id === null || id === undefined) return undefined;
  return usuarios.find((u) => u.idUsuario === id);
}
