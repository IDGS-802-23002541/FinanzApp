-- ==========================================================
-- FinanzApp — Migración T#72 (HU-11.1)
-- Marca para los trabajadores creados con contraseña temporal.
-- Idempotente por bloques: verifica antes de crear.
-- ==========================================================

IF COL_LENGTH('dbo.USUARIO', 'debeCambiarContrasenia') IS NULL
BEGIN
    ALTER TABLE dbo.USUARIO
        ADD debeCambiarContrasenia BIT NOT NULL
        CONSTRAINT DF_USUARIO_debeCambiarContrasenia DEFAULT 0;
END;
GO
