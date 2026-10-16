# FinanzApp — Reglas de trabajo (OpenCode)

Estas reglas aplican a **todo el repositorio** y las debe cumplir cualquier agente o desarrollador. El contexto del producto y del equipo está en `CONTEXTO_PROYECTO.md` (léelo al inicio de una sesión nueva). Los detalles de cada stack están en el `AGENTS.md` y `README.md` de cada carpeta.

## 0. Ramas del repositorio

| Rama | Persona | Iniciales |
| --- | --- | --- |
| `main` | Integración — recibe merges por PR; **commits directos solo con autorización del equipo** | — |
| `diego` | Diego Yair Borja Romero | `DB` |
| `vane` | Vanessa Yassmin Rea Muñoz | `VR` |
| `aidee` | Aideé Vanessa Casillas Tapia | `AC` |
| `damian` | Antonio Damián Rodríguez Alarcón | `DR` |

- Identifica al desarrollador actual con `git config user.name`. Si no coincide con la tabla, **pregunta** antes de continuar.
- Trabaja en tu rama. Integra a `main` preferentemente vía **PR** desde tu rama personal; se permiten **commits directos a `main`** para cambios pequeños y de bajo riesgo (por ejemplo, documentación), avisando al equipo.

## 1. Antes de empezar cualquier tarea (obligatorio)

1. `git fetch --all --prune`
2. Comprueba si hay cambios nuevos en las ramas de los compañeros (las otras tres de la tabla):
   `git log --oneline <tu-rama>..origin/<rama-compañero>` o `git diff --stat <tu-rama>..origin/<rama-compañero>`
3. Si alguna tiene cambios nuevos, **pregunta exactamente así**: *"¿Quieres revisar primero los cambios de <Nombre del compañero>?"*
4. Si la respuesta es sí, muestra `git log --oneline` y `git diff --stat` de esa rama y resume qué cambió. Si es no, continúa con la tarea.
5. Confirma que estás en tu rama con `git branch --show-current`.

## 2. Al terminar cualquier trabajo (obligatorio)

- **Siempre** haz commit en tu rama; no dejes cambios pendientes al cerrar la sesión.
- Formato del mensaje: **`<INICIALES> <tipo>: <resumen>`** (iniciales en mayúsculas, resumen en imperativo y en minúscula).
  - Tipos permitidos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`.
  - Ejemplos: `DB fix: validación de monto negativo al registrar gasto`, `VR feat: lista de carteras con filtro`.
- Antes de commitear revisa `git status` y `git diff`: nunca incluir contraseñas, tokens ni archivos `.env`/`taiga.env`.
- Sube tu rama con `git push -u origin <tu-rama>` cuando las credenciales estén configuradas.
- Al cerrar una funcionalidad completa, **recomendado** abrir PR de tu rama hacia `main` y pedir revisión a otro integrante.

## 3. Estructura y stacks

| Carpeta | Contenido | Stack |
| --- | --- | --- |
| `web_FinanzaApp/` | Web (landing + panel) | React + Vite · UI **únicamente MUI** · frameworks ligeros |
| `Backend_FinanzaApp/` | API REST | Python 3.13 + Flask (**Blueprints**) · SQL Server · Cloudinary |
| `movil_FinanzaApp/` | App Android | Kotlin + Jetpack Compose (MVVM) |
| raíz | Documentación del proyecto | Markdown |

- Prohibido en la web: Tailwind, Bootstrap u otra librería de UI distinta de MUI.
- No agregar dependencias nuevas sin acordarlo con el equipo.

## 4. Convenciones generales

- Nombres de variables, funciones y comentarios en español; términos técnicos en inglés cuando sean estándar.
- Montos en MXN (`es-MX`), fechas `dd/MM/aaaa`.
- Nada de archivos pesados ni binarios en el repo (los archivos van a Cloudinary).
- Una tarea se da por terminada cuando compila, no hay errores de consola y cumple sus criterios de aceptación.

## 5. Reglas de codificación (evitar la sobreingeniería)

Principio: escribe código para el **caso real**, estructurado y fácil de entender. Menos es más.

- **Sin casos "por si acaso"**: no agregues parámetros, banderas, ramas ni funciones que nadie usa. Nada de compatibilidad hacia atrás ficticia ni de "modos alternativos" que no se pidieron.
- **`try/catch` solo cuando algo puede fallar de verdad** (red, disco, JSON externo, servicios de terceros). Prohibido el `try/catch` alrededor de código que no lanza, los `catch` vacíos y los `catch` que se tragan el error en silencio.
- **Validaciones proporcionales y realistas**: valida en el borde (formulario o API) una sola vez. No re-valides lo mismo en cada capa ni valides casos imposibles (p. ej. revisar `null` en algo que ya garantizaste).
- **No abstracciones prematuras**: nada de interfaces, fábricas, capas o servicios genéricos para un único caso de uso. Generaliza solo cuando el patrón se repita (regla de tres).
- **No dupliques lógica**: reutiliza las funciones y utilidades ya existentes antes de crear nuevas.
- **Simplicidad**: prefiere el lenguaje y las librerías estándar y lo que ya está en el repo. No añadas dependencias para resolver algo trivial.
- **Estructura clara**: funciones cortas con una sola responsabilidad y nombres en español que digan qué hacen. Usa retornos tempranos para no anidar y separa la lógica de negocio de la UI y la persistencia.
- **Comentarios mínimos**: comenta el *porqué* cuando no sea obvio, nunca el *qué*. Sin bloques de código comentado.
- **Nada de "genéricos mágicos"**: evita funciones que reciben muchas opciones solo para cubrir escenarios que hoy no existen.
- **Prueba de claridad**: otra persona del equipo debe entender el archivo sin explicación. Si hace falta demasiada indirección para algo simple, simplifícalo.

Ejemplos:

- ❌ `try { const total = 2 + 2; } catch (e) { /* nada */ }` → ✅ `const total = 2 + 2;`
- ❌ `function calcular(datos, opciones = {}, modo = 'default', ...extra)` para un único uso → ✅ `function calcular(datos)`
- ❌ validar el mismo correo en el store, el servicio y el componente → ✅ validarlo una sola vez en el borde.

## 6. Taiga (tablero Kanban) vía MCP

- El MCP `taiga` está disponible: úsalo para **consultar y actualizar** las historias del proyecto en vez de duplicarlas.
- **Fuente de actividades:** el backlog que el agente trabaja son las *historias de usuario* del proyecto **FinanzApp** (id `1808877`, slug `idgs-802-23002441-finanzapp`) en Taiga. Antes de empezar una tarea, revísalo ahí con el MCP.
- Reparto por carriles y avance en el tablero **Taiga** (consúltalo con el MCP); cada quien trabaja las historias de su carril.
- No borres historias, sprints ni proyectos sin confirmación del equipo.
- Guía para conectar el MCP en otra máquina: `docs/mcp-taiga.md`.
