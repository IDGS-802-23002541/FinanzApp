-- ==========================================================
-- FinanzApp — Conexión a SQL Server
-- ----------------------------------------------------------
-- Este archivo SÍ se versiona: no contiene credenciales.
--
-- Las credenciales NUNCA van al repositorio. Se leen de la
-- variables de entorno locales (archivo .env, ignorado por git):
--
--   DB_SERVER   = <servidor>          -- ej. <host>.public.databaseasp.net
--   DB_PORT     = 1433
--   DB_NAME     = <base de datos>
--   DB_USER     = <usuario>
--   DB_PASSWORD = <contraseña>
--
-- Cadena para SQLAlchemy + pyodbc (se arma desde el .env):
--   mssql+pyodbc://<DB_USER>:<DB_PASSWORD>@<DB_SERVER>:<DB_PORT>/<DB_NAME>?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes
-- ==========================================================


-- ----------------------------------------------------------
-- 1) Scripts de estructura (DDL)
-- ----------------------------------------------------------
-- Detalle del modelo: docs/modelo-datos.md
-- Los scripts son idempotentes: solo crean lo que no existe.

IF OBJECT_ID('dbo.CATEGORIAS', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CATEGORIAS (
        idCategoria INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        carteraId INT NULL
            CONSTRAINT FK_CATEGORIAS_CARTERA
            REFERENCES dbo.CARTERA (idCartera),
        nombre NVARCHAR(80) NOT NULL,
        tipo VARCHAR(10) NOT NULL DEFAULT 'AMBOS',
        tipoCartera VARCHAR(10) NULL,
        orden INT NOT NULL DEFAULT 0,
        estado VARCHAR(10) NOT NULL DEFAULT 'ACTIVA',
        esPredeterminada AS
            (CASE WHEN carteraId IS NULL THEN 1 ELSE 0 END) PERSISTED,
        CONSTRAINT CK_CATEGORIAS_tipo
            CHECK (tipo IN ('INGRESO', 'GASTO', 'AMBOS')),
        CONSTRAINT CK_CATEGORIAS_estado
            CHECK (estado IN ('ACTIVA', 'INACTIVA')),
        CONSTRAINT CK_CATEGORIAS_tipo_cartera
            CHECK (tipoCartera IS NULL
                OR tipoCartera IN ('HOGAR', 'VIAJE', 'EVENTO', 'OTRA')),
        CONSTRAINT CK_CATEGORIAS_global_o_personal
            CHECK (carteraId IS NULL OR tipoCartera IS NULL)
    );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_CATEGORIAS_cartera_nombre' AND object_id = OBJECT_ID('dbo.CATEGORIAS')
)
    CREATE UNIQUE INDEX UX_CATEGORIAS_cartera_nombre
        ON dbo.CATEGORIAS (carteraId, nombre)
        WHERE carteraId IS NOT NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_CATEGORIAS_global_nombre' AND object_id = OBJECT_ID('dbo.CATEGORIAS')
)
    CREATE UNIQUE INDEX UX_CATEGORIAS_global_nombre
        ON dbo.CATEGORIAS (nombre, tipoCartera)
        WHERE carteraId IS NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_CATEGORIAS_consulta' AND object_id = OBJECT_ID('dbo.CATEGORIAS')
)
    CREATE INDEX IX_CATEGORIAS_consulta
        ON dbo.CATEGORIAS (carteraId, estado, orden);
GO


-- ----------------------------------------------------------
-- 2) Catálogos base
-- ----------------------------------------------------------
-- Tipos de cartera (CK_CARTERA_tipo): HOGAR, VIAJE, EVENTO, OTRA.
-- Estados de cartera (CK_CARTERA_estado): ACTIVA, ARCHIVADA, FINALIZADA.
-- Roles de cartera (CK_MIEMBROS_CARTERA_rol): ADMIN, CONTRIBUYENTE.
-- Estados de miembro (CK_MIEMBROS_CARTERA_estado): ACTIVO, BAJA.
-- Roles del sistema (CK_USUARIO_rolGlobal): CLIENTE, TRABAJADOR, ADMIN.
-- Categorías globales: se cargan con `python seed.py` (idempotente).


-- ----------------------------------------------------------
-- 3) Notas
-- ----------------------------------------------------------
-- · Toda eliminación en el producto es lógica (cambio de estatus).
--   Los scripts deben usar columnas de estatus, no DELETE físico.
-- · Montos en MXN (decimal) y fechas en formato estándar de SQL Server.
