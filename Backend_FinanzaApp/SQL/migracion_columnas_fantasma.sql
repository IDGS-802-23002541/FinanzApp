-- ==========================================================
-- FinanzApp — Limpieza de columnas fantasma
-- Elimina columnas y tabla que ningún módulo usa (verificado en
-- Backend_FinanzaApp, web_FinanzaApp y movil_FinanzaApp):
--   CARTERA.versionFila (concurrencia nunca cableada)
--   CATEGORIAS.esPredeterminada (derivable: carteraId IS NULL)
--   AHORRO (tabla entera; feature de ahorros jamás construida)
--   NOTIFICACION.fechaLectura (sin bandeja ni marcar-leída)
--   PAGOS_REC_EJECUCIONES.mensajeError (fallos nunca se persisten)
--   PREFERENCIAS_USUARIO.notificacionesCorreo (fuera del whitelist)
--   PREFERENCIAS_USUARIO.moneda (MXN único, sin selector)
--   SESIONES_USUARIO.reemplazadaPor (rotación nunca encadenada)
-- Idempotente por bloques: cada paso verifica antes de aplicar.
-- Ejecutar con BACKUP previo de la base. Requiere que el deploy
-- incluya los modelos sin estos atributos (misma rama).
-- ==========================================================

-- ----------------------------------------------------------
-- 0) Guardia: AHORRO debe estar vacía (nada la escribe, pero
-- si tuviera filas se aborta en vez de perder datos).
-- ----------------------------------------------------------
IF OBJECT_ID('dbo.AHORRO', 'U') IS NOT NULL
   AND EXISTS (SELECT 1 FROM dbo.AHORRO)
    THROW 50001, 'AHORRO tiene filas: abortar limpieza y revisar.', 1;
GO

-- ----------------------------------------------------------
-- 1) Tabla AHORRO (drop arrastra su FK e índice propios)
-- ----------------------------------------------------------
IF OBJECT_ID('dbo.AHORRO', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.AHORRO;
    PRINT 'AHORRO eliminada.';
END;
GO

-- ----------------------------------------------------------
-- 2) CARTERA.versionFila
-- ----------------------------------------------------------
IF COL_LENGTH('dbo.CARTERA', 'versionFila') IS NOT NULL
BEGIN
    ALTER TABLE dbo.CARTERA DROP COLUMN versionFila;
    PRINT 'CARTERA.versionFila eliminada.';
END;
GO

-- ----------------------------------------------------------
-- 3) CATEGORIAS.esPredeterminada (columna calculada)
-- ----------------------------------------------------------
IF COL_LENGTH('dbo.CATEGORIAS', 'esPredeterminada') IS NOT NULL
BEGIN
    ALTER TABLE dbo.CATEGORIAS DROP COLUMN esPredeterminada;
    PRINT 'CATEGORIAS.esPredeterminada eliminada.';
END;
GO

-- ----------------------------------------------------------
-- 4) NOTIFICACION.fechaLectura
-- ----------------------------------------------------------
IF COL_LENGTH('dbo.NOTIFICACION', 'fechaLectura') IS NOT NULL
BEGIN
    ALTER TABLE dbo.NOTIFICACION DROP COLUMN fechaLectura;
    PRINT 'NOTIFICACION.fechaLectura eliminada.';
END;
GO

-- ----------------------------------------------------------
-- 5) PAGOS_REC_EJECUCIONES.mensajeError
-- ----------------------------------------------------------
IF COL_LENGTH('dbo.PAGOS_REC_EJECUCIONES', 'mensajeError') IS NOT NULL
BEGIN
    ALTER TABLE dbo.PAGOS_REC_EJECUCIONES DROP COLUMN mensajeError;
    PRINT 'PAGOS_REC_EJECUCIONES.mensajeError eliminado.';
END;
GO

-- ----------------------------------------------------------
-- 6) PREFERENCIAS_USUARIO.notificacionesCorreo y moneda
-- ----------------------------------------------------------
IF COL_LENGTH('dbo.PREFERENCIAS_USUARIO', 'notificacionesCorreo') IS NOT NULL
BEGIN
    ALTER TABLE dbo.PREFERENCIAS_USUARIO DROP COLUMN notificacionesCorreo;
    PRINT 'PREFERENCIAS_USUARIO.notificacionesCorreo eliminada.';
END;
GO

IF COL_LENGTH('dbo.PREFERENCIAS_USUARIO', 'moneda') IS NOT NULL
BEGIN
    ALTER TABLE dbo.PREFERENCIAS_USUARIO DROP COLUMN moneda;
    PRINT 'PREFERENCIAS_USUARIO.moneda eliminada.';
END;
GO

-- ----------------------------------------------------------
-- 7) SESIONES_USUARIO.reemplazadaPor (FK autogenerada primero)
-- ----------------------------------------------------------
DECLARE @fk SYSNAME;
SELECT @fk = fk.name
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.columns c ON c.object_id = fkc.parent_object_id
    AND c.column_id = fkc.parent_column_id
WHERE fk.parent_object_id = OBJECT_ID('dbo.SESIONES_USUARIO')
  AND c.name = 'reemplazadaPor';

IF @fk IS NOT NULL
BEGIN
    EXEC('ALTER TABLE dbo.SESIONES_USUARIO DROP CONSTRAINT [' + @fk + ']');
    PRINT 'FK reemplazadaPor eliminada.';
END;
GO

IF COL_LENGTH('dbo.SESIONES_USUARIO', 'reemplazadaPor') IS NOT NULL
BEGIN
    ALTER TABLE dbo.SESIONES_USUARIO DROP COLUMN reemplazadaPor;
    PRINT 'SESIONES_USUARIO.reemplazadaPor eliminada.';
END;
GO
