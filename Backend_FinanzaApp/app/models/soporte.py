from sqlalchemy.dialects.mssql import DATETIME2

from app.extensions import db


class Ticket(db.Model):
    __tablename__ = "TICKET"
    __table_args__ = (
        db.Index(
            "IX_TICKET_estado_prioridad",
            "estado",
            "prioridad",
            "fechaCreacion",
        ),
        db.Index("IX_TICKET_usuario_fecha", "usuarioId", "fechaCreacion"),
        db.CheckConstraint(
            "LEN(LTRIM(RTRIM(asunto))) > 0", name="CK_TICKET_asunto"
        ),
        db.CheckConstraint(
            "LEN(LTRIM(RTRIM(descripcion))) > 0",
            name="CK_TICKET_descripcion",
        ),
        db.CheckConstraint(
            "categoria IN "
            "('GENERAL', 'CUENTA', 'CARTERA', 'PAGOS', 'ERROR', 'OTRO')",
            name="CK_TICKET_categoria",
        ),
        db.CheckConstraint(
            "prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')",
            name="CK_TICKET_prioridad",
        ),
        db.CheckConstraint(
            "estado IN "
            "('ABIERTO', 'EN_PROCESO', 'ESPERA', 'RESUELTO', 'CERRADO')",
            name="CK_TICKET_estado",
        ),
        db.CheckConstraint(
            "fechaCierre IS NULL OR fechaCierre >= fechaCreacion",
            name="CK_TICKET_cierre",
        ),
    )

    idTicket = db.Column(db.Integer, primary_key=True)
    usuarioId = db.Column(
        db.Integer,
        db.ForeignKey("USUARIO.idUsuario", ondelete="NO ACTION"),
        nullable=False,
    )
    asunto = db.Column(db.Unicode(150), nullable=False)
    descripcion = db.Column(db.Unicode(3000), nullable=False)
    categoria = db.Column(db.String(30), nullable=False, server_default="GENERAL")
    prioridad = db.Column(db.String(10), nullable=False, server_default="MEDIA")
    estado = db.Column(db.String(15), nullable=False, server_default="ABIERTO")
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaActualizacion = db.Column(DATETIME2)
    fechaCierre = db.Column(DATETIME2)


class RespuestaTicket(db.Model):
    __tablename__ = "RESPUESTA_TICKET"
    __table_args__ = (
        db.Index(
            "IX_RESPUESTA_TICKET_ticket_fecha", "ticketId", "fechaCreacion"
        ),
        db.CheckConstraint(
            "LEN(LTRIM(RTRIM(mensaje))) > 0",
            name="CK_RESPUESTA_TICKET_mensaje",
        ),
    )

    idRespuesta = db.Column(db.Integer, primary_key=True)
    ticketId = db.Column(
        db.Integer,
        db.ForeignKey("TICKET.idTicket", ondelete="NO ACTION"),
        nullable=False,
    )
    usuarioId = db.Column(
        db.Integer,
        db.ForeignKey("USUARIO.idUsuario", ondelete="NO ACTION"),
        nullable=False,
    )
    mensaje = db.Column(db.Unicode(3000), nullable=False)
    fechaCreacion = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    esInterna = db.Column(db.Boolean, nullable=False, server_default=db.text("0"))


class AsignacionTicket(db.Model):
    __tablename__ = "ASIGNACION_TICKET"
    __table_args__ = (
        db.Index(
            "IX_ASIGNACION_TICKET_trabajador", "trabajadorId", "esActual"
        ),
        db.Index(
            "UX_ASIGNACION_TICKET_actual",
            "ticketId",
            unique=True,
            mssql_where=db.text("esActual = 1"),
        ),
        db.CheckConstraint(
            "(esActual = 1 AND fechaFin IS NULL) OR esActual = 0",
            name="CK_ASIGNACION_TICKET_actual",
        ),
        db.CheckConstraint(
            "fechaFin IS NULL OR fechaFin >= fechaInicio",
            name="CK_ASIGNACION_TICKET_fechas",
        ),
    )

    idAsignacion = db.Column(db.Integer, primary_key=True)
    ticketId = db.Column(
        db.Integer,
        db.ForeignKey("TICKET.idTicket", ondelete="NO ACTION"),
        nullable=False,
    )
    trabajadorId = db.Column(
        db.Integer,
        db.ForeignKey("USUARIO.idUsuario", ondelete="NO ACTION"),
        nullable=False,
    )
    fechaInicio = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaFin = db.Column(DATETIME2)
    esActual = db.Column(db.Boolean, nullable=False, server_default=db.text("1"))
    observaciones = db.Column(db.Unicode(500))
