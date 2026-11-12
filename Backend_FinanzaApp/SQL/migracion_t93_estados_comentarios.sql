-- ==========================================================
-- FinanzApp — Migración TG-93 (ajuste de estados)
-- Homologa CK_COMENTARIO_LANDING_estado al flujo real del
-- buzón: PENDIENTE, ATENDIDO y ARCHIVADO.
-- Idempotente: solo actúa si el constraint aún tiene los
-- estados anteriores (PUBLICADO / OCULTO).
-- ==========================================================

IF EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = 'CK_COMENTARIO_LANDING_estado'
      AND OBJECT_NAME(parent_object_id) = 'COMENTARIO_LANDING'
      AND definition NOT LIKE '%ATENDIDO%'
)
BEGIN
    ALTER TABLE dbo.COMENTARIO_LANDING
        DROP CONSTRAINT CK_COMENTARIO_LANDING_estado;
END;
GO

-- Migra los registros existentes antes de volver a validar.
UPDATE dbo.COMENTARIO_LANDING SET estado = 'ATENDIDO'
WHERE estado = 'PUBLICADO';
GO

UPDATE dbo.COMENTARIO_LANDING SET estado = 'ARCHIVADO'
WHERE estado = 'OCULTO';
GO

IF OBJECT_ID('CK_COMENTARIO_LANDING_estado', 'C') IS NULL
    ALTER TABLE dbo.COMENTARIO_LANDING
        ADD CONSTRAINT CK_COMENTARIO_LANDING_estado
        CHECK (estado IN ('PENDIENTE', 'ATENDIDO', 'ARCHIVADO'));
GO
