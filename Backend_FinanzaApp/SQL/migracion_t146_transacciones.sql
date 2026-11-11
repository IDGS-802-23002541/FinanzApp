-- ==========================================================
-- FinanzApp — Migración T#146 (HU-05.1)
-- Agrega estado, metodoPago y comprobanteUrl a dbo.TRANSACCIONES.
-- Idempotente por bloques: cada paso verifica antes de aplicar.
-- ==========================================================

IF COL_LENGTH('dbo.TRANSACCIONES', 'metodoPago') IS NULL
    ALTER TABLE dbo.TRANSACCIONES ADD metodoPago VARCHAR(15) NULL;
GO

IF COL_LENGTH('dbo.TRANSACCIONES', 'comprobanteUrl') IS NULL
    ALTER TABLE dbo.TRANSACCIONES ADD comprobanteUrl NVARCHAR(500) NULL;
GO

IF COL_LENGTH('dbo.TRANSACCIONES', 'estado') IS NULL
    ALTER TABLE dbo.TRANSACCIONES
        ADD estado VARCHAR(10) NOT NULL CONSTRAINT DF_TRANSACCIONES_estado DEFAULT 'ACTIVO';
GO

IF OBJECT_ID('CK_TRANSACCIONES_estado', 'C') IS NULL
    ALTER TABLE dbo.TRANSACCIONES ADD CONSTRAINT CK_TRANSACCIONES_estado
        CHECK (estado IN ('ACTIVO', 'ELIMINADO'));
GO

IF OBJECT_ID('CK_TRANSACCIONES_metodo_pago', 'C') IS NULL
    ALTER TABLE dbo.TRANSACCIONES ADD CONSTRAINT CK_TRANSACCIONES_metodo_pago
        CHECK (metodoPago IS NULL
            OR metodoPago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA'));
GO

-- FK sin CASCADE: la baja de carteras es lógica, nunca DELETE físico.
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_TRANSACCIONES_CARTERA'
      AND delete_referential_action <> 0
)
BEGIN
    ALTER TABLE dbo.TRANSACCIONES DROP CONSTRAINT FK_TRANSACCIONES_CARTERA;
    ALTER TABLE dbo.TRANSACCIONES ADD CONSTRAINT FK_TRANSACCIONES_CARTERA
        FOREIGN KEY (carteraId) REFERENCES dbo.CARTERA (idCartera)
        ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_TRANSACCIONES_cartera_estado'
      AND object_id = OBJECT_ID('dbo.TRANSACCIONES')
)
    CREATE INDEX IX_TRANSACCIONES_cartera_estado
        ON dbo.TRANSACCIONES (carteraId, estado);
GO
