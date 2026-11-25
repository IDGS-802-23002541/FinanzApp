import {
  IconoCasa,
  IconoEstrella,
  IconoOtro,
  IconoPin,
} from '../../components/ui/Iconos.jsx'

// Color e ícono de cada categoría de cartera. Se comparte entre la tarjeta del
// listado y el encabezado del detalle para que una cartera se vea igual en los
// dos lugares.
const APARIENCIA = {
  Hogar: {
    fondo: 'var(--color-primario)',
    icono: 'var(--color-sobre-primario)',
    Icono: IconoCasa,
  },
  Viaje: {
    fondo: 'var(--color-secundario)',
    icono: 'var(--color-sobre-primario)',
    Icono: IconoPin,
  },
  Evento: {
    fondo: 'var(--color-acento)',
    icono: 'var(--paleta-petroleo)',
    Icono: IconoEstrella,
  },
  Otro: {
    fondo: 'var(--color-info)',
    icono: 'var(--color-sobre-primario)',
    Icono: IconoOtro,
  },
}

export function aparienciaCategoria(categoria) {
  return APARIENCIA[categoria] ?? APARIENCIA.Otro
}
