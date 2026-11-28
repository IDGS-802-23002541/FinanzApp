from sqlalchemy.dialects.mssql import DATETIME2

from app.extensions import db


class MonitoreoSonda(db.Model):
    __tablename__ = "MONITOREO_SONDA"

    idSonda = db.Column(db.Integer, primary_key=True)
    # Se guarda truncado al minuto para no duplicar muestras entre workers.
    minuto = db.Column(DATETIME2, nullable=False, unique=True)
    fechaHora = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    ok = db.Column(db.Boolean, nullable=False)
    duracionMs = db.Column(db.Float, nullable=False)
    base = db.Column(db.Unicode(128))
