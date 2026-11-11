from sqlalchemy.dialects.mssql import DATETIME2, ROWVERSION

from app.extensions import db


class Cartera(db.Model):
    __tablename__ = "CARTERA"
    __table_args__ = (
        db.CheckConstraint(
            "tipo IN ('HOGAR', 'VIAJE', 'EVENTO', 'OTRA')",
            name="CK_CARTERA_tipo",
        ),
        db.CheckConstraint(
            "estado IN ('ACTIVA', 'ARCHIVADA', 'FINALIZADA')",
            name="CK_CARTERA_estado",
        ),
        db.CheckConstraint(
            "fechaInicio IS NULL OR fechaFin IS NULL OR fechaFin >= fechaInicio",
            name="CK_CARTERA_fechas",
        ),
        db.CheckConstraint(
            "presupuestoInicial IS NULL OR presupuestoInicial >= 0",
            name="CK_CARTERA_presupuesto",
        ),
    )

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
    fechaCierre = db.Column(DATETIME2)
    estado = db.Column(db.String(12), nullable=False, server_default="ACTIVA")
    versionFila = db.Column(
        ROWVERSION, nullable=False, server_default=db.FetchedValue()
    )


class MiembroCartera(db.Model):
    __tablename__ = "MIEMBROS_CARTERA"
    __table_args__ = (
        db.Index("IX_MIEMBROS_CARTERA_usuario", "usuarioId", "estado"),
        db.CheckConstraint(
            "rol IN ('ADMIN', 'CONTRIBUYENTE')",
            name="CK_MIEMBROS_CARTERA_rol",
        ),
        db.CheckConstraint(
            "estado IN ('ACTIVO', 'BAJA')",
            name="CK_MIEMBROS_CARTERA_estado",
        ),
        db.CheckConstraint(
            "(estado = 'ACTIVO' AND fechaBaja IS NULL) OR estado = 'BAJA'",
            name="CK_MIEMBROS_CARTERA_baja",
        ),
    )

    carteraId = db.Column(
        db.Integer, db.ForeignKey("CARTERA.idCartera"), primary_key=True
    )
    usuarioId = db.Column(
        db.Integer, db.ForeignKey("USUARIO.idUsuario"), primary_key=True
    )
    rol = db.Column(db.String(15), nullable=False, server_default="CONTRIBUYENTE")
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
            "tipoCartera",
            unique=True,
            mssql_where=db.text("carteraId IS NULL"),
        ),
        db.Index("IX_CATEGORIAS_consulta", "carteraId", "estado", "orden"),
        db.CheckConstraint(
            "carteraId IS NULL OR tipoCartera IS NULL",
            name="CK_CATEGORIAS_global_o_personal",
        ),
        db.CheckConstraint(
            "tipo IN ('INGRESO', 'GASTO', 'AMBOS')",
            name="CK_CATEGORIAS_tipo",
        ),
        db.CheckConstraint(
            "estado IN ('ACTIVA', 'INACTIVA')",
            name="CK_CATEGORIAS_estado",
        ),
    )

    idCategoria = db.Column(db.Integer, primary_key=True)
    carteraId = db.Column(
        db.Integer,
        db.ForeignKey("CARTERA.idCartera", ondelete="NO ACTION"),
    )
    nombre = db.Column(db.Unicode(80), nullable=False)
    tipo = db.Column(db.String(10), nullable=False, server_default="AMBOS")
    tipoCartera = db.Column(db.String(10))
    orden = db.Column(db.Integer, nullable=False, server_default="0")
    estado = db.Column(db.String(10), nullable=False, server_default="ACTIVA")
    esPredeterminada = db.Column(
        db.Boolean,
        db.Computed("CASE WHEN carteraId IS NULL THEN 1 ELSE 0 END", persisted=True),
    )


class Periodo(db.Model):
    __tablename__ = "PERIODO"
    __table_args__ = (
        db.Index("IX_PERIODO_cartera_fechas", "carteraId", "fechaInicio", "fechaFin"),
        db.CheckConstraint(
            "fechaFin >= fechaInicio",
            name="CK_PERIODO_fechas",
        ),
        db.CheckConstraint(
            "estado IN ('ACTIVO', 'CERRADO')",
            name="CK_PERIODO_estado",
        ),
    )

    idPeriodo = db.Column(db.Integer, primary_key=True)
    carteraId = db.Column(
        db.Integer,
        db.ForeignKey("CARTERA.idCartera", ondelete="NO ACTION"),
        nullable=False,
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
    montoActual = db.Column(db.Numeric(12, 2), nullable=False, server_default="0")
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
        db.CheckConstraint(
            "estado IN ('ACTIVA', 'REVOCADA')",
            name="CK_INVITACION_estado",
        ),
        db.CheckConstraint(
            "fechaExpiracion > fechaCreacion",
            name="CK_INVITACION_fechas",
        ),
        db.CheckConstraint(
            "(estado = 'ACTIVA' AND fechaRevocacion IS NULL) OR "
            "(estado = 'REVOCADA' AND fechaRevocacion IS NOT NULL)",
            name="CK_INVITACION_revocacion",
        ),
    )

    idInvitacion = db.Column(db.Integer, primary_key=True)
    carteraId = db.Column(
        db.Integer,
        db.ForeignKey("CARTERA.idCartera", ondelete="NO ACTION"),
        nullable=False,
    )
    usuarioId = db.Column(db.Integer, nullable=False)
    codigoHash = db.Column(db.String(64), nullable=False)
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaExpiracion = db.Column(DATETIME2, nullable=False)
    estado = db.Column(db.String(12), nullable=False, server_default="ACTIVA")
    fechaRevocacion = db.Column(DATETIME2)
