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
    )

    idTicket = db.Column(db.Integer, primary_key=True)
    usuarioId = db.Column(
        db.Integer, db.ForeignKey("USUARIO.idUsuario"), nullable=False
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
    )

    idRespuesta = db.Column(db.Integer, primary_key=True)
    ticketId = db.Column(
        db.Integer, db.ForeignKey("TICKET.idTicket"), nullable=False
    )
    usuarioId = db.Column(
        db.Integer, db.ForeignKey("USUARIO.idUsuario"), nullable=False
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
    )

    idAsignacion = db.Column(db.Integer, primary_key=True)
    ticketId = db.Column(
        db.Integer, db.ForeignKey("TICKET.idTicket"), nullable=False
    )
    trabajadorId = db.Column(
        db.Integer, db.ForeignKey("USUARIO.idUsuario"), nullable=False
    )
    fechaInicio = db.Column(
        DATETIME2, nullable=False, server_default=db.func.sysutcdatetime()
    )
    fechaFin = db.Column(DATETIME2)
    esActual = db.Column(db.Boolean, nullable=False, server_default=db.text("1"))
    observaciones = db.Column(db.Unicode(500))
