from sqlalchemy.dialects.mssql import DATETIME2

from app.extensions import db


class Usuario(db.Model):
    __tablename__ = "USUARIO"
    __table_args__ = (db.UniqueConstraint("correo", name="UQ_USUARIO_correo"),)

    idUsuario = db.Column(db.Integer, primary_key=True)
    nombreUsuario = db.Column(db.Unicode(80), nullable=False)
    apaterno = db.Column(db.Unicode(80), nullable=False)
    amaterno = db.Column(db.Unicode(80))
    correo = db.Column(db.Unicode(254), nullable=False)
    contrasenia = db.Column(db.String(255), nullable=False)
    rolGlobal = db.Column(
        db.String(15), nullable=False, server_default="CLIENTE"
    )
    fechaRegistro = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaActualizacion = db.Column(DATETIME2)
    estado = db.Column(db.String(10), nullable=False, server_default="ACTIVO")
    # baja logica real, /cuenta lo llena al eliminar. esto es distinto de fechaActualizacion 
    fechaBaja=db.Column(DATETIME2)


class PreferenciaUsuario(db.Model):
    __tablename__ = "PREFERENCIAS_USUARIO"

    usuarioId = db.Column(
        db.Integer, db.ForeignKey("USUARIO.idUsuario"), primary_key=True
    )
    tema = db.Column(db.String(10), nullable=False, server_default="CLARO")
    notificacionesCorreo = db.Column(
        db.Boolean, nullable=False, server_default=db.text("1")
    )
    notificacionesApp = db.Column(
        db.Boolean, nullable=False, server_default=db.text("1")
    )
    moneda = db.Column(db.String(3), nullable=False, server_default="MXN")
    fechaActualizacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )


class SesionUsuario(db.Model):
    __tablename__ = "SESIONES_USUARIO"
    __table_args__ = (
        db.UniqueConstraint("hashRefreshToken", name="UQ_SESIONES_USUARIO_hash"),
        db.Index(
            "IX_SESIONES_USUARIO_activas",
            "usuarioId",
            "fechaExpiracion",
            mssql_where=db.text("fechaRevocacion IS NULL"),
        ),
        db.Index(
            "IX_SESIONES_USUARIO_usuario", "usuarioId", "fechaExpiracion"
        ),
    )

    idSesion = db.Column(db.BigInteger, primary_key=True)
    usuarioId = db.Column(
        db.Integer, db.ForeignKey("USUARIO.idUsuario"), nullable=False
    )
    hashRefreshToken = db.Column(db.LargeBinary(32), nullable=False)
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaExpiracion = db.Column(DATETIME2, nullable=False)
    fechaRevocacion = db.Column(DATETIME2)
    reemplazadaPor = db.Column(
        db.BigInteger, db.ForeignKey("SESIONES_USUARIO.idSesion")
    )
    ip = db.Column(db.Unicode(45))
    userAgent = db.Column(db.Unicode(500))


class TokenRecuperacion(db.Model):
    __tablename__ = "TOKENS_RECUPERACION"
    __table_args__ = (
        db.UniqueConstraint("hashToken", name="UQ_TOKENS_RECUPERACION_hash"),
        db.Index(
            "IX_TOKENS_RECUPERACION_usuario", "usuarioId", "fechaExpiracion"
        ),
    )

    idToken = db.Column(db.BigInteger, primary_key=True)
    usuarioId = db.Column(
        db.Integer, db.ForeignKey("USUARIO.idUsuario"), nullable=False
    )
    hashToken = db.Column(db.LargeBinary(32), nullable=False)
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaExpiracion = db.Column(DATETIME2, nullable=False)
    fechaUso = db.Column(DATETIME2)
