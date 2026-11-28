-- Agrega la frecuencia QUINCENAL a los pagos recurrentes (issue #354).
-- El CHECK anterior solo permitía DIARIO, SEMANAL, MENSUAL y ANUAL.
-- Se recrea para que las bases existentes acepten el valor nuevo.

IF OBJECT_ID('CK_PAGOS_RECURRENTES_frecuencia', 'C') IS NOT NULL
    ALTER TABLE dbo.PAGOS_RECURRENTES DROP CONSTRAINT CK_PAGOS_RECURRENTES_frecuencia;
GO

ALTER TABLE dbo.PAGOS_RECURRENTES ADD CONSTRAINT CK_PAGOS_RECURRENTES_frecuencia
    CHECK (frecuencia IN ('DIARIO', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'ANUAL'));
GO
