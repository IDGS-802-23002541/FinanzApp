import type {
  Cartera,
  CategoriaCartera,
  CategoriaGasto,
  MetodoPago,
  MiembroCartera,
  Transaccion,
  Usuario,
} from '../types/models';

export const USUARIOS: Usuario[] = [
  { idUsuario: 1, nombreUsuario: 'Diego Yair', APaterno: 'Borja', AMaterno: 'Romero', correo: 'diego@finanzapp.mx', contrasena: 'demo123', rol: 'admin', telefono: '477 120 4455', fechaCreacion: '2026-01-10', color: '#0d6945' },
  { idUsuario: 2, nombreUsuario: 'Aideé Vanessa', APaterno: 'Casillas', AMaterno: 'Tapia', correo: 'aidee@finanzapp.mx', contrasena: 'demo123', rol: 'miembro', telefono: '477 220 1188', fechaCreacion: '2026-01-12', color: '#2563eb' },
  { idUsuario: 3, nombreUsuario: 'Vanessa Yassmin', APaterno: 'Rea', AMaterno: 'Muñoz', correo: 'vanessa@finanzapp.mx', contrasena: 'demo123', rol: 'admin', telefono: '477 331 9020', fechaCreacion: '2026-01-15', color: '#7c3aed' },
  { idUsuario: 4, nombreUsuario: 'Antonio Damián', APaterno: 'Rodríguez', AMaterno: 'Alarcón', correo: 'antonio@finanzapp.mx', contrasena: 'demo123', rol: 'miembro', telefono: '477 118 7733', fechaCreacion: '2026-01-18', color: '#d97706' },
  { idUsuario: 5, nombreUsuario: 'Ricardo Alonso', APaterno: 'Medina', AMaterno: 'Soto', correo: 'ricardo@finanzapp.mx', contrasena: 'demo123', rol: 'admin', telefono: '477 908 2211', fechaCreacion: '2026-01-20', color: '#e11d48' },
  { idUsuario: 6, nombreUsuario: 'Ana Sofía', APaterno: 'García', AMaterno: 'Núñez', correo: 'ana@correo.mx', contrasena: 'demo123', rol: 'miembro', telefono: '477 445 1120', fechaCreacion: '2026-02-02', color: '#0891b2' },
  { idUsuario: 7, nombreUsuario: 'Luis Fernando', APaterno: 'Torres', AMaterno: 'Vega', correo: 'luis@correo.mx', contrasena: 'demo123', rol: 'miembro', telefono: '477 552 8899', fechaCreacion: '2026-02-05', color: '#4f46e5' },
  { idUsuario: 8, nombreUsuario: 'Mariana', APaterno: 'López', AMaterno: 'Ríos', correo: 'mariana@correo.mx', contrasena: 'demo123', rol: 'miembro', telefono: '477 660 3311', fechaCreacion: '2026-02-11', color: '#65a30d' },
  { idUsuario: 9, nombreUsuario: 'Carlos', APaterno: 'Méndez', AMaterno: 'Aguilar', correo: 'carlos@correo.mx', contrasena: 'demo123', rol: 'miembro', telefono: '477 771 2244', fechaCreacion: '2026-02-14', color: '#b45309' },
  { idUsuario: 10, nombreUsuario: 'Paola', APaterno: 'Ramírez', AMaterno: 'Cruz', correo: 'paola@correo.mx', contrasena: 'demo123', rol: 'miembro', telefono: '477 883 5566', fechaCreacion: '2026-03-01', color: '#db2777' },
  { idUsuario: 11, nombreUsuario: 'Jorge', APaterno: 'Hernández', AMaterno: 'Rangel', correo: 'jorge@correo.mx', contrasena: 'demo123', rol: 'miembro', telefono: '477 994 7788', fechaCreacion: '2026-03-08', color: '#059669' },
  { idUsuario: 12, nombreUsuario: 'Fernanda', APaterno: 'Ruiz', AMaterno: 'Palacios', correo: 'fernanda@correo.mx', contrasena: 'demo123', rol: 'miembro', telefono: '477 105 9900', fechaCreacion: '2026-03-15', color: '#9333ea' },
];

export const CATEGORIAS_CARTERA: CategoriaCartera[] = [
  { idCategoriaCartera: 1, nombreCategoriaCartera: 'Hogar', descripcion: 'Gastos recurrentes y estadísticas continuas', icono: 'home', color: '#0d6945' },
  { idCategoriaCartera: 2, nombreCategoriaCartera: 'Viaje', descripcion: 'Carteras con fecha de inicio y fin', icono: 'globe', color: '#2563eb' },
  { idCategoriaCartera: 3, nombreCategoriaCartera: 'Evento', descripcion: 'Bodas, posadas, cumpleaños y más', icono: 'sparkles', color: '#7c3aed' },
  { idCategoriaCartera: 4, nombreCategoriaCartera: 'Otro', descripcion: 'Proyectos y gastos especiales', icono: 'tag', color: '#d97706' },
];

export const CATEGORIAS_GASTO: CategoriaGasto[] = [
  { idCategoriaGasto: 1, nombreGasto: 'Alimentos y despensa', icono: 'cart', color: '#0d6945' },
  { idCategoriaGasto: 2, nombreGasto: 'Restaurantes', icono: 'cart', color: '#d97706' },
  { idCategoriaGasto: 3, nombreGasto: 'Transporte y gasolina', icono: 'car', color: '#2563eb' },
  { idCategoriaGasto: 4, nombreGasto: 'Hospedaje y estadías', icono: 'bed', color: '#0891b2' },
  { idCategoriaGasto: 5, nombreGasto: 'Alcohol y bebidas', icono: 'glass', color: '#e11d48' },
  { idCategoriaGasto: 6, nombreGasto: 'Servicios del hogar', icono: 'bolt', color: '#7c3aed' },
  { idCategoriaGasto: 7, nombreGasto: 'Renta y mantenimiento', icono: 'wrench', color: '#4f46e5' },
  { idCategoriaGasto: 8, nombreGasto: 'Entretenimiento', icono: 'ticket', color: '#65a30d' },
  { idCategoriaGasto: 9, nombreGasto: 'Decoración y eventos', icono: 'sparkles', color: '#db2777' },
  { idCategoriaGasto: 10, nombreGasto: 'Otros gastos', icono: 'tag', color: '#64748b' },
];

export const CARTERAS: Cartera[] = [
  {
    idCartera: 1,
    nombreCartera: 'Casa Borja',
    descripcion: 'Gastos del hogar: despensa, servicios y mantenimiento.',
    idCategoriaCartera: 1,
    idPropietario: 1,
    presupuestoInicial: 86000,
    estado: 'activa',
    fechaCreacion: '2026-04-01',
    codigoInvitacion: 'FZ-4K9M2P',
    color: '#0d6945',
  },
  {
    idCartera: 2,
    nombreCartera: 'Viaje a Cancún',
    descripcion: 'Anticipos de vuelos, hospedaje y gastos del viaje de fin de semestre.',
    idCategoriaCartera: 2,
    idPropietario: 1,
    presupuestoInicial: 108000,
    estado: 'activa',
    fechaCreacion: '2026-07-05',
    fechaInicio: '2026-11-10',
    fechaFin: '2026-11-17',
    codigoInvitacion: 'FZ-8Q1X7B',
    color: '#2563eb',
  },
  {
    idCartera: 3,
    nombreCartera: 'Boda Ana & Luis',
    descripcion: 'Cartera colaborativa para la boda: proveedores, decoración y banquete.',
    idCategoriaCartera: 3,
    idPropietario: 2,
    presupuestoInicial: 170000,
    estado: 'activa',
    fechaCreacion: '2026-04-10',
    fechaInicio: '2026-12-05',
    fechaFin: '2026-12-05',
    codigoInvitacion: 'FZ-2T5R8L',
    color: '#7c3aed',
  },
  {
    idCartera: 4,
    nombreCartera: 'Casa de la Abuela',
    descripcion: 'Servicios, despensa y mantenimiento de la casa familiar.',
    idCategoriaCartera: 1,
    idPropietario: 3,
    presupuestoInicial: 70000,
    estado: 'activa',
    fechaCreacion: '2026-04-05',
    codigoInvitacion: 'FZ-6H3W9D',
    color: '#0891b2',
  },
  {
    idCartera: 5,
    nombreCartera: 'Posada Equipo IDGS',
    descripcion: 'Organización de la posada del grupo: comida, bebidas y decoración.',
    idCategoriaCartera: 3,
    idPropietario: 5,
    presupuestoInicial: 24000,
    estado: 'activa',
    fechaCreacion: '2026-08-10',
    fechaInicio: '2026-12-18',
    fechaFin: '2026-12-18',
    codigoInvitacion: 'FZ-9P4N1C',
    color: '#d97706',
  },
  {
    idCartera: 6,
    nombreCartera: 'Departamento 301',
    descripcion: 'Gastos del departamento compartido durante el semestre enero-junio.',
    idCategoriaCartera: 1,
    idPropietario: 1,
    presupuestoInicial: 72000,
    estado: 'inactiva',
    fechaCreacion: '2026-01-05',
    fechaCierre: '2026-06-30',
    codigoInvitacion: 'FZ-3M8V5K',
    color: '#64748b',
  },
  {
    idCartera: 7,
    nombreCartera: 'Viaje a Mazatlán',
    descripcion: 'Cartera cerrada del viaje familiar a Mazatlán.',
    idCategoriaCartera: 2,
    idPropietario: 2,
    presupuestoInicial: 98000,
    estado: 'inactiva',
    fechaCreacion: '2025-11-02',
    fechaInicio: '2025-12-20',
    fechaFin: '2025-12-27',
    fechaCierre: '2026-02-28',
    codigoInvitacion: 'FZ-7J2S6F',
    color: '#4f46e5',
  },
];

export const MIEMBROS: MiembroCartera[] = [
  { idMiembro: 1, idCartera: 1, idUsuario: 1, rol: 'admin', aporteComprometido: 43000, fechaUnion: '2026-04-01' },
  { idMiembro: 2, idCartera: 1, idUsuario: 2, rol: 'miembro', aporteComprometido: 43000, fechaUnion: '2026-04-02' },
  { idMiembro: 3, idCartera: 2, idUsuario: 1, rol: 'admin', aporteComprometido: 22000, fechaUnion: '2026-07-05' },
  { idMiembro: 4, idCartera: 2, idUsuario: 2, rol: 'miembro', aporteComprometido: 22000, fechaUnion: '2026-07-05' },
  { idMiembro: 5, idCartera: 2, idUsuario: 3, rol: 'miembro', aporteComprometido: 22000, fechaUnion: '2026-07-08' },
  { idMiembro: 6, idCartera: 2, idUsuario: 4, rol: 'miembro', aporteComprometido: 21000, fechaUnion: '2026-07-12' },
  { idMiembro: 7, idCartera: 2, idUsuario: 11, rol: 'miembro', aporteComprometido: 21000, fechaUnion: '2026-08-01' },
  { idMiembro: 8, idCartera: 3, idUsuario: 2, rol: 'admin', aporteComprometido: 29000, fechaUnion: '2026-04-10' },
  { idMiembro: 9, idCartera: 3, idUsuario: 5, rol: 'miembro', aporteComprometido: 28000, fechaUnion: '2026-04-11' },
  { idMiembro: 10, idCartera: 3, idUsuario: 6, rol: 'miembro', aporteComprometido: 28000, fechaUnion: '2026-04-14' },
  { idMiembro: 11, idCartera: 3, idUsuario: 7, rol: 'miembro', aporteComprometido: 28000, fechaUnion: '2026-04-20' },
  { idMiembro: 12, idCartera: 3, idUsuario: 1, rol: 'miembro', aporteComprometido: 28000, fechaUnion: '2026-05-02' },
  { idMiembro: 13, idCartera: 3, idUsuario: 12, rol: 'miembro', aporteComprometido: 29000, fechaUnion: '2026-05-10' },
  { idMiembro: 14, idCartera: 4, idUsuario: 3, rol: 'admin', aporteComprometido: 17500, fechaUnion: '2026-04-05' },
  { idMiembro: 15, idCartera: 4, idUsuario: 8, rol: 'miembro', aporteComprometido: 17500, fechaUnion: '2026-04-06' },
  { idMiembro: 16, idCartera: 4, idUsuario: 9, rol: 'miembro', aporteComprometido: 17500, fechaUnion: '2026-04-08' },
  { idMiembro: 17, idCartera: 4, idUsuario: 1, rol: 'miembro', aporteComprometido: 17500, fechaUnion: '2026-04-09' },
  { idMiembro: 18, idCartera: 5, idUsuario: 5, rol: 'admin', aporteComprometido: 4800, fechaUnion: '2026-08-10' },
  { idMiembro: 19, idCartera: 5, idUsuario: 1, rol: 'miembro', aporteComprometido: 4800, fechaUnion: '2026-08-11' },
  { idMiembro: 20, idCartera: 5, idUsuario: 4, rol: 'miembro', aporteComprometido: 4800, fechaUnion: '2026-08-12' },
  { idMiembro: 21, idCartera: 5, idUsuario: 6, rol: 'miembro', aporteComprometido: 4800, fechaUnion: '2026-08-15' },
  { idMiembro: 22, idCartera: 5, idUsuario: 7, rol: 'miembro', aporteComprometido: 4800, fechaUnion: '2026-08-18' },
  { idMiembro: 23, idCartera: 6, idUsuario: 1, rol: 'admin', aporteComprometido: 36000, fechaUnion: '2026-01-05' },
  { idMiembro: 24, idCartera: 6, idUsuario: 2, rol: 'miembro', aporteComprometido: 36000, fechaUnion: '2026-01-05' },
  { idMiembro: 25, idCartera: 7, idUsuario: 2, rol: 'admin', aporteComprometido: 24500, fechaUnion: '2025-11-02' },
  { idMiembro: 26, idCartera: 7, idUsuario: 1, rol: 'miembro', aporteComprometido: 24500, fechaUnion: '2025-11-02' },
  { idMiembro: 27, idCartera: 7, idUsuario: 3, rol: 'miembro', aporteComprometido: 24500, fechaUnion: '2025-11-05' },
  { idMiembro: 28, idCartera: 7, idUsuario: 10, rol: 'miembro', aporteComprometido: 24500, fechaUnion: '2025-11-09' },
];

function semilla(valor: number): () => number {
  let estado = valor >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mesesEntre(desde: string, hasta: string): string[] {
  const [anioInicio, mesInicio] = desde.split('-').map(Number);
  const [anioFin, mesFin] = hasta.split('-').map(Number);
  const meses: string[] = [];
  let anio = anioInicio;
  let mes = mesInicio;
  while (anio < anioFin || (anio === anioFin && mes <= mesFin)) {
    meses.push(`${anio}-${String(mes).padStart(2, '0')}`);
    mes++;
    if (mes > 12) {
      mes = 1;
      anio++;
    }
  }
  return meses;
}

interface Perfil {
  ingresos: number;
  gastos: [number, number];
  categorias: number[];
  escala: number;
}

function crearTransacciones(): Transaccion[] {
  const rnd = semilla(20260915);
  const entero = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));
  const decimal = (min: number, max: number) => Math.round((min + rnd() * (max - min)) / 10) * 10;
  const elegir = <T,>(lista: T[]): T => lista[Math.floor(rnd() * lista.length)];
  const dos = (n: number) => String(n).padStart(2, '0');

  const periodos: Record<number, [string, string]> = {
    1: ['2026-04', '2026-09'],
    2: ['2026-07', '2026-09'],
    3: ['2026-04', '2026-09'],
    4: ['2026-04', '2026-09'],
    5: ['2026-08', '2026-09'],
    6: ['2026-01', '2026-06'],
    7: ['2025-11', '2026-02'],
  };

  const perfiles: Record<number, Perfil> = {
    1: { ingresos: 2, gastos: [10, 14], categorias: [1, 1, 1, 2, 3, 6, 7, 8, 10], escala: 1 },
    2: { ingresos: 3, gastos: [8, 12], categorias: [4, 3, 2, 5, 9, 1], escala: 2.6 },
    3: { ingresos: 3, gastos: [8, 12], categorias: [9, 2, 1, 5, 8, 4], escala: 2.2 },
    4: { ingresos: 3, gastos: [7, 10], categorias: [6, 1, 7, 3, 10], escala: 1.1 },
    5: { ingresos: 4, gastos: [6, 9], categorias: [9, 5, 2, 1, 8], escala: 1 },
    6: { ingresos: 2, gastos: [9, 12], categorias: [6, 1, 7, 3, 10], escala: 1 },
    7: { ingresos: 2, gastos: [7, 10], categorias: [4, 3, 2, 5, 1], escala: 1.9 },
  };

  const rangosGasto: Record<number, [number, number]> = {
    1: [380, 2300],
    2: [160, 780],
    3: [120, 1400],
    4: [900, 3800],
    5: [220, 1500],
    6: [280, 1400],
    7: [450, 2500],
    8: [120, 850],
    9: [500, 3600],
    10: [90, 620],
  };

  const notas: Record<number, string[]> = {
    1: ['Despensa de la semana', 'Súper del mercado', 'Frutas y verduras', 'Carnicería'],
    2: ['Comida de equipo', 'Cena del domingo', 'Café y pan', 'Antojo de tacos'],
    3: ['Gasolina', 'Viaje en aplicación', 'Transporte público', 'Estacionamiento'],
    4: ['Anticipo de hospedaje', 'Noche de hotel', 'Reserva de alojamiento', 'Hospedaje del fin de semana'],
    5: ['Bebidas para la reunión', 'Cerveza y botanas', 'Tequila', 'Micheladas'],
    6: ['Recibo de luz', 'Internet del mes', 'Recibo de agua', 'Recibo de gas'],
    7: ['Renta mensual', 'Mantenimiento', 'Reparación de fuga', 'Pintura y reparaciones'],
    8: ['Cine', 'Streaming', 'Salida al parque', 'Videojuego'],
    9: ['Decoración', 'Centros de mesa', 'Arreglo floral', 'Música en vivo', 'Pastel'],
    10: ['Varios', 'Imprevisto', 'Farmacia', 'Artículos de limpieza'],
  };

  const metodos: MetodoPago[] = ['transferencia', 'tarjeta', 'efectivo', 'tarjeta', 'transferencia'];
  const notasIngreso = ['Aportación al fondo', 'Depósito a la cartera', 'Transferencia de aportación'];

  const lista: Transaccion[] = [];
  let id = 1;

  for (const cartera of CARTERAS) {
    const periodo = periodos[cartera.idCartera];
    const perfil = perfiles[cartera.idCartera];
    if (!periodo || !perfil) continue;

    const integrantes = MIEMBROS.filter((m) => m.idCartera === cartera.idCartera).map((m) => m.idUsuario);
    if (!integrantes.length) continue;

    const meses = mesesEntre(periodo[0], periodo[1]);
    const movimientos: Transaccion[] = [];
    let totalGastos = 0;

    for (const mes of meses) {
      const cantidad = entero(perfil.gastos[0], perfil.gastos[1]);
      for (let i = 0; i < cantidad; i++) {
        const idCategoriaGasto = elegir(perfil.categorias);
        const rango = rangosGasto[idCategoriaGasto];
        const categoria = CATEGORIAS_GASTO.find((c) => c.idCategoriaGasto === idCategoriaGasto);
        const monto = decimal(rango[0] * perfil.escala, rango[1] * perfil.escala);
        totalGastos += monto;
        movimientos.push({
          idTransaccion: id++,
          idCartera: cartera.idCartera,
          idUsuario: elegir(integrantes),
          idCategoriaGasto,
          nombreGasto: categoria?.nombreGasto ?? 'Otros gastos',
          tipo: 'gasto',
          monto,
          fecha: `${mes}-${dos(entero(1, 28))}`,
          metodoPago: elegir(metodos),
          nota: elegir(notas[idCategoriaGasto]),
        });
      }
    }

    const factor = 0.87 + rnd() * 0.1;
    const objetivo = Math.round((totalGastos * factor) / 10) * 10;
    const aportaciones = Math.max(1, meses.length * perfil.ingresos);
    let acumulado = 0;

    for (let i = 0; i < aportaciones; i++) {
      const restante = objetivo - acumulado;
      const esUltima = i === aportaciones - 1;
      const propuesto = esUltima
        ? restante
        : Math.round(((objetivo / aportaciones) * (0.75 + rnd() * 0.5)) / 10) * 10;
      const monto = Math.max(500, Math.min(propuesto, restante));
      acumulado += monto;
      const mes = meses[Math.min(Math.floor(i / perfil.ingresos), meses.length - 1)];
      movimientos.push({
        idTransaccion: id++,
        idCartera: cartera.idCartera,
        idUsuario: integrantes[i % integrantes.length],
        idCategoriaGasto: 10,
        nombreGasto: 'Aportación',
        tipo: 'ingreso',
        monto,
        fecha: `${mes}-${dos(entero(3, 9))}`,
        metodoPago: elegir(metodos),
        nota: elegir(notasIngreso),
      });
    }

    lista.push(...movimientos);
  }

  return lista;
}

export const TRANSACCIONES: Transaccion[] = crearTransacciones();
