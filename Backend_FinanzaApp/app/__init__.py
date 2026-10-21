"""
Inicialización de la aplicación Flask
Implementa el patrón Application Factory (create_app) para configurar e 
instanciar el servidor backend de FinanzApp. Se encarga de cargar las 
variables de entorno y credenciales desde config.py, inicializar la conexión 
a la base de datos SQL Server mediante SQLAlchemy y registrar los modelos y rutas base
"""

from flask import Flask, jsonify
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db


def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")

    db.init_app(app)

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from app import models  

    # La puse de prueba para ver si todo salia bien con la coneccion a BD
    @app.get("/prueba")
    def prueba():
        try:
            base = db.session.execute(text("SELECT DB_NAME()")).scalar_one()
            tablas = db.session.execute(
                text(
                    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES "
                    "WHERE TABLE_TYPE = 'BASE TABLE'"
                )
            ).scalar_one()
        except SQLAlchemyError:
            return (
                jsonify(
                    {
                        "ok": False,
                        "mensaje": "No se pudo conectar a SQL Server.",
                    }
                ),
                503,
            )

        return jsonify(
            {
                "ok": True,
                "data": {"base": base, "tablas": tablas},
                "mensaje": "Conexión a SQL Server correcta.",
            }
        )

    return app
