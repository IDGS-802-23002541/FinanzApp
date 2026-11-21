-- ==========================================================
-- FinanzApp — Migración TG-169 (HU-07.1 / BD)
-- Soporte de pagos recurrentes y sus ejecuciones por periodo.
-- Idempotente por bloques: cada paso verifica antes de aplicar.
-- ==========================================================

IF OBJECT_ID('dbo.PAGOS_RECURRENTES', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PAGOS_RECURRENTES (
        idPagoRecurrente INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_PAGOS_RECURRENTES PRIMARY KEY,
        carteraId INT NOT NULL,
        usuarioId INT NOT NULL,
        categoriaId INT NULL,
        nombre NVARCHAR(120) NOT NULL,
        descripcion NVARCHAR(500) NULL,
        monto DECIMAL(12, 2) NOT NULL,
        frecuencia VARCHAR(12) NOT NULL,
        fechaInicio DATE NOT NULL,
        fechaFin DATE NULL,
        proximaEjecucion DATE NOT NULL,
        estado VARCHAR(12) NOT NULL
            CONSTRAINT DF_PAGOS_RECURRENTES_estado DEFAULT 'ACTIVO',
        fechaCreacion DATETIME2 NOT NULL
            CONSTRAINT DF_PAGOS_RECURRENTES_fecha DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_PAGOS_RECURRENTES_CARTERA FOREIGN KEY (carteraId)
            REFERENCES dbo.CARTERA (idCartera) ON DELETE NO ACTION,
        CONSTRAINT FK_PAGOS_RECURRENTES_CATEGORIA FOREIGN KEY (categoriaId)
            REFERENCES dbo.CATEGORIAS (idCategoria) ON DELETE NO ACTION,
        CONSTRAINT FK_PAGOS_RECURRENTES_MIEMBRO
            FOREIGN KEY (carteraId, usuarioId)
            REFERENCES dbo.MIEMBROS_CARTERA (carteraId, usuarioId)
            ON DELETE NO ACTION,
        CONSTRAINT CK_PAGOS_RECURRENTES_monto CHECK (monto > 0),
        CONSTRAINT CK_PAGOS_RECURRENTES_frecuencia
            CHECK (frecuencia IN ('DIARIO', 'SEMANAL', 'MENSUAL', 'ANUAL')),
        CONSTRAINT CK_PAGOS_RECURRENTES_estado
            CHECK (estado IN ('ACTIVO', 'PAUSADO', 'CANCELADO')),
        CONSTRAINT CK_PAGOS_RECURRENTES_fechas
            CHECK (fechaFin IS NULL OR fechaFin >= fechaInicio)
    );
    PRINT 'PAGOS_RECURRENTES creado.';
END;
GO

IF OBJECT_ID('dbo.PAGOS_REC_EJECUCIONES', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PAGOS_REC_EJECUCIONES (
        idEjecucion INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_PAGOS_REC_EJECUCIONES PRIMARY KEY,
        pagoRecurrenteId INT NOT NULL,
        transaccionId INT NULL,
        fechaProgramada DATE NOT NULL,
        fechaEjecucion DATETIME2 NULL,
        monto DECIMAL(12, 2) NOT NULL,
        estado VARCHAR(12) NOT NULL
            CONSTRAINT DF_PAGOS_REC_EJECUCIONES_estado DEFAULT 'PENDIENTE',
        mensajeError NVARCHAR(500) NULL,
        CONSTRAINT FK_PAGOS_REC_EJECUCIONES_PAGO
            FOREIGN KEY (pagoRecurrenteId)
            REFERENCES dbo.PAGOS_RECURRENTES (idPagoRecurrente)
            ON DELETE NO ACTION,
        CONSTRAINT FK_PAGOS_REC_EJECUCIONES_TRANSACCION
            FOREIGN KEY (transaccionId)
            REFERENCES dbo.TRANSACCIONES (idTransaccion)
            ON DELETE NO ACTION,
        CONSTRAINT UQ_PAGOS_REC_EJECUCIONES_fecha
            UNIQUE (pagoRecurrenteId, fechaProgramada),
        CONSTRAINT CK_PAGOS_REC_EJECUCIONES_monto CHECK (monto > 0),
        CONSTRAINT CK_PAGOS_REC_EJECUCIONES_estado
            CHECK (estado IN ('PENDIENTE', 'EJECUTADO', 'FALLIDO', 'OMITIDO'))
    );
    PRINT 'PAGOS_REC_EJECUCIONES creado.';
END;
GO

-- ----------------------------------------------------------
-- 1) Checks faltantes en PAGOS_RECURRENTES
-- ----------------------------------------------------------
IF OBJECT_ID('CK_PAGOS_RECURRENTES_monto', 'C') IS NULL
    ALTER TABLE dbo.PAGOS_RECURRENTES ADD CONSTRAINT CK_PAGOS_RECURRENTES_monto
        CHECK (monto > 0);
GO

IF OBJECT_ID('CK_PAGOS_RECURRENTES_frecuencia', 'C') IS NULL
    ALTER TABLE dbo.PAGOS_RECURRENTES ADD CONSTRAINT CK_PAGOS_RECURRENTES_frecuencia
        CHECK (frecuencia IN ('DIARIO', 'SEMANAL', 'MENSUAL', 'ANUAL'));
GO

IF OBJECT_ID('CK_PAGOS_RECURRENTES_estado', 'C') IS NULL
    ALTER TABLE dbo.PAGOS_RECURRENTES ADD CONSTRAINT CK_PAGOS_RECURRENTES_estado
        CHECK (estado IN ('ACTIVO', 'PAUSADO', 'CANCELADO'));
GO

IF OBJECT_ID('CK_PAGOS_RECURRENTES_fechas', 'C') IS NULL
    ALTER TABLE dbo.PAGOS_RECURRENTES ADD CONSTRAINT CK_PAGOS_RECURRENTES_fechas
        CHECK (fechaFin IS NULL OR fechaFin >= fechaInicio);
GO

-- ----------------------------------------------------------
-- 2) Checks faltantes en PAGOS_REC_EJECUCIONES
-- ----------------------------------------------------------
IF OBJECT_ID('CK_PAGOS_REC_EJECUCIONES_monto', 'C') IS NULL
    ALTER TABLE dbo.PAGOS_REC_EJECUCIONES ADD CONSTRAINT CK_PAGOS_REC_EJECUCIONES_monto
        CHECK (monto > 0);
GO

IF OBJECT_ID('CK_PAGOS_REC_EJECUCIONES_estado', 'C') IS NULL
    ALTER TABLE dbo.PAGOS_REC_EJECUCIONES ADD CONSTRAINT CK_PAGOS_REC_EJECUCIONES_estado
        CHECK (estado IN ('PENDIENTE', 'EJECUTADO', 'FALLIDO', 'OMITIDO'));
GO

-- ----------------------------------------------------------
-- 3) FK sin CASCADE: la baja es lógica, nunca DELETE físico.
-- ----------------------------------------------------------
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_PAGOS_RECURRENTES_CARTERA'
      AND delete_referential_action <> 0
)
BEGIN
    ALTER TABLE dbo.PAGOS_RECURRENTES DROP CONSTRAINT FK_PAGOS_RECURRENTES_CARTERA;
    ALTER TABLE dbo.PAGOS_RECURRENTES ADD CONSTRAINT FK_PAGOS_RECURRENTES_CARTERA
        FOREIGN KEY (carteraId) REFERENCES dbo.CARTERA (idCartera)
        ON DELETE NO ACTION;
END;
GO

IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_PAGOS_REC_EJECUCIONES_PAGO'
      AND delete_referential_action <> 0
)
BEGIN
    ALTER TABLE dbo.PAGOS_REC_EJECUCIONES DROP CONSTRAINT FK_PAGOS_REC_EJECUCIONES_PAGO;
    ALTER TABLE dbo.PAGOS_REC_EJECUCIONES ADD CONSTRAINT FK_PAGOS_REC_EJECUCIONES_PAGO
        FOREIGN KEY (pagoRecurrenteId)
        REFERENCES dbo.PAGOS_RECURRENTES (idPagoRecurrente)
        ON DELETE NO ACTION;
END;
GO

-- ----------------------------------------------------------
-- 4) Índices
-- ----------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_PAGOS_RECURRENTES_proxima'
      AND object_id = OBJECT_ID('dbo.PAGOS_RECURRENTES')
)
    CREATE INDEX IX_PAGOS_RECURRENTES_proxima
        ON dbo.PAGOS_RECURRENTES (estado, proximaEjecucion);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UQ_PAGOS_REC_EJECUCIONES_fecha'
      AND object_id = OBJECT_ID('dbo.PAGOS_REC_EJECUCIONES')
)
    CREATE UNIQUE INDEX UQ_PAGOS_REC_EJECUCIONES_fecha
        ON dbo.PAGOS_REC_EJECUCIONES (pagoRecurrenteId, fechaProgramada);
GO
