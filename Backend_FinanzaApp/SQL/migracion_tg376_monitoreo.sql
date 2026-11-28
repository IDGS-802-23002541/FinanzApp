-- ==========================================================
-- FinanzApp — Migración TG-376 (monitoreo)
-- Guarda una muestra por minuto de la sonda de disponibilidad.
-- Idempotente por bloques: cada paso verifica antes de aplicar.
-- ==========================================================

IF OBJECT_ID('dbo.MONITOREO_SONDA', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MONITOREO_SONDA (
        idSonda INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_MONITOREO_SONDA PRIMARY KEY,
        minuto DATETIME2(0) NOT NULL,
        fechaHora DATETIME2 NOT NULL
            CONSTRAINT DF_MONITOREO_SONDA_fecha DEFAULT SYSUTCDATETIME(),
        ok BIT NOT NULL,
        duracionMs FLOAT NOT NULL,
        base NVARCHAR(128) NULL,
        CONSTRAINT UQ_MONITOREO_SONDA_minuto UNIQUE (minuto)
    );
    PRINT 'MONITOREO_SONDA creado.';
END;
