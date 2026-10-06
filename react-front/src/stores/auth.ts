import { create } from 'zustand';
import type { Usuario } from '../types/models';
import { usuarioPorCorreo, useUsuariosStore } from './usuarios';

const CLAVE_SESION = 'finanzapp.sesion';

export interface ResultadoAuth {
  ok: boolean;
  mensaje: string;
}

export interface DatosRegistro {
  nombreUsuario: string;
  APaterno: string;
  AMaterno: string;
  correo: string;
  contrasena: string;
  telefono: string;
}

interface AuthState {
  idUsuario: number | null;
  login: (correo: string, contrasena: string) => ResultadoAuth;
  registrar: (datos: DatosRegistro) => ResultadoAuth;
  actualizar: (cambios: Partial<Usuario>) => void;
  salir: () => void;
}

function leerSesion(): number | null {
  try {
    const crudo = localStorage.getItem(CLAVE_SESION);
    return crudo ? Number(crudo) : null;
  } catch {
    return null;
  }
}

function guardarSesion(id: number): void {
  try {
    localStorage.setItem(CLAVE_SESION, String(id));
  } catch {
    /* almacenamiento no disponible */
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  idUsuario: leerSesion(),

  login(correo, contrasena) {
    const usuario = usuarioPorCorreo(correo);
    if (!usuario) return { ok: false, mensaje: 'No existe una cuenta con ese correo electrónico.' };
    if (usuario.contrasena !== contrasena) return { ok: false, mensaje: 'La contraseña es incorrecta.' };
    guardarSesion(usuario.idUsuario);
    set({ idUsuario: usuario.idUsuario });
    return { ok: true, mensaje: `Bienvenido de nuevo, ${usuario.nombreUsuario}.` };
  },

  registrar(datos) {
    if (usuarioPorCorreo(datos.correo)) {
      return { ok: false, mensaje: 'Ese correo ya tiene una cuenta registrada.' };
    }
    const usuarios = useUsuariosStore.getState();
    const usuario = usuarios.registrarNuevo({
      nombreUsuario: datos.nombreUsuario,
      APaterno: datos.APaterno,
      AMaterno: datos.AMaterno,
      correo: datos.correo,
      telefono: datos.telefono,
    });
    usuarios.actualizar(usuario.idUsuario, { rol: 'admin', contrasena: datos.contrasena });
    guardarSesion(usuario.idUsuario);
    set({ idUsuario: usuario.idUsuario });
    return { ok: true, mensaje: 'Tu cuenta se creó correctamente.' };
  },

  actualizar(cambios) {
    const id = get().idUsuario;
    if (id === null) return;
    useUsuariosStore.getState().actualizar(id, cambios);
  },

  salir() {
    set({ idUsuario: null });
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch {
      /* almacenamiento no disponible */
    }
  },
}));

/* --------------------------- hooks reactivos ---------------------------- */

export function useAuthUsuario(): Usuario | null {
  const id = useAuthStore((s) => s.idUsuario);
  const usuarios = useUsuariosStore((s) => s.usuarios);
  if (id === null) return null;
  return usuarios.find((u) => u.idUsuario === id) ?? null;
}

export function useAutenticado(): boolean {
  return useAuthUsuario() !== null;
}
