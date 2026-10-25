"""
Inicialización de la aplicación Flask
Implementa el patrón Application Factory (create_app) para configurar e
instanciar el servidor backend de FinanzApp. Se encarga de cargar las
variables de entorno y credenciales desde config.py, inicializar la conexión
a la base de datos SQL Server mediante SQLAlchemy y registrar los modelos y rutas base
"""

from datetime import datetime, timezone

from flask import Flask, jsonify
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db, jwt


def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")

    db.init_app(app)
    jwt.init_app(app)

    from app import models
    from app.routes.auth import auth_bp
    from app.routes.carteras import carteras_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(carteras_bp)

    @jwt.user_lookup_loader
    def cargar_usuario(_jwt_header, jwt_data):
        return db.session.get(models.Usuario, int(jwt_data["sub"]))

    @jwt.token_in_blocklist_loader
    def sesion_revocada(_jwt_header, jwt_data):
        sesion_id = jwt_data.get("sid")
        if sesion_id is None:
            return True

        sesion = db.session.get(models.SesionUsuario, sesion_id)
        if sesion is None or sesion.fechaRevocacion is not None:
            return True

        ahora = datetime.now(timezone.utc).replace(tzinfo=None)
        return sesion.fechaExpiracion <= ahora

    @jwt.unauthorized_loader
    def sin_token(_motivo):
        return jsonify({"ok": False, "mensaje": "Token no proporcionado."}), 401

    @jwt.invalid_token_loader
    def token_invalido(_motivo):
        return jsonify({"ok": False, "mensaje": "Token inválido."}), 401

    @jwt.expired_token_loader
    def token_expirado(_jwt_header, _jwt_payload):
        return jsonify({"ok": False, "mensaje": "Token expirado."}), 401

    @jwt.revoked_token_loader
    def token_revocado(_jwt_header, _jwt_payload):
        return jsonify({"ok": False, "mensaje": "Sesión cerrada o inválida."}), 401

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
