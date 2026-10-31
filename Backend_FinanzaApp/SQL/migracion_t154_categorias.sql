-- ==========================================================
-- FinanzApp — Migración T#154 (HU-05.4)
-- Agrega tipoCartera y orden a dbo.CATEGORIAS.
-- Idempotente por bloques: cada paso verifica antes de aplicar.
-- ==========================================================

IF COL_LENGTH('dbo.CATEGORIAS', 'tipoCartera') IS NULL
    ALTER TABLE dbo.CATEGORIAS ADD tipoCartera VARCHAR(10) NULL;
GO

IF COL_LENGTH('dbo.CATEGORIAS', 'orden') IS NULL
    ALTER TABLE dbo.CATEGORIAS
        ADD orden INT NOT NULL CONSTRAINT DF_CATEGORIAS_orden DEFAULT 0;
GO

IF OBJECT_ID('CK_CATEGORIAS_tipo_cartera', 'C') IS NULL
    ALTER TABLE dbo.CATEGORIAS ADD CONSTRAINT CK_CATEGORIAS_tipo_cartera
        CHECK (tipoCartera IS NULL
            OR tipoCartera IN ('HOGAR', 'VIAJE', 'EVENTO', 'OTRA'));
GO

IF OBJECT_ID('CK_CATEGORIAS_global_o_personal', 'C') IS NULL
    ALTER TABLE dbo.CATEGORIAS ADD CONSTRAINT CK_CATEGORIAS_global_o_personal
        CHECK (carteraId IS NULL OR tipoCartera IS NULL);
GO

-- El índice global viejo era solo (nombre); el nuevo incluye tipoCartera.
IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_CATEGORIAS_global_nombre'
      AND object_id = OBJECT_ID('dbo.CATEGORIAS')
      AND has_filter = 1
)
BEGIN
    DECLARE @cols INT = (
        SELECT COUNT(*) FROM sys.index_columns
        WHERE object_id = OBJECT_ID('dbo.CATEGORIAS')
          AND index_id = (
              SELECT index_id FROM sys.indexes
              WHERE name = 'UX_CATEGORIAS_global_nombre'
                AND object_id = OBJECT_ID('dbo.CATEGORIAS')
          )
    );
    IF @cols = 1
        DROP INDEX UX_CATEGORIAS_global_nombre ON dbo.CATEGORIAS;
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_CATEGORIAS_global_nombre'
      AND object_id = OBJECT_ID('dbo.CATEGORIAS')
)
    CREATE UNIQUE INDEX UX_CATEGORIAS_global_nombre
        ON dbo.CATEGORIAS (nombre, tipoCartera)
        WHERE carteraId IS NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_CATEGORIAS_consulta'
      AND object_id = OBJECT_ID('dbo.CATEGORIAS')
)
    CREATE INDEX IX_CATEGORIAS_consulta
        ON dbo.CATEGORIAS (carteraId, estado, orden);
GO
