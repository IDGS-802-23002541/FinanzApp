import { Injectable, signal } from '@angular/core';
import { CATEGORIAS_GASTO, TRANSACCIONES } from '../data/mock-data';
import { CategoriaGasto, Transaccion } from '../models';
import { ordenarPorFecha } from '../utils/finanzas';

@Injectable({ providedIn: 'root' })
export class TransaccionesService {
  private readonly lista = signal<Transaccion[]>(ordenarPorFecha(TRANSACCIONES));

  readonly transacciones = this.lista.asReadonly();
  readonly categorias: CategoriaGasto[] = CATEGORIAS_GASTO;

  porId(id: number): Transaccion | undefined {
    return this.lista().find((t) => t.idTransaccion === id);
  }

  categoria(id: number): CategoriaGasto | undefined {
    return CATEGORIAS_GASTO.find((c) => c.idCategoriaGasto === id);
  }

  porCartera(idCartera: number): Transaccion[] {
    return ordenarPorFecha(this.lista().filter((t) => t.idCartera === idCartera));
  }

  deUsuario(idUsuario: number): Transaccion[] {
    return ordenarPorFecha(this.lista().filter((t) => t.idUsuario === idUsuario));
  }

  recientes(cantidad: number): Transaccion[] {
    return this.lista().slice(0, cantidad);
  }

  crear(datos: Omit<Transaccion, 'idTransaccion'>): Transaccion {
    const siguiente = Math.max(0, ...this.lista().map((t) => t.idTransaccion)) + 1;
    const transaccion: Transaccion = { ...datos, idTransaccion: siguiente };
    this.lista.update((lista) => ordenarPorFecha([...lista, transaccion]));
    return transaccion;
  }

  actualizar(id: number, cambios: Partial<Transaccion>): void {
    this.lista.update((lista) =>
      ordenarPorFecha(lista.map((t) => (t.idTransaccion === id ? { ...t, ...cambios } : t))),
    );
  }

  eliminar(id: number): void {
    this.lista.update((lista) => lista.filter((t) => t.idTransaccion !== id));
  }
}
