-- ==========================================================
-- FinanzApp — Migracion TG-290 (HU-09.3 / BD)
-- Baja logica de reportes de ayuda propios.
-- Idempotente: solo reemplaza el CHECK si aun no acepta ELIMINADO.
-- ==========================================================

IF EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = 'CK_TICKET_estado'
      AND OBJECT_NAME(parent_object_id) = 'TICKET'
      AND definition NOT LIKE '%ELIMINADO%'
)
BEGIN
    ALTER TABLE dbo.TICKET DROP CONSTRAINT CK_TICKET_estado;
END;
GO

IF OBJECT_ID('CK_TICKET_estado', 'C') IS NULL
    ALTER TABLE dbo.TICKET ADD CONSTRAINT CK_TICKET_estado
        CHECK (estado IN (
            'ABIERTO', 'EN_PROCESO', 'ESPERA', 'RESUELTO', 'CERRADO',
            'ELIMINADO'
        ));
GO
