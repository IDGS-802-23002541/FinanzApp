-- ==========================================================
-- FinanzApp — Migración TG-232 (HU-04.6 / BD)
-- Soporte de PERIODO y homologación de constraints e índices
-- de CARTERA y MIEMBROS_CARTERA.
-- Idempotente por bloques: cada paso verifica antes de aplicar.
-- ==========================================================

-- ----------------------------------------------------------
-- 1) Tabla PERIODO (si no existe)
-- ----------------------------------------------------------
IF OBJECT_ID('dbo.PERIODO', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PERIODO (
        idPeriodo INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_PERIODO PRIMARY KEY,
        carteraId INT NOT NULL,
        nombre NVARCHAR(80) NOT NULL,
        fechaInicio DATE NOT NULL,
        fechaFin DATE NOT NULL,
        estado VARCHAR(12) NOT NULL
            CONSTRAINT DF_PERIODO_estado DEFAULT 'ACTIVO',
        fechaCreacion DATETIME2 NOT NULL
            CONSTRAINT DF_PERIODO_fechaCreacion DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_PERIODO_CARTERA FOREIGN KEY (carteraId)
            REFERENCES dbo.CARTERA (idCartera) ON DELETE NO ACTION,
        CONSTRAINT CK_PERIODO_fechas CHECK (fechaFin >= fechaInicio),
        CONSTRAINT CK_PERIODO_estado CHECK (estado IN ('ACTIVO', 'CERRADO'))
    );
    PRINT 'PERIODO creado.';
END;
GO

IF OBJECT_ID('CK_PERIODO_fechas', 'C') IS NULL
    ALTER TABLE dbo.PERIODO ADD CONSTRAINT CK_PERIODO_fechas
        CHECK (fechaFin >= fechaInicio);
GO

IF OBJECT_ID('CK_PERIODO_estado', 'C') IS NULL
    ALTER TABLE dbo.PERIODO ADD CONSTRAINT CK_PERIODO_estado
        CHECK (estado IN ('ACTIVO', 'CERRADO'));
GO

-- FK sin CASCADE: la baja de carteras es lógica, nunca DELETE físico.
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_PERIODO_CARTERA'
      AND delete_referential_action <> 0
)
BEGIN
    ALTER TABLE dbo.PERIODO DROP CONSTRAINT FK_PERIODO_CARTERA;
    ALTER TABLE dbo.PERIODO ADD CONSTRAINT FK_PERIODO_CARTERA
        FOREIGN KEY (carteraId) REFERENCES dbo.CARTERA (idCartera)
        ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_PERIODO_cartera_fechas'
      AND object_id = OBJECT_ID('dbo.PERIODO')
)
    CREATE INDEX IX_PERIODO_cartera_fechas
        ON dbo.PERIODO (carteraId, fechaInicio, fechaFin);
GO

-- ----------------------------------------------------------
-- 2) Verificación de constraints de CARTERA
-- ----------------------------------------------------------
IF OBJECT_ID('CK_CARTERA_nombre', 'C') IS NULL
    ALTER TABLE dbo.CARTERA ADD CONSTRAINT CK_CARTERA_nombre
        CHECK (LEN(LTRIM(RTRIM(nombre))) > 0);
GO

IF OBJECT_ID('CK_CARTERA_tipo', 'C') IS NULL
    ALTER TABLE dbo.CARTERA ADD CONSTRAINT CK_CARTERA_tipo
        CHECK (tipo IN ('HOGAR', 'VIAJE', 'EVENTO', 'OTRA'));
GO

IF OBJECT_ID('CK_CARTERA_estado', 'C') IS NULL
    ALTER TABLE dbo.CARTERA ADD CONSTRAINT CK_CARTERA_estado
        CHECK (estado IN ('ACTIVA', 'ARCHIVADA', 'FINALIZADA'));
GO

IF OBJECT_ID('CK_CARTERA_fechas', 'C') IS NULL
    ALTER TABLE dbo.CARTERA ADD CONSTRAINT CK_CARTERA_fechas
        CHECK (fechaInicio IS NULL OR fechaFin IS NULL OR fechaFin >= fechaInicio);
GO

IF OBJECT_ID('CK_CARTERA_presupuesto', 'C') IS NULL
    ALTER TABLE dbo.CARTERA ADD CONSTRAINT CK_CARTERA_presupuesto
        CHECK (presupuestoInicial IS NULL OR presupuestoInicial >= 0);
GO

-- ----------------------------------------------------------
-- 3) Verificación de constraints e índices de MIEMBROS_CARTERA
-- ----------------------------------------------------------
IF OBJECT_ID('CK_MIEMBROS_CARTERA_rol', 'C') IS NULL
    ALTER TABLE dbo.MIEMBROS_CARTERA ADD CONSTRAINT CK_MIEMBROS_CARTERA_rol
        CHECK (rol IN ('ADMIN', 'CONTRIBUYENTE'));
GO

IF OBJECT_ID('CK_MIEMBROS_CARTERA_estado', 'C') IS NULL
    ALTER TABLE dbo.MIEMBROS_CARTERA ADD CONSTRAINT CK_MIEMBROS_CARTERA_estado
        CHECK (estado IN ('ACTIVO', 'BAJA'));
GO

IF OBJECT_ID('CK_MIEMBROS_CARTERA_baja', 'C') IS NULL
    ALTER TABLE dbo.MIEMBROS_CARTERA ADD CONSTRAINT CK_MIEMBROS_CARTERA_baja
        CHECK ((estado = 'ACTIVO' AND fechaBaja IS NULL) OR estado = 'BAJA');
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_MIEMBROS_CARTERA_usuario'
      AND object_id = OBJECT_ID('dbo.MIEMBROS_CARTERA')
)
    CREATE INDEX IX_MIEMBROS_CARTERA_usuario
        ON dbo.MIEMBROS_CARTERA (usuarioId, estado);
GO

-- FK sin CASCADE: la baja de carteras es lógica, nunca DELETE físico.
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_MIEMBROS_CARTERA_CARTERA'
      AND delete_referential_action <> 0
)
BEGIN
    ALTER TABLE dbo.MIEMBROS_CARTERA DROP CONSTRAINT FK_MIEMBROS_CARTERA_CARTERA;
    ALTER TABLE dbo.MIEMBROS_CARTERA ADD CONSTRAINT FK_MIEMBROS_CARTERA_CARTERA
        FOREIGN KEY (carteraId) REFERENCES dbo.CARTERA (idCartera)
        ON DELETE NO ACTION;
END;
GO
