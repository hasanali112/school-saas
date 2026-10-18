-- One-time database setup. Run as a superuser (psql -v app_password=... -f bootstrap.sql),
-- then point DATABASE_URL at the app role and run `yarn migration:run`.
--
--   edusmart_app     owns the tables and is what the API logs in as. It is NOT a superuser
--                    and NOT BYPASSRLS, so FORCE row-level security applies to it.
--   edusmart_system  NOLOGIN BYPASSRLS. The app switches to it (SET LOCAL ROLE) only for
--                    pre-auth lookups and provider callbacks: DatabaseService.system().

CREATE ROLE edusmart_app LOGIN PASSWORD :'app_password' NOSUPERUSER NOBYPASSRLS;
CREATE ROLE edusmart_system NOLOGIN BYPASSRLS;
GRANT edusmart_system TO edusmart_app;

CREATE DATABASE edusmart OWNER edusmart_app;
\connect edusmart

GRANT USAGE ON SCHEMA public TO edusmart_system;
ALTER DEFAULT PRIVILEGES FOR ROLE edusmart_app IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO edusmart_system;
ALTER DEFAULT PRIVILEGES FOR ROLE edusmart_app IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO edusmart_system;
