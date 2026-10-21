"""
Extensiones globales de Flask
Centraliza la instanciación de las extensiones de la aplicación (como SQLAlchemy)
sin vincularlas inmediatamente a la app. Su propósito principal es evitar
importaciones circulares (circular imports) entre los modelos y la aplicación,
permitiendo implementar limpiamente el patrón de diseño por factoría (create_app).
"""

from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
jwt = JWTManager()