# Reglas de `backpython` (API)

- Stack: **Python 3.13 + Flask con Blueprints**; un blueprint por dominio (`auth`, `usuarios`, `carteras`, `miembros`, `transacciones`, `resumen`).
- **SQL Server** es la única base de datos; el acceso (SQLAlchemy) vive en `app/extensions.py` y `app/models/`.
- Archivos e imágenes van a **Cloudinary**; nunca se guardan en la BD ni en el repo.
- Nada de lógica en `routes.py`: validar, delegar a `services.py` y responder JSON con el código HTTP correcto.
- Errores con el formato del contrato: `{ "codigo": "...", "mensaje": "..." }`.
- Secretos solo en `.env` (ignorado); jamás hardcodear credenciales.
- Antes de terminar: la API levanta sin errores (`flask --app run.py run`) y los endpoints tocados responden.
- Commits con el estándar del `AGENTS.md` raíz en tu rama (`DB/VR/AC/DR <tipo>: …`).
