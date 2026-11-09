-- ==========================================================
-- FinanzApp — Migración T#128 (HU-04.2)
-- FK de INVITACION a CARTERA sin CASCADE (baja lógica, nunca DELETE físico).
-- Idempotente: solo actúa si la FK aún tiene borrado en cascada.
-- ==========================================================

IF EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_INVITACION_CARTERA'
      AND delete_referential_action <> 0
)
BEGIN
    ALTER TABLE dbo.INVITACION DROP CONSTRAINT FK_INVITACION_CARTERA;
    ALTER TABLE dbo.INVITACION ADD CONSTRAINT FK_INVITACION_CARTERA
        FOREIGN KEY (carteraId) REFERENCES dbo.CARTERA (idCartera)
        ON DELETE NO ACTION;
END;
GO
