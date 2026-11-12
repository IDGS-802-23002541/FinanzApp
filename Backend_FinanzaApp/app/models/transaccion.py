from sqlalchemy.dialects.mssql import DATETIME2

from app.extensions import db


class Transaccion(db.Model):
    __tablename__ = "TRANSACCIONES"
    __table_args__ = (
        db.ForeignKeyConstraint(
            ["carteraId", "usuarioId"],
            ["MIEMBROS_CARTERA.carteraId", "MIEMBROS_CARTERA.usuarioId"],
            name="FK_TRANSACCIONES_MIEMBRO",
        ),
        db.Index(
            "IX_TRANSACCIONES_cartera_fecha", "carteraId", "fechaTransaccion"
        ),
        db.Index("IX_TRANSACCIONES_categoria", "categoriaId"),
        db.Index(
            "IX_TRANSACCIONES_usuario_fecha", "usuarioId", "fechaTransaccion"
        ),
        db.Index("IX_TRANSACCIONES_cartera_estado", "carteraId", "estado"),
        db.CheckConstraint(
            "tipo IN ('INGRESO', 'GASTO')",
            name="CK_TRANSACCIONES_tipo",
        ),
        db.CheckConstraint("monto > 0", name="CK_TRANSACCIONES_monto"),
        db.CheckConstraint(
            "estado IN ('ACTIVO', 'ELIMINADO')",
            name="CK_TRANSACCIONES_estado",
        ),
        db.CheckConstraint(
            "metodoPago IS NULL OR metodoPago IN "
            "('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')",
            name="CK_TRANSACCIONES_metodo_pago",
        ),
    )

    idTransaccion = db.Column(db.Integer, primary_key=True)
    carteraId = db.Column(
        db.Integer,
        db.ForeignKey("CARTERA.idCartera", ondelete="NO ACTION"),
        nullable=False,
    )
    usuarioId = db.Column(db.Integer, nullable=False)
    categoriaId = db.Column(db.Integer, db.ForeignKey("CATEGORIAS.idCategoria"))
    periodoId = db.Column(db.Integer, db.ForeignKey("PERIODO.idPeriodo"))
    tipo = db.Column(db.String(10), nullable=False)
    monto = db.Column(db.Numeric(12, 2), nullable=False)
    descripcion = db.Column(db.Unicode(500))
    metodoPago = db.Column(db.String(15))
    comprobanteUrl = db.Column(db.Unicode(500))
    estado = db.Column(db.String(10), nullable=False, server_default="ACTIVO")
    fechaTransaccion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaActualizacion = db.Column(DATETIME2)


class PagoRecurrente(db.Model):
    __tablename__ = "PAGOS_RECURRENTES"
    __table_args__ = (
        db.ForeignKeyConstraint(
            ["carteraId", "usuarioId"],
            ["MIEMBROS_CARTERA.carteraId", "MIEMBROS_CARTERA.usuarioId"],
            name="FK_PAGOS_RECURRENTES_MIEMBRO",
        ),
        db.Index("IX_PAGOS_RECURRENTES_proxima", "estado", "proximaEjecucion"),
        db.CheckConstraint("monto > 0", name="CK_PAGOS_RECURRENTES_monto"),
        db.CheckConstraint(
            "frecuencia IN ('DIARIO', 'SEMANAL', 'MENSUAL', 'ANUAL')",
            name="CK_PAGOS_RECURRENTES_frecuencia",
        ),
        db.CheckConstraint(
            "estado IN ('ACTIVO', 'PAUSADO', 'CANCELADO')",
            name="CK_PAGOS_RECURRENTES_estado",
        ),
        db.CheckConstraint(
            "fechaFin IS NULL OR fechaFin >= fechaInicio",
            name="CK_PAGOS_RECURRENTES_fechas",
        ),
    )

    idPagoRecurrente = db.Column(db.Integer, primary_key=True)
    carteraId = db.Column(
        db.Integer,
        db.ForeignKey("CARTERA.idCartera", ondelete="NO ACTION"),
        nullable=False,
    )
    usuarioId = db.Column(db.Integer, nullable=False)
    categoriaId = db.Column(db.Integer, db.ForeignKey("CATEGORIAS.idCategoria"))
    nombre = db.Column(db.Unicode(120), nullable=False)
    descripcion = db.Column(db.Unicode(500))
    monto = db.Column(db.Numeric(12, 2), nullable=False)
    frecuencia = db.Column(db.String(12), nullable=False)
    fechaInicio = db.Column(db.Date, nullable=False)
    fechaFin = db.Column(db.Date)
    proximaEjecucion = db.Column(db.Date, nullable=False)
    estado = db.Column(db.String(12), nullable=False, server_default="ACTIVO")
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )


class PagoRecEjecucion(db.Model):
    __tablename__ = "PAGOS_REC_EJECUCIONES"
    __table_args__ = (
        db.UniqueConstraint(
            "pagoRecurrenteId",
            "fechaProgramada",
            name="UQ_PAGOS_REC_EJECUCIONES_fecha",
        ),
        db.CheckConstraint(
            "monto > 0", name="CK_PAGOS_REC_EJECUCIONES_monto"
        ),
        db.CheckConstraint(
            "estado IN ('PENDIENTE', 'EJECUTADO', 'FALLIDO', 'OMITIDO')",
            name="CK_PAGOS_REC_EJECUCIONES_estado",
        ),
    )

    idEjecucion = db.Column(db.Integer, primary_key=True)
    pagoRecurrenteId = db.Column(
        db.Integer,
        db.ForeignKey("PAGOS_RECURRENTES.idPagoRecurrente", ondelete="NO ACTION"),
        nullable=False,
    )
    transaccionId = db.Column(
        db.Integer, db.ForeignKey("TRANSACCIONES.idTransaccion"), nullable=True
    )
    fechaProgramada = db.Column(db.Date, nullable=False)
    fechaEjecucion = db.Column(DATETIME2)
    monto = db.Column(db.Numeric(12, 2), nullable=False)
    estado = db.Column(db.String(12), nullable=False, server_default="PENDIENTE")
    mensajeError = db.Column(db.Unicode(500))
