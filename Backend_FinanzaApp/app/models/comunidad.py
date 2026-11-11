from sqlalchemy.dialects.mssql import DATETIME2

from app.extensions import db


class Notificacion(db.Model):
    __tablename__ = "NOTIFICACION"
    __table_args__ = (
        db.Index(
            "IX_NOTIFICACION_usuario_fecha", "usuarioId", "fechaCreacion"
        ),
        db.CheckConstraint(
            "LEN(LTRIM(RTRIM(titulo))) > 0",
            name="CK_NOTIFICACION_titulo",
        ),
        db.CheckConstraint(
            "LEN(LTRIM(RTRIM(mensaje))) > 0",
            name="CK_NOTIFICACION_mensaje",
        ),
    )

    idNotificacion = db.Column(db.BigInteger, primary_key=True)
    usuarioId = db.Column(
        db.Integer,
        db.ForeignKey("USUARIO.idUsuario", ondelete="NO ACTION"),
        nullable=False,
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
        db.CheckConstraint(
            "estado IN ('PENDIENTE', 'PUBLICADO', 'OCULTO')",
            name="CK_COMENTARIO_LANDING_estado",
        ),
        db.Index("IX_COMENTARIO_LANDING_ip_fecha", "ip", "fechaCreacion"),
    )

    idComentario = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Unicode(120), nullable=False)
    correo = db.Column(db.Unicode(254))
    comentario = db.Column(db.Unicode(2000), nullable=False)
    # Origen del envío: se usa solo para el límite anti-spam, no se expone en la API.
    ip = db.Column(db.Unicode(45))
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    estado = db.Column(db.String(12), nullable=False, server_default="PENDIENTE")
