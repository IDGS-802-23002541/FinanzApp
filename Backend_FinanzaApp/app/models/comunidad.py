from sqlalchemy.dialects.mssql import DATETIME2

from app.extensions import db


class Notificacion(db.Model):
    __tablename__ = "NOTIFICACION"
    __table_args__ = (
        db.Index(
            "IX_NOTIFICACION_usuario_fecha", "usuarioId", "fechaCreacion"
        ),
    )

    idNotificacion = db.Column(db.BigInteger, primary_key=True)
    usuarioId = db.Column(
        db.Integer, db.ForeignKey("USUARIO.idUsuario"), nullable=False
    )
    titulo = db.Column(db.Unicode(150), nullable=False)
    mensaje = db.Column(db.Unicode(1000), nullable=False)
    tipo = db.Column(db.String(30))
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaLectura = db.Column(DATETIME2)


class ComentarioLanding(db.Model):
    __tablename__ = "COMENTARIO_LANDING"
    __table_args__ = (
        db.Index(
            "IX_COMENTARIO_LANDING_estado_fecha", "estado", "fechaCreacion"
        ),
    )

    idComentario = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Unicode(120), nullable=False)
    correo = db.Column(db.Unicode(254))
    comentario = db.Column(db.Unicode(2000), nullable=False)
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    estado = db.Column(db.String(12), nullable=False, server_default="PENDIENTE")
