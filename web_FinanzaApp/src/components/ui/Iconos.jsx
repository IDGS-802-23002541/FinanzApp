import SvgIcon from '@mui/material/SvgIcon'
import Avatar from '@mui/material/Avatar';

// Íconos de línea usados en las vistas de autenticación.
export function IconoFlechaIzquierda(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M19 12H5m0 0 6-6m-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoFlechaDerecha(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M5 12h14m0 0-6-6m6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoVisibilidad(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 5c-4.5 0-8 4.5-8 7s3.5 7 8 7 8-4.5 8-7-3.5-7-8-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </SvgIcon>
  )
}

export function IconoVisibilidadOculto(props) {
  return (
    <SvgIcon {...props}>
      <path d="M2.7 3.7 20.3 21.3l-1.4 1.4-3.2-3.2A9.6 9.6 0 0 1 12 20c-4.5 0-8-4.5-8-8 0-1.6.6-3.2 1.6-4.6L1.3 5.1l1.4-1.4Zm5.4 8.1A4 4 0 0 0 12 16c.9 0 1.7-.3 2.4-.8l-1.5-1.5a2 2 0 0 1-2.6-2.6l-2.2-2.2ZM12 4c4.5 0 8 4.5 8 8 0 1.4-.5 2.8-1.3 4l-2.6-2.6A4 4 0 0 0 10.6 8L8.5 5.9A10 10 0 0 1 12 4Z" />
    </SvgIcon>
  )
}

export function IconoCheck(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="m5 12.5 4.5 4.5L19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoCandado(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M7 10V7a5 5 0 0 1 10 0v3M6 10h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

// Íconos del dashboard de carteras.
export function IconoMas(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </SvgIcon>
  )
}

export function IconoArchivo(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M4 8.5h16M6 4h12a1 1 0 0 1 1 1v3.5M5 8.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5M10 12.5h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoBuscar(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5.6 12.6L21 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoCasa(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-7.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoPin(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoEstrella(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="m12 3.5 2.6 5.4 6 .9-4.3 4.2 1 5.9-5.3-2.8-5.3 2.8 1-5.9L3.4 9.8l6-.9L12 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoOtro(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M6 12h.01M12 12h.01M18 12h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </SvgIcon>
  )
}

export function IconoCartera(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M4 8a2 2 0 0 1 2-2h11.5v3M4 8v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H6a2 2 0 0 1-2-2Zm12 4.5h4v3h-4a1.5 1.5 0 0 1 0-3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoLapiz(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M4 20h4L20 8l-4-4L4 16v4Zm11.5-13.5 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoPersonas(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 8.5c0-3.2 2.7-5 6-5s6 1.8 6 5m1-12.5a3.5 3.5 0 0 1 0 7M17.5 15.5c2 .7 3.5 2.3 3.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoPapelera(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M5 7h14M10 7V4.5h4V7m-6.5 0 .8 13h7.4l.8-13M10 11v5.5m4-5.5v5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function IconoCalendario(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M4 7h16v13H4V7Zm4-3v4m8-4v4M4 11h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

// Avatar del usuario en la barra lateral: foto si existe, si no las iniciales.
export function AvatarUsuario({ imagenUsuario, nombreUsuario, iniciales, tamano = 36 }) {
  const texto =
    iniciales ??
    (nombreUsuario ? nombreUsuario.charAt(0).toUpperCase() : '')

  return (
    <Avatar
      src={imagenUsuario}
      alt="Avatar del usuario"
      sx={{
        width: tamano,
        height: tamano,
        fontSize: '0.875rem',
        fontWeight: 700,
        backgroundColor: 'var(--color-primario)',
        color: 'var(--color-sobre-primario)',
      }}
    >
      {texto}
    </Avatar>
  )
}

// Salida de la sesión (icono de la barra lateral).
export function IconoSalir(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}