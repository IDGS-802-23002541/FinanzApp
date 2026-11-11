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

-- FK sin CASCADE: la baja de carteras es lógica, nunca DELETE físico.
IF OBJECT_ID('FK_CATEGORIAS_CARTERA', 'F') IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM sys.foreign_keys
        WHERE name = 'FK_CATEGORIAS_CARTERA'
          AND delete_referential_action <> 0
    )
BEGIN
    ALTER TABLE dbo.CATEGORIAS DROP CONSTRAINT FK_CATEGORIAS_CARTERA;
    ALTER TABLE dbo.CATEGORIAS ADD CONSTRAINT FK_CATEGORIAS_CARTERA
        FOREIGN KEY (carteraId) REFERENCES dbo.CARTERA (idCartera)
        ON DELETE NO ACTION;
END;
GO

-- Rellena orden en filas existentes (0-9 según id) cuando aún están en el valor por defecto.
-- Idempotente: solo toca globales con orden = 0 y ninguna global con orden > 0.
IF COL_LENGTH('dbo.CATEGORIAS', 'orden') IS NOT NULL
    UPDATE dbo.CATEGORIAS SET orden = idCategoria - 1
    WHERE carteraId IS NULL
      AND orden = 0
      AND NOT EXISTS (
          SELECT 1 FROM dbo.CATEGORIAS c2
          WHERE c2.carteraId IS NULL AND c2.orden > 0
      );
GO
-- El índice global viejo era solo (nombre); el nuevo incluye tipoCartera.
-- Requiere que la columna tipoCartera exista (ver bloques ALTER arriba).
IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_CATEGORIAS_global_nombre'
      AND object_id = OBJECT_ID('dbo.CATEGORIAS')
      AND has_filter = 1
      AND COL_LENGTH('dbo.CATEGORIAS', 'tipoCartera') IS NOT NULL
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
      AND COL_LENGTH('dbo.CATEGORIAS', 'tipoCartera') IS NOT NULL
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
