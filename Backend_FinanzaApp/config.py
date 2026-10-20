import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev")

    DB_SERVER = os.getenv("DB_SERVER")
    DB_PORT = os.getenv("DB_PORT", "1433")
    DB_NAME = os.getenv("DB_NAME")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    @classmethod
    def sqlalchemy_uri(cls):
        if not all((cls.DB_SERVER, cls.DB_NAME, cls.DB_USER, cls.DB_PASSWORD)):
            return None

        # Construir la cadena directa de ODBC escapada
        connection_string = (
            "DRIVER={ODBC Driver 18 for SQL Server};"
            f"SERVER={cls.DB_SERVER},{cls.DB_PORT};"
            f"DATABASE={cls.DB_NAME};"
            f"UID={cls.DB_USER};"
            f"PWD={cls.DB_PASSWORD};"
            "TrustServerCertificate=yes;"
            "Encrypt=no;"
            "Connection Timeout=30;"
        )
        return f"mssql+pyodbc:///?odbc_connect={quote_plus(connection_string)}"


Config.SQLALCHEMY_DATABASE_URI = Config.sqlalchemy_uri()