-- ==========================================================
-- FinanzApp — Migración TG-93 (HU-01.3 / BD)
-- Soporte de los comentarios enviados desde la landing.
-- Idempotente por bloques: cada paso verifica antes de aplicar.
-- ==========================================================

IF OBJECT_ID('dbo.COMENTARIO_LANDING', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.COMENTARIO_LANDING (
        idComentario INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_COMENTARIO_LANDING PRIMARY KEY,
        nombre NVARCHAR(120) NOT NULL,
        correo NVARCHAR(254) NULL,
        comentario NVARCHAR(2000) NOT NULL,
        fechaCreacion DATETIME2 NOT NULL
            CONSTRAINT DF_COMENTARIO_LANDING_fecha DEFAULT SYSUTCDATETIME(),
        estado VARCHAR(12) NOT NULL
            CONSTRAINT DF_COMENTARIO_LANDING_estado DEFAULT 'PENDIENTE',
        CONSTRAINT CK_COMENTARIO_LANDING_nombre
            CHECK (LEN(LTRIM(RTRIM(nombre))) > 0),
        CONSTRAINT CK_COMENTARIO_LANDING_comentario
            CHECK (LEN(LTRIM(RTRIM(comentario))) > 0),
        CONSTRAINT CK_COMENTARIO_LANDING_estado
            CHECK (estado IN ('PENDIENTE', 'PUBLICADO', 'OCULTO'))
    );
    PRINT 'COMENTARIO_LANDING creado.';
END;
GO

IF OBJECT_ID('CK_COMENTARIO_LANDING_estado', 'C') IS NULL
    ALTER TABLE dbo.COMENTARIO_LANDING ADD CONSTRAINT CK_COMENTARIO_LANDING_estado
        CHECK (estado IN ('PENDIENTE', 'PUBLICADO', 'OCULTO'));
GO

IF OBJECT_ID('CK_COMENTARIO_LANDING_nombre', 'C') IS NULL
    ALTER TABLE dbo.COMENTARIO_LANDING ADD CONSTRAINT CK_COMENTARIO_LANDING_nombre
        CHECK (LEN(LTRIM(RTRIM(nombre))) > 0);
GO

IF OBJECT_ID('CK_COMENTARIO_LANDING_comentario', 'C') IS NULL
    ALTER TABLE dbo.COMENTARIO_LANDING ADD CONSTRAINT CK_COMENTARIO_LANDING_comentario
        CHECK (LEN(LTRIM(RTRIM(comentario))) > 0);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_COMENTARIO_LANDING_estado_fecha'
      AND object_id = OBJECT_ID('dbo.COMENTARIO_LANDING')
)
    CREATE INDEX IX_COMENTARIO_LANDING_estado_fecha
        ON dbo.COMENTARIO_LANDING (estado, fechaCreacion);
GO
