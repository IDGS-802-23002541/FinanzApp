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
-- Aquí van los CREATE TABLE, índices y catálogos del modelo de datos.
-- Detalle del modelo: docs/modelo-datos.md


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
