-- ==========================================================
-- FinanzApp — Migración T#300 (HU-10.1)
-- Índices para los conteos de admin (clientes y trabajadores).
-- Idempotente por bloques: verifica antes de crear.
-- ==========================================================

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_USUARIO_rol_estado'
      AND object_id = OBJECT_ID('dbo.USUARIO')
)
    CREATE INDEX IX_USUARIO_rol_estado
        ON dbo.USUARIO (rolGlobal, estado);
GO