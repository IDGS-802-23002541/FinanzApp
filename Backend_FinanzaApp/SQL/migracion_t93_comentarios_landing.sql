-- ==========================================================
-- FinanzApp — Migración T#93 (HU-01.3)
-- Agrega ip a dbo.COMENTARIO_LANDING para el límite anti-spam
-- del alta de comentarios de la landing.
-- Idempotente por bloques: cada paso verifica antes de aplicar.
-- ==========================================================

IF COL_LENGTH('dbo.COMENTARIO_LANDING', 'ip') IS NULL
    ALTER TABLE dbo.COMENTARIO_LANDING ADD ip NVARCHAR(45) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_COMENTARIO_LANDING_ip_fecha'
      AND object_id = OBJECT_ID('dbo.COMENTARIO_LANDING')
)
    CREATE INDEX IX_COMENTARIO_LANDING_ip_fecha
        ON dbo.COMENTARIO_LANDING (ip, fechaCreacion);
GO
