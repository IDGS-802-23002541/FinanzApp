# Backend_FinanzaApp — API REST (Python 3.13 + Flask)

API oficial de FinanzApp.

## Stack obligatorio

- **Python 3.13** + **Flask con Blueprints** (un blueprint por dominio).
- **SQL Server** como base de datos (SQLAlchemy + `pyodbc`).
- **Cloudinary** para archivos e imágenes (nunca guardar binarios en el repo ni en la BD).

## Estructura sugerida

```
Backend_FinanzaApp/
├── app/
│   ├── __init__.py          # create_app() y registro de blueprints
│   ├── extensions.py        # db (SQL Server), cloudinary, jwt
│   ├── routes/              # endpoints delgados: request → servicio → jsonify
│   ├── services/            # lógica de negocio (auth_service, cartera_service)
│   ├── utils/               # seguridad, validacion, respuestas, serializers
│   ├── models/              # entidades SQLAlchemy
├── config.py
├── run.py
├── requirements.txt
└── .env.example
```

## Capas

- `routes/`: solo endpoints. Sin consultas DB ni validaciones.
- `services/`: lógica de negocio y acceso a DB. Devuelve `(payload, status)`.
- `utils/`: `seguridad`, `validacion`, `respuestas`, `serializers`.

## Primeros pasos

```bash
cd Backend_FinanzaApp
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask --app run.py run --debug
```

Variables de entorno en `.env` (nunca al repo): cadena de conexión de SQL Server y credenciales de Cloudinary.

## Reglas

Ver el `AGENTS.md` raíz (ramas, commits y reglas generales).
