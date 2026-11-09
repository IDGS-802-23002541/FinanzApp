-- Migracion HU-02.5b (#112): eliminacion de cuenta con estado ELIMINADO
-- Ejecutar sobre la base de datos de FinanzApp en SQL Server.
-- Es idempotente: se puede correr mas de una vez sin romper nada.

-- 1) Agregar fechaBaja al usuario (baja logica real, distinta de INACTIVO)
IF COL_LENGTH('dbo.USUARIO', 'fechaBaja') IS NULL
BEGIN
    ALTER TABLE dbo.USUARIO ADD fechaBaja DATETIME2 NULL;
END;
GO

-- 2) Reemplazar el CHECK de estado para aceptar ELIMINADO
-- nombre real confirmado en la BD: CK_USUARIO_estado
IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_USUARIO_estado'
      AND parent_object_id = OBJECT_ID('dbo.USUARIO')
)
BEGIN
    ALTER TABLE dbo.USUARIO DROP CONSTRAINT CK_USUARIO_estado;
END;
GO

ALTER TABLE dbo.USUARIO WITH CHECK
ADD CONSTRAINT CK_USUARIO_estado
CHECK (estado IN ('ACTIVO', 'INACTIVO', 'ELIMINADO'));
GO

-- 3) Validar que el constraint quede habilitado
ALTER TABLE dbo.USUARIO CHECK CONSTRAINT CK_USUARIO_estado;
GO
