# Guía de trabajo y reglas del proyecto

Proceso para abrir, trabajar y cerrar tickets en **Taiga**, más las reglas por área y de versionamiento. Complementa a `AGENTS.md` (reglas generales) y a `docs/mcp-taiga.md` (conexión del MCP de Taiga).

---

## Cómo se abre un ticket (Taiga)

1. **Estructura**: se crea como **Historia de Usuario (US)** o **Tarea** en Taiga. Si hay que subdividir, se crean **sub-tareas dentro del mismo ítem** o se vincula uno relacionado. Los *Issues* de Taiga se reservan para **bugs**, no para trabajo nuevo.
2. **Título**: `TG-[ID] — [título descriptivo]`.
3. **Campos nativos**: Fechas, Autor, Asignado y Estado se gestionan con los campos propios de Taiga.
4. **Descripción** (4 secciones obligatorias):
   - **Qué se tenía que hacer**: 1–2 oraciones con el objetivo directo.
   - **Qué se resolvió**: contexto y decisiones tomadas al abrir (o `(Nada aún)`).
   - **Qué quedó a la mitad**: `(Nada. El ticket es nuevo.)` al abrir.
   - **Qué resta**: pendientes concretos en checkboxes. Cruzar contra otros tickets de Taiga antes de redactar para no duplicar trabajo.
5. **Campos extra obligatorios en la descripción**:
   - **Archivos a tocar**: lista explícita de archivos permitidos.
   - **No tocar**: archivos o carpetas restringidas.

---

## Cómo se trabaja

- Cada sesión de trabajo se enfoca en tickets de Taiga.
- Los tickets deben ser autosuficientes: decisiones justificadas, causa raíz de bugs, resultados concretos de pruebas, solo fragmentos clave de código (nunca archivos completos) y cero especulaciones.
- **Organización interna del "Qué resta"**: dividir en fases con checkboxes (`Prerrequisitos` → `Lógica` → `Esquema` → `Verificación` → `Cierre`). Secciones libres opcionales: *Decisiones previas*, *Riesgos*, *Notas de recorte (deuda técnica)*.
- **Al retomar con IA**: indicar el ID del ticket de Taiga. La IA debe leer la descripción y los comentarios del ticket antes de proponer cambios.

---

## Cómo se cierra

1. Se actualiza **"Qué se resolvió"** con detalle técnico real (archivos modificados, commits, evidencia de pruebas).
2. **"Qué quedó a la mitad"** detalla lo incompleto y su causa exacta (o `(Nada.)`).
3. **"Qué resta"** se reduce a lo que pase a otro ticket o se limpia.
4. Se cambia el estado del ticket a **"Cerrada" / "Closed"** en Taiga.

---

## Equipo

| Persona | Área |
| :--- | :--- |
| **Vanesa** | Base de datos, pruebas en Postman y unificación diaria del código |
| **Damián** | Endpoints en Flask |
| **Aideé** | Web (React) |
| **Diego** | Móvil (Kotlin) |

---

## Reglas para el agente

- Antes de tocar código, consulta el ticket indicado en Taiga y sus dependencias. Cruza el "Qué resta" con lo ya resuelto en otros tickets para no repetir trabajo.
- Toca solo los archivos listados en "Archivos a tocar". Si necesitas otro archivo, detente y pregunta.
- El contrato de la API es `Backend_FinanzaApp/openapi.yaml` (aún no existe; se crea al iniciar la API). No inventes endpoints ni campos. Si falta algo, consulta antes.
- El esquema de la BD solo se modifica en `Backend_FinanzaApp/SQL/` (scripts) y `Backend_FinanzaApp/app/models/`. Web y móvil jamás asumen columnas.
- Toda eliminación es lógica (cambio de estatus). Listas, saldos y reportes excluyen registros eliminados.
- Permisos validados exclusivamente en el backend (rol global: `cliente`, `trabajador`, `admin`; rol por cartera: `propietario`, `colaborador`). Ocultar botones no es seguridad.
- No marques checkboxes ni pases a "Cerrada" un ticket sin evidencia (commit, salida de pruebas). Genera un borrador de cierre para revisión humana.
- Incluye solo fragmentos clave de código en los comentarios del ticket. Registra decisiones con justificación y fallos con causa raíz.
- Prohibido subir credenciales, tokens o llaves. Usa variables de entorno y archivos de ejemplo sin valores reales.

---

## Reglas por área

### Backend (Flask)

- Una ruta por blueprint; la lógica va en el `services.py` de cada blueprint (`Backend_FinanzaApp/app/blueprints/<dominio>/`).
- Contraseñas siempre con hash.
- Mensajes de error en login y recuperación que no revelen si un correo existe.
- Todo endpoint nuevo se agrega al contrato OpenAPI y a la colección Postman.

### Web (React)

- Reutilizar componentes, usar hooks (`useState`, `useEffect`) y pasar datos por props.
- Si algo se repite dos veces, se vuelve componente.
- Las llamadas a la API se concentran fuera de los componentes: hoy en `web_FinanzaApp/src/stores/` (zustand); se puede crear `src/services/` cuando haga falta. Nunca dentro de los componentes.

### Móvil (Kotlin)

- Arquitectura MVVM (Vista observa → ViewModel gestiona estado → Repositorio llama a la API).
- Aplicación exclusiva para el rol `cliente`: sin landing, sin registro y sin vistas de admin o trabajador.

---

## Git y versionamiento

- **Ramas principales**: `main` (estable, versiones etiquetadas) y `develop` (integración diaria).
- **Trabajo diario**: cada integrante trabaja en su rama personal (`diego`, `vane`, `aidee`, `damian`) o de función (`feat/…`, `fix/…`) y sube cambios a `develop`.
- **Integración**: Vanesa unifica en `develop` al final del día con commits de integración y resuelve conflictos.
- **Commits**: `tipo(área): descripción [#TG-ID]`.
  - **Tipos**: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.
  - **Áreas**: `backend`, `web`, `movil`, `db`, `docs`.
  - El `[#TG-ID]` al final vincula el commit con el ticket de Taiga.
- **Versionamiento**: SemVer sobre `develop` al cerrar sprint (`v0.1.0`; correcciones `v0.1.1`). La versión móvil se mantiene alineada con la etiqueta de la API.
- **`AGENTS.md` es el documento maestro y solo se actualiza en `main`.** Las ramas personales y de función no lo modifican.
