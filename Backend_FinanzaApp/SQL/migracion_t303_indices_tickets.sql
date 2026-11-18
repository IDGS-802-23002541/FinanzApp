-- ==========================================================
-- FinanzApp — Migración T#303 (HU-12.1)
-- Índices para el listado de tickets paginado por fecha.
-- Idempotente por bloques: verifica antes de crear.
-- ==========================================================

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_TICKET_estado_fecha'
      AND object_id = OBJECT_ID('dbo.TICKET')
)
    CREATE INDEX IX_TICKET_estado_fecha
        ON dbo.TICKET (estado, fechaCreacion DESC, idTicket DESC);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_TICKET_fecha'
      AND object_id = OBJECT_ID('dbo.TICKET')
)
    CREATE INDEX IX_TICKET_fecha
        ON dbo.TICKET (fechaCreacion DESC, idTicket DESC);
GO