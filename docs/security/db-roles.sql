-- Example Postgres roles and grants for least-privilege access
-- Adjust schema/table names to match `src/server/db/schema.ts`

-- Create roles
CREATE ROLE app_readonly NOLOGIN;
CREATE ROLE app_readwrite NOLOGIN;
CREATE ROLE app_migrations NOLOGIN;

-- Grant privileges (replace public schema/tables as needed)
GRANT USAGE ON SCHEMA public TO app_readonly, app_readwrite, app_migrations;

-- Table privileges
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_readwrite;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_migrations;

-- Sequences (for serial/bigserial)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_readonly, app_readwrite;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_migrations;

-- Future tables/sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO app_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE ON TABLES TO app_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO app_migrations;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_readonly, app_readwrite;

-- Create application users bound to roles (managed by your provider/terraform)
-- CREATE USER app_user_ro WITH LOGIN PASSWORD '***';
-- GRANT app_readonly TO app_user_ro;
-- CREATE USER app_user_rw WITH LOGIN PASSWORD '***';
-- GRANT app_readwrite TO app_user_rw;
-- CREATE USER app_user_mig WITH LOGIN PASSWORD '***';
-- GRANT app_migrations TO app_user_mig;
