-- ==========================================================
-- FinanzApp — Limpieza de columnas fantasma (versión plana)
-- Sin GO, sin punto y coma, sin BEGIN/END: cada paso es un IF
-- de una sola línea para consolas web que ejecutan por lotes.
-- Pegar y ejecutar TODO el archivo de una vez, en orden.
-- BACKUP previo obligatorio. Si AHORRO tuviera filas, el paso 0
-- aborta con error y no se ejecuta nada más.
-- ==========================================================

-- 0) Guardia: AHORRO debe estar vacía
IF OBJECT_ID('dbo.AHORRO', 'U') IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.AHORRO) THROW 50001, 'AHORRO tiene filas: abortar limpieza y revisar.', 1

-- 1) Tabla AHORRO (el DROP arrastra su FK e índice propios)
IF OBJECT_ID('dbo.AHORRO', 'U') IS NOT NULL DROP TABLE dbo.AHORRO

-- 2) CARTERA.versionFila
IF COL_LENGTH('dbo.CARTERA', 'versionFila') IS NOT NULL ALTER TABLE dbo.CARTERA DROP COLUMN versionFila

-- 3) CATEGORIAS.esPredeterminada (columna calculada)
IF COL_LENGTH('dbo.CATEGORIAS', 'esPredeterminada') IS NOT NULL ALTER TABLE dbo.CATEGORIAS DROP COLUMN esPredeterminada

-- 4) NOTIFICACION.fechaLectura
IF COL_LENGTH('dbo.NOTIFICACION', 'fechaLectura') IS NOT NULL ALTER TABLE dbo.NOTIFICACION DROP COLUMN fechaLectura

-- 5) PAGOS_REC_EJECUCIONES.mensajeError
IF COL_LENGTH('dbo.PAGOS_REC_EJECUCIONES', 'mensajeError') IS NOT NULL ALTER TABLE dbo.PAGOS_REC_EJECUCIONES DROP COLUMN mensajeError

-- 6) PREFERENCIAS_USUARIO.notificacionesCorreo (con su DEFAULT)
DECLARE @df SYSNAME
SELECT @df = dc.name FROM sys.default_constraints dc JOIN sys.columns col ON col.object_id = dc.parent_object_id AND col.column_id = dc.parent_column_id WHERE dc.parent_object_id = OBJECT_ID('dbo.PREFERENCIAS_USUARIO') AND col.name = 'notificacionesCorreo'
IF @df IS NOT NULL EXEC('ALTER TABLE dbo.PREFERENCIAS_USUARIO DROP CONSTRAINT [' + @df + ']')
IF COL_LENGTH('dbo.PREFERENCIAS_USUARIO', 'notificacionesCorreo') IS NOT NULL ALTER TABLE dbo.PREFERENCIAS_USUARIO DROP COLUMN notificacionesCorreo

-- 7) PREFERENCIAS_USUARIO.moneda (con su DEFAULT)
SELECT @df = dc.name FROM sys.default_constraints dc JOIN sys.columns col ON col.object_id = dc.parent_object_id AND col.column_id = dc.parent_column_id WHERE dc.parent_object_id = OBJECT_ID('dbo.PREFERENCIAS_USUARIO') AND col.name = 'moneda'
IF @df IS NOT NULL EXEC('ALTER TABLE dbo.PREFERENCIAS_USUARIO DROP CONSTRAINT [' + @df + ']')
IF COL_LENGTH('dbo.PREFERENCIAS_USUARIO', 'moneda') IS NOT NULL ALTER TABLE dbo.PREFERENCIAS_USUARIO DROP COLUMN moneda

-- 8) SESIONES_USUARIO.reemplazadaPor: primero su FK autogenerada
DECLARE @fk SYSNAME
SELECT @fk = fk.name FROM sys.foreign_keys fk JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id JOIN sys.columns c ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id WHERE fk.parent_object_id = OBJECT_ID('dbo.SESIONES_USUARIO') AND c.name = 'reemplazadaPor'
IF @fk IS NOT NULL EXEC('ALTER TABLE dbo.SESIONES_USUARIO DROP CONSTRAINT [' + @fk + ']')

-- 9) SESIONES_USUARIO.reemplazadaPor: la columna
IF COL_LENGTH('dbo.SESIONES_USUARIO', 'reemplazadaPor') IS NOT NULL ALTER TABLE dbo.SESIONES_USUARIO DROP COLUMN reemplazadaPor
