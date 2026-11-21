-- ==========================================================
-- FinanzApp — Migración TG-211 (HU-12.x / BD)
-- Soporte de tickets, respuestas y asignaciones.
-- Idempotente por bloques: cada paso verifica antes de aplicar.
-- ==========================================================

IF OBJECT_ID('dbo.TICKET', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TICKET (
        idTicket INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_TICKET PRIMARY KEY,
        usuarioId INT NOT NULL,
        asunto NVARCHAR(150) NOT NULL,
        descripcion NVARCHAR(3000) NOT NULL,
        categoria VARCHAR(30) NOT NULL
            CONSTRAINT DF_TICKET_categoria DEFAULT 'GENERAL',
        prioridad VARCHAR(10) NOT NULL
            CONSTRAINT DF_TICKET_prioridad DEFAULT 'MEDIA',
        estado VARCHAR(15) NOT NULL
            CONSTRAINT DF_TICKET_estado DEFAULT 'ABIERTO',
        fechaCreacion DATETIME2 NOT NULL
            CONSTRAINT DF_TICKET_fecha DEFAULT SYSUTCDATETIME(),
        fechaActualizacion DATETIME2 NULL,
        fechaCierre DATETIME2 NULL,
        CONSTRAINT FK_TICKET_USUARIO FOREIGN KEY (usuarioId)
            REFERENCES dbo.USUARIO (idUsuario) ON DELETE NO ACTION,
        CONSTRAINT CK_TICKET_asunto
            CHECK (LEN(LTRIM(RTRIM(asunto))) > 0),
        CONSTRAINT CK_TICKET_descripcion
            CHECK (LEN(LTRIM(RTRIM(descripcion))) > 0),
        CONSTRAINT CK_TICKET_categoria
            CHECK (categoria IN
                ('GENERAL', 'CUENTA', 'CARTERA', 'PAGOS', 'ERROR', 'OTRO')),
        CONSTRAINT CK_TICKET_prioridad
            CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')),
        CONSTRAINT CK_TICKET_estado
            CHECK (estado IN
                ('ABIERTO', 'EN_PROCESO', 'ESPERA', 'RESUELTO', 'CERRADO')),
        CONSTRAINT CK_TICKET_cierre
            CHECK (fechaCierre IS NULL OR fechaCierre >= fechaCreacion)
    );
    PRINT 'TICKET creado.';
END;
GO

IF OBJECT_ID('dbo.RESPUESTA_TICKET', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.RESPUESTA_TICKET (
        idRespuesta INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_RESPUESTA_TICKET PRIMARY KEY,
        ticketId INT NOT NULL,
        usuarioId INT NOT NULL,
        mensaje NVARCHAR(3000) NOT NULL,
        fechaCreacion DATETIME2 NOT NULL
            CONSTRAINT DF_RESPUESTA_TICKET_fecha DEFAULT SYSUTCDATETIME(),
        esInterna BIT NOT NULL
            CONSTRAINT DF_RESPUESTA_TICKET_interna DEFAULT 0,
        CONSTRAINT FK_RESPUESTA_TICKET_TICKET FOREIGN KEY (ticketId)
            REFERENCES dbo.TICKET (idTicket) ON DELETE NO ACTION,
        CONSTRAINT FK_RESPUESTA_TICKET_USUARIO FOREIGN KEY (usuarioId)
            REFERENCES dbo.USUARIO (idUsuario) ON DELETE NO ACTION,
        CONSTRAINT CK_RESPUESTA_TICKET_mensaje
            CHECK (LEN(LTRIM(RTRIM(mensaje))) > 0)
    );
    PRINT 'RESPUESTA_TICKET creado.';
END;
GO

IF OBJECT_ID('dbo.ASIGNACION_TICKET', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ASIGNACION_TICKET (
        idAsignacion INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_ASIGNACION_TICKET PRIMARY KEY,
        ticketId INT NOT NULL,
        trabajadorId INT NOT NULL,
        fechaInicio DATETIME2 NOT NULL
            CONSTRAINT DF_ASIGNACION_TICKET_inicio DEFAULT SYSUTCDATETIME(),
        fechaFin DATETIME2 NULL,
        esActual BIT NOT NULL
            CONSTRAINT DF_ASIGNACION_TICKET_actual DEFAULT 1,
        observaciones NVARCHAR(500) NULL,
        CONSTRAINT FK_ASIGNACION_TICKET_TICKET FOREIGN KEY (ticketId)
            REFERENCES dbo.TICKET (idTicket) ON DELETE NO ACTION,
        CONSTRAINT FK_ASIGNACION_TICKET_TRABAJADOR FOREIGN KEY (trabajadorId)
            REFERENCES dbo.USUARIO (idUsuario) ON DELETE NO ACTION,
        CONSTRAINT CK_ASIGNACION_TICKET_actual
            CHECK ((esActual = 1 AND fechaFin IS NULL) OR esActual = 0),
        CONSTRAINT CK_ASIGNACION_TICKET_fechas
            CHECK (fechaFin IS NULL OR fechaFin >= fechaInicio)
    );
    PRINT 'ASIGNACION_TICKET creado.';
END;
GO

-- ----------------------------------------------------------
-- 1) Checks faltantes: TICKET
-- ----------------------------------------------------------
IF OBJECT_ID('CK_TICKET_asunto', 'C') IS NULL
    ALTER TABLE dbo.TICKET ADD CONSTRAINT CK_TICKET_asunto
        CHECK (LEN(LTRIM(RTRIM(asunto))) > 0);
GO

IF OBJECT_ID('CK_TICKET_descripcion', 'C') IS NULL
    ALTER TABLE dbo.TICKET ADD CONSTRAINT CK_TICKET_descripcion
        CHECK (LEN(LTRIM(RTRIM(descripcion))) > 0);
GO

IF OBJECT_ID('CK_TICKET_categoria', 'C') IS NULL
    ALTER TABLE dbo.TICKET ADD CONSTRAINT CK_TICKET_categoria
        CHECK (categoria IN
            ('GENERAL', 'CUENTA', 'CARTERA', 'PAGOS', 'ERROR', 'OTRO'));
GO

IF OBJECT_ID('CK_TICKET_prioridad', 'C') IS NULL
    ALTER TABLE dbo.TICKET ADD CONSTRAINT CK_TICKET_prioridad
        CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE'));
GO

IF OBJECT_ID('CK_TICKET_estado', 'C') IS NULL
    ALTER TABLE dbo.TICKET ADD CONSTRAINT CK_TICKET_estado
        CHECK (estado IN
            ('ABIERTO', 'EN_PROCESO', 'ESPERA', 'RESUELTO', 'CERRADO'));
GO

IF OBJECT_ID('CK_TICKET_cierre', 'C') IS NULL
    ALTER TABLE dbo.TICKET ADD CONSTRAINT CK_TICKET_cierre
        CHECK (fechaCierre IS NULL OR fechaCierre >= fechaCreacion);
GO

-- ----------------------------------------------------------
-- 2) Checks faltantes: RESPUESTA_TICKET y ASIGNACION_TICKET
-- ----------------------------------------------------------
IF OBJECT_ID('CK_RESPUESTA_TICKET_mensaje', 'C') IS NULL
    ALTER TABLE dbo.RESPUESTA_TICKET ADD CONSTRAINT CK_RESPUESTA_TICKET_mensaje
        CHECK (LEN(LTRIM(RTRIM(mensaje))) > 0);
GO

IF OBJECT_ID('CK_ASIGNACION_TICKET_actual', 'C') IS NULL
    ALTER TABLE dbo.ASIGNACION_TICKET ADD CONSTRAINT CK_ASIGNACION_TICKET_actual
        CHECK ((esActual = 1 AND fechaFin IS NULL) OR esActual = 0);
GO

IF OBJECT_ID('CK_ASIGNACION_TICKET_fechas', 'C') IS NULL
    ALTER TABLE dbo.ASIGNACION_TICKET ADD CONSTRAINT CK_ASIGNACION_TICKET_fechas
        CHECK (fechaFin IS NULL OR fechaFin >= fechaInicio);
GO

-- ----------------------------------------------------------
-- 3) FK sin CASCADE: la baja es lógica, nunca DELETE físico.
-- ----------------------------------------------------------
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_RESPUESTA_TICKET_TICKET'
      AND delete_referential_action <> 0
)
BEGIN
    ALTER TABLE dbo.RESPUESTA_TICKET DROP CONSTRAINT FK_RESPUESTA_TICKET_TICKET;
    ALTER TABLE dbo.RESPUESTA_TICKET ADD CONSTRAINT FK_RESPUESTA_TICKET_TICKET
        FOREIGN KEY (ticketId) REFERENCES dbo.TICKET (idTicket)
        ON DELETE NO ACTION;
END;
GO

IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_ASIGNACION_TICKET_TICKET'
      AND delete_referential_action <> 0
)
BEGIN
    ALTER TABLE dbo.ASIGNACION_TICKET DROP CONSTRAINT FK_ASIGNACION_TICKET_TICKET;
    ALTER TABLE dbo.ASIGNACION_TICKET ADD CONSTRAINT FK_ASIGNACION_TICKET_TICKET
        FOREIGN KEY (ticketId) REFERENCES dbo.TICKET (idTicket)
        ON DELETE NO ACTION;
END;
GO

-- ----------------------------------------------------------
-- 4) Índices
-- ----------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_TICKET_estado_prioridad'
      AND object_id = OBJECT_ID('dbo.TICKET')
)
    CREATE INDEX IX_TICKET_estado_prioridad
        ON dbo.TICKET (estado, prioridad, fechaCreacion);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_TICKET_usuario_fecha'
      AND object_id = OBJECT_ID('dbo.TICKET')
)
    CREATE INDEX IX_TICKET_usuario_fecha
        ON dbo.TICKET (usuarioId, fechaCreacion);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_RESPUESTA_TICKET_ticket_fecha'
      AND object_id = OBJECT_ID('dbo.RESPUESTA_TICKET')
)
    CREATE INDEX IX_RESPUESTA_TICKET_ticket_fecha
        ON dbo.RESPUESTA_TICKET (ticketId, fechaCreacion);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_ASIGNACION_TICKET_trabajador'
      AND object_id = OBJECT_ID('dbo.ASIGNACION_TICKET')
)
    CREATE INDEX IX_ASIGNACION_TICKET_trabajador
        ON dbo.ASIGNACION_TICKET (trabajadorId, esActual);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_ASIGNACION_TICKET_actual'
      AND object_id = OBJECT_ID('dbo.ASIGNACION_TICKET')
)
    CREATE UNIQUE INDEX UX_ASIGNACION_TICKET_actual
        ON dbo.ASIGNACION_TICKET (ticketId)
        WHERE esActual = 1;
GO
