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
│   ├── extensions.py        # db (SQL Server), cloudinary
│   ├── blueprints/
│   │   ├── auth/            # __init__.py, routes.py, services.py, schemas.py
│   │   ├── usuarios/
│   │   ├── carteras/
│   │   ├── miembros/
│   │   ├── transacciones/
│   │   └── resumen/
│   ├── models/              # entidades SQLAlchemy
│   └── utils/
├── config.py
├── run.py
├── requirements.txt
└── .env.example
```

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
