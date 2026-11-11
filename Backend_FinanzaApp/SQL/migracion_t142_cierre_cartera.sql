-- ==========================================================
-- FinanzApp — Migración TG-142 (HU-04.6 / BD)
-- Soporte del estatus FINALIZADA y de las consultas de balance
-- (total, por categoría y por participante).
-- Idempotente por bloques: cada paso verifica antes de aplicar.
-- ==========================================================

-- ----------------------------------------------------------
-- 1) Fecha de cierre de la cartera
-- ----------------------------------------------------------
IF COL_LENGTH('dbo.CARTERA', 'fechaCierre') IS NULL
    ALTER TABLE dbo.CARTERA ADD fechaCierre DATETIME2 NULL;
GO

-- ----------------------------------------------------------
-- 2) Homologar el CHECK de estado para aceptar FINALIZADA
-- ----------------------------------------------------------
IF EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = 'CK_CARTERA_estado'
      AND OBJECT_NAME(parent_object_id) = 'CARTERA'
      AND definition NOT LIKE '%FINALIZADA%'
)
BEGIN
    ALTER TABLE dbo.CARTERA DROP CONSTRAINT CK_CARTERA_estado;
END;
GO

IF OBJECT_ID('CK_CARTERA_estado', 'C') IS NULL
    ALTER TABLE dbo.CARTERA ADD CONSTRAINT CK_CARTERA_estado
        CHECK (estado IN ('ACTIVA', 'ARCHIVADA', 'FINALIZADA'));
GO

-- ----------------------------------------------------------
-- 3) Índices para las consultas de balance
--     Balance por categoría:  carteraId + estado + tipo + categoriaId
--     Balance por participante: carteraId + estado + usuarioId
-- ----------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_TRANSACCIONES_cartera_estado_usuario'
      AND object_id = OBJECT_ID('dbo.TRANSACCIONES')
)
    CREATE INDEX IX_TRANSACCIONES_cartera_estado_usuario
        ON dbo.TRANSACCIONES (carteraId, estado, usuarioId);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_TRANSACCIONES_cartera_estado_categoria'
      AND object_id = OBJECT_ID('dbo.TRANSACCIONES')
)
    CREATE INDEX IX_TRANSACCIONES_cartera_estado_categoria
        ON dbo.TRANSACCIONES (carteraId, estado, categoriaId);
GO

-- ----------------------------------------------------------
-- 4) Consultas de referencia (implementadas en el servicio de
--    backend con SQLAlchemy; se dejan aquí documentadas)
-- ----------------------------------------------------------
-- Total de la cartera:
--   SELECT SUM(CASE WHEN tipo = 'INGRESO' THEN monto ELSE 0 END) AS ingresos,
--          SUM(CASE WHEN tipo = 'GASTO'   THEN monto ELSE 0 END) AS gastos
--   FROM dbo.TRANSACCIONES
--   WHERE carteraId = @idCartera AND estado = 'ACTIVO';
--
-- Balance por categoría (solo gastos):
--   SELECT categoriaId, SUM(monto) AS total
--   FROM dbo.TRANSACCIONES
--   WHERE carteraId = @idCartera AND estado = 'ACTIVO' AND tipo = 'GASTO'
--   GROUP BY categoriaId;
--
-- Balance por participante:
--   SELECT usuarioId,
--          SUM(CASE WHEN tipo = 'INGRESO' THEN monto ELSE 0 END) AS ingresos,
--          SUM(CASE WHEN tipo = 'GASTO'   THEN monto ELSE 0 END) AS gastos
--   FROM dbo.TRANSACCIONES
--   WHERE carteraId = @idCartera AND estado = 'ACTIVO'
--   GROUP BY usuarioId;
