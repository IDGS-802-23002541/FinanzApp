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

## 4. Verificar la conexión

1. Reinicia OpenCode.
2. Pide en una sesión: «verifica la conexión de Taiga» (usa la herramienta `taiga_users_me`).
3. Prueba rápida: «lista mis proyectos de Taiga».

## 5. Uso en el flujo de trabajo

- Consulta y actualiza historias con el MCP en lugar de duplicarlas; el backlog de referencia está en `backlog_tecnico_y_reparto.md`.
- No borres historias, sprints ni proyectos sin confirmación del equipo.
- La carga inicial del backlog también puede hacerse con `historias_taiga.csv` y `importar_taiga.py`.
