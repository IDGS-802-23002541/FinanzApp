from sqlalchemy.dialects.mssql import DATETIME2, ROWVERSION

from app.extensions import db


class Cartera(db.Model):
    __tablename__ = "CARTERA"

    idCartera = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Unicode(100), nullable=False)
    descripcion = db.Column(db.Unicode(500))
    presupuestoInicial = db.Column(
        db.Numeric(12, 2), nullable=False, server_default="0"
    )
    tipo = db.Column(db.String(10), nullable=False, server_default="OTRA")
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaInicio = db.Column(db.Date)
    fechaFin = db.Column(db.Date)
    estado = db.Column(db.String(12), nullable=False, server_default="ACTIVA")
    versionFila = db.Column(
        ROWVERSION, nullable=False, server_default=db.FetchedValue()
    )


class MiembroCartera(db.Model):
    __tablename__ = "MIEMBROS_CARTERA"
    __table_args__ = (
        db.Index("IX_MIEMBROS_CARTERA_usuario", "usuarioId", "estado"),
    )

    carteraId = db.Column(
        db.Integer, db.ForeignKey("CARTERA.idCartera"), primary_key=True
    )
    usuarioId = db.Column(
        db.Integer, db.ForeignKey("USUARIO.idUsuario"), primary_key=True
    )
    rol = db.Column(
        db.String(15), nullable=False, server_default="CONTRIBUYENTE"
    )
    estado = db.Column(db.String(10), nullable=False, server_default="ACTIVO")
    fechaUnion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaBaja = db.Column(DATETIME2)


class Categoria(db.Model):
    __tablename__ = "CATEGORIAS"
    __table_args__ = (
        db.Index(
            "UX_CATEGORIAS_cartera_nombre",
            "carteraId",
            "nombre",
            unique=True,
            mssql_where=db.text("carteraId IS NOT NULL"),
        ),
        db.Index(
            "UX_CATEGORIAS_global_nombre",
            "nombre",
            unique=True,
            mssql_where=db.text("carteraId IS NULL"),
        ),
    )

    idCategoria = db.Column(db.Integer, primary_key=True)
    carteraId = db.Column(db.Integer, db.ForeignKey("CARTERA.idCartera"))
    nombre = db.Column(db.Unicode(80), nullable=False)
    tipo = db.Column(db.String(10), nullable=False, server_default="AMBOS")
    estado = db.Column(db.String(10), nullable=False, server_default="ACTIVA")
    esPredeterminada = db.Column(
        db.Boolean,
        db.Computed(
            "CASE WHEN carteraId IS NULL THEN 1 ELSE 0 END", persisted=True
        ),
    )


class Periodo(db.Model):
    __tablename__ = "PERIODO"
    __table_args__ = (
        db.Index(
            "IX_PERIODO_cartera_fechas", "carteraId", "fechaInicio", "fechaFin"
        ),
    )

    idPeriodo = db.Column(db.Integer, primary_key=True)
    carteraId = db.Column(
        db.Integer, db.ForeignKey("CARTERA.idCartera"), nullable=False
    )
    nombre = db.Column(db.Unicode(80), nullable=False)
    fechaInicio = db.Column(db.Date, nullable=False)
    fechaFin = db.Column(db.Date, nullable=False)
    estado = db.Column(db.String(12), nullable=False, server_default="ACTIVO")
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )


class Ahorro(db.Model):
    __tablename__ = "AHORRO"
    __table_args__ = (
        db.ForeignKeyConstraint(
            ["carteraId", "usuarioId"],
            ["MIEMBROS_CARTERA.carteraId", "MIEMBROS_CARTERA.usuarioId"],
            name="FK_AHORRO_MIEMBRO",
        ),
        db.Index("IX_AHORRO_cartera_estado", "carteraId", "estado"),
    )

    idAhorro = db.Column(db.Integer, primary_key=True)
    carteraId = db.Column(
        db.Integer, db.ForeignKey("CARTERA.idCartera"), nullable=False
    )
    usuarioId = db.Column(db.Integer, nullable=False)
    nombre = db.Column(db.Unicode(100), nullable=False)
    descripcion = db.Column(db.Unicode(500))
    meta = db.Column(db.Numeric(12, 2), nullable=False)
    montoActual = db.Column(
        db.Numeric(12, 2), nullable=False, server_default="0"
    )
    fechaObjetivo = db.Column(db.Date)
    estado = db.Column(db.String(12), nullable=False, server_default="ACTIVO")
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )


class Invitacion(db.Model):
    __tablename__ = "INVITACION"
    __table_args__ = (
        db.ForeignKeyConstraint(
            ["carteraId", "usuarioId"],
            ["MIEMBROS_CARTERA.carteraId", "MIEMBROS_CARTERA.usuarioId"],
            name="FK_INVITACION_CREADOR",
        ),
        db.UniqueConstraint("codigoHash", name="UQ_INVITACION_codigoHash"),
        db.Index("IX_INVITACION_cartera_estado", "carteraId", "estado"),
        db.Index(
            "IX_INVITACION_expiracion",
            "fechaExpiracion",
            mssql_where=db.text("estado = 'ACTIVA'"),
        ),
    )

    idInvitacion = db.Column(db.Integer, primary_key=True)
    carteraId = db.Column(
        db.Integer, db.ForeignKey("CARTERA.idCartera"), nullable=False
    )
    usuarioId = db.Column(db.Integer, nullable=False)
    codigoHash = db.Column(db.String(64), nullable=False)
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaExpiracion = db.Column(DATETIME2, nullable=False)
    estado = db.Column(db.String(12), nullable=False, server_default="ACTIVA")
    fechaRevocacion = db.Column(DATETIME2)
