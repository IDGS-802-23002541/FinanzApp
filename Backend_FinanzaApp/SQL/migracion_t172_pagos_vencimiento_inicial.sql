-- ==========================================================
-- FinanzApp — Migracion TG-172 (HU-07.3 / BD)
-- Corrige el primer vencimiento de los pagos recurrentes.
-- El proximo vencimiento debe ser fechaInicio + periodos ya pagados.
-- Idempotente: recalcula el mismo valor si se ejecuta de nuevo.
-- ==========================================================

UPDATE p
SET p.proximaEjecucion = CASE p.frecuencia
    WHEN 'DIARIO'  THEN DATEADD(day, e.total, p.fechaInicio)
    WHEN 'SEMANAL' THEN DATEADD(week, e.total, p.fechaInicio)
    WHEN 'MENSUAL' THEN DATEADD(month, e.total, p.fechaInicio)
    WHEN 'ANUAL'   THEN DATEADD(year, e.total, p.fechaInicio)
    ELSE p.proximaEjecucion
END
FROM dbo.PAGOS_RECURRENTES p
CROSS APPLY (
    SELECT COUNT(*) AS total
    FROM dbo.PAGOS_REC_EJECUCIONES e
    WHERE e.pagoRecurrenteId = p.idPagoRecurrente
) e
WHERE p.estado <> 'CANCELADO';
GO
