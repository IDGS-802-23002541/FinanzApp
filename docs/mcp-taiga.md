# MCP de Taiga — instalación y conexión

El MCP de Taiga conecta OpenCode con el tablero Kanban del proyecto (consultar, crear y actualizar historias sin salir del editor). Esta guía replica la configuración que ya funciona en el equipo de FinanzApp.

## 1. Requisitos

- Node.js instalado (`npx` disponible).
- Cuenta de Taiga con acceso al proyecto FinanzApp.

## 2. Credenciales (fuera del repo)

Crea `~/.config/opencode/taiga.env`:

```bash
TAIGA_URL='https://api.taiga.io'      # o la URL de tu instancia
TAIGA_USERNAME='tu_usuario'
TAIGA_PASSWORD='tu_contrasena'
```

```bash
chmod 600 ~/.config/opencode/taiga.env
```

> ⚠️ Este archivo **nunca** se sube al repositorio.

## 3. Configuración en OpenCode

Edita `~/.config/opencode/opencode.jsonc` y agrega dentro de `"mcp"`:

```jsonc
"taiga": {
  "type": "local",
  "command": [
    "bash", "-c",
    "set -a; . $HOME/.config/opencode/taiga.env; set +a; exec npx -y @illodev/taiga-mcp"
  ],
  "enabled": true
}
```

Notas:

- Si `npx` no se encuentra (por ejemplo con nvm), usa la ruta completa que devuelve `which npx` en lugar de `npx`.
- La documentación de OpenCode V2 declara los MCP dentro de `mcp.servers`; la configuración que ya funciona en el equipo usa la forma directa `mcp.<nombre>`. Si al reiniciar no conecta, envuélvelo como `"servers": { "taiga": { … } }`.
- Alternativa por CLI: `opencode mcp add taiga --global -- npx -y @illodev/taiga-mcp` y después completar las variables de entorno.

## 4. Vincular tu cuenta y el proyecto FinanzApp

- **Cuenta:** al definir `TAIGA_USERNAME`/`TAIGA_PASSWORD` el MCP inicia sesión con *tu* cuenta de Taiga. Verifícalo con la herramienta `taiga_users_me` (devuelve tu usuario, correo y roles).
- **Espacio de trabajo (proyecto):** el MCP no fija un proyecto; cada consulta indica a cuál ir. El tablero del equipo es:

  | Proyecto | id | slug |
  | --- | --- | --- |
  | **FinanzApp** | `1808877` | `idgs-802-23002441-finanzapp` |

  Es **privado** y tiene 4 miembros. Si no aparece en tu lista, pide al equipo que te agreguen al proyecto.
- **De aquí salen las actividades del agente:** las *historias de usuario* (`user stories`) de **FinanzApp** son las tareas que el agente trabaja; los *sprints* y el estado de cada historia indican qué está pendiente. Ejemplo: `taiga_userstories_list({ project: 1808877 })`.

## 5. Verificar la conexión

1. Reinicia OpenCode.
2. Pide en una sesión: «verifica la conexión de Taiga» (usa la herramienta `taiga_users_me`).
3. Prueba rápida: «lista mis proyectos de Taiga» → `taiga_projects_list({ member: <tu id> })` (debe aparecer **FinanzApp**).
4. «Lista las historias del proyecto FinanzApp» → `taiga_userstories_list({ project: 1808877 })`.

## 6. Uso en el flujo de trabajo

- **Fuente de actividades:** toma las historias de usuario del proyecto **FinanzApp** como el backlog de trabajo del agente; no dupliques historias.
- Consulta y actualiza historias con el MCP en lugar de duplicarlas; el tablero Taiga es la fuente de verdad del backlog.
- No borres historias, sprints ni proyectos sin confirmación del equipo.
- Las historias iniciales ya están cargadas en el tablero; administra cambios solo con el MCP.
