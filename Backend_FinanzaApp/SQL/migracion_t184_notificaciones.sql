-- ==========================================================
-- FinanzApp — Migración TG-184 (HU-08.3 / BD)
-- Soporte de notificaciones y preferencias independientes.
-- Idempotente por bloques: cada paso verifica antes de aplicar.
-- ==========================================================

-- ----------------------------------------------------------
-- 1) Tabla NOTIFICACION (si no existe)
-- ----------------------------------------------------------
IF OBJECT_ID('dbo.NOTIFICACION', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.NOTIFICACION (
        idNotificacion BIGINT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_NOTIFICACION PRIMARY KEY,
        usuarioId INT NOT NULL,
        titulo NVARCHAR(150) NOT NULL,
        mensaje NVARCHAR(1000) NOT NULL,
        tipo VARCHAR(30) NULL,
        fechaCreacion DATETIME2 NOT NULL
            CONSTRAINT DF_NOTIFICACION_fecha DEFAULT SYSUTCDATETIME(),
        fechaLectura DATETIME2 NULL,
        CONSTRAINT FK_NOTIFICACION_USUARIO FOREIGN KEY (usuarioId)
            REFERENCES dbo.USUARIO (idUsuario) ON DELETE NO ACTION,
        CONSTRAINT CK_NOTIFICACION_titulo
            CHECK (LEN(LTRIM(RTRIM(titulo))) > 0),
        CONSTRAINT CK_NOTIFICACION_mensaje
            CHECK (LEN(LTRIM(RTRIM(mensaje))) > 0)
    );
    PRINT 'NOTIFICACION creado.';
END;
GO

IF OBJECT_ID('CK_NOTIFICACION_titulo', 'C') IS NULL
    ALTER TABLE dbo.NOTIFICACION ADD CONSTRAINT CK_NOTIFICACION_titulo
        CHECK (LEN(LTRIM(RTRIM(titulo))) > 0);
GO

IF OBJECT_ID('CK_NOTIFICACION_mensaje', 'C') IS NULL
    ALTER TABLE dbo.NOTIFICACION ADD CONSTRAINT CK_NOTIFICACION_mensaje
        CHECK (LEN(LTRIM(RTRIM(mensaje))) > 0);
GO

-- FK sin CASCADE: la baja de usuarios es lógica, nunca DELETE físico.
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_NOTIFICACION_USUARIO'
      AND delete_referential_action <> 0
)
BEGIN
    ALTER TABLE dbo.NOTIFICACION DROP CONSTRAINT FK_NOTIFICACION_USUARIO;
    ALTER TABLE dbo.NOTIFICACION ADD CONSTRAINT FK_NOTIFICACION_USUARIO
        FOREIGN KEY (usuarioId) REFERENCES dbo.USUARIO (idUsuario)
        ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_NOTIFICACION_usuario_fecha'
      AND object_id = OBJECT_ID('dbo.NOTIFICACION')
)
    CREATE INDEX IX_NOTIFICACION_usuario_fecha
        ON dbo.NOTIFICACION (usuarioId, fechaCreacion);
GO

-- ----------------------------------------------------------
-- 2) Interruptores de preferencias (movimientos, sistema, pagos)
-- ----------------------------------------------------------
IF COL_LENGTH('dbo.PREFERENCIAS_USUARIO', 'notificacionesMovimientos') IS NULL
    ALTER TABLE dbo.PREFERENCIAS_USUARIO
        ADD notificacionesMovimientos BIT NOT NULL
        CONSTRAINT DF_PREFERENCIAS_MOVIMIENTOS DEFAULT 1;
GO

IF COL_LENGTH('dbo.PREFERENCIAS_USUARIO', 'notificacionesSistema') IS NULL
    ALTER TABLE dbo.PREFERENCIAS_USUARIO
        ADD notificacionesSistema BIT NOT NULL
        CONSTRAINT DF_PREFERENCIAS_SISTEMA DEFAULT 1;
GO

IF COL_LENGTH('dbo.PREFERENCIAS_USUARIO', 'notificacionesPagos') IS NULL
    ALTER TABLE dbo.PREFERENCIAS_USUARIO
        ADD notificacionesPagos BIT NOT NULL
        CONSTRAINT DF_PREFERENCIAS_PAGOS DEFAULT 1;
GO

IF OBJECT_ID('CK_PREFERENCIAS_USUARIO_tema', 'C') IS NULL
    ALTER TABLE dbo.PREFERENCIAS_USUARIO ADD CONSTRAINT CK_PREFERENCIAS_USUARIO_tema
        CHECK (tema IN ('CLARO', 'OSCURO', 'SISTEMA'));
GO
