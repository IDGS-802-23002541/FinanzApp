# Contexto del proyecto — FinanzApp

- **Institución:** Universidad Tecnológica de León (UTL) · Ingeniería en Desarrollo y Gestión de Software · Grupo IDGS1002.
- **Materias:** Aplicaciones Web Progresivas · Desarrollo Móvil Integral.
- **Producto:** FinanzApp, plataforma web y móvil de finanzas personales y colaborativas por «carteras» (hogar, viajes, eventos): registro de gastos compartidos, invitaciones por QR/clave, estadísticas y cierre con liquidación sugerida.
- **Equipo:** Diego Yair Borja Romero · Aideé Vanessa Casillas Tapia · Vanessa Yassmin Rea Muñoz · Antonio Damián Rodríguez Alarcón.
- **Repositorio:** https://github.com/IDGS-802-23002541/FinanzApp.git — ramas: `main`, `diego`, `vanessa`, `aidee`, `damian`.
- **Tablero Kanban:** Taiga (conectado por MCP; guía en `docs/mcp-taiga.md`).
- **Stack oficial (desarrollo nuevo):**
  - Web: React + Vite, **única librería de UI: MUI**.
  - Backend: Python 3.13 + Flask con **Blueprints**; base de datos **SQL Server**; archivos en **Cloudinary**.
  - Móvil: Android Studio con **Kotlin + Jetpack Compose**.
- **Documentos clave:**
  - `historias_de_usuario.md` — 14 historias con INVEST + anexo de backlog técnico e independiente para 4 desarrolladores.
  - `backlog_tecnico_y_reparto.md` — fichas técnicas, 4 carriles (Diego/Aideé/Vanessa/Damián) y plan de iteraciones.
  - `historias_taiga.csv`, `historias_taiga_sujetos.txt`, `importar_taiga.py` — carga del backlog a Taiga.
- **Prototipo existente:** `finanzapp-web/` (Angular + Tailwind) es el prototipo funcional de referencia; **no se desarrolla ahí**.
