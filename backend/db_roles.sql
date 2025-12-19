-- MoneyMinder database roles and least-privilege users
-- Run as MySQL root/admin after creating the schema.

SET @db_name = 'MoneyMinder_DB';
SET @app_user = 'moneyminder_app';
SET @app_pass = 'App@2024Secure!';
SET @readonly_user = 'moneyminder_readonly';
SET @readonly_pass = 'ReadOnly@2024!';
SET @admin_user = 'moneyminder_admin';
SET @admin_pass = 'Admin@2024!';

-- Helper to exec dynamic SQL
SET @sql = '';

-- Drop existing users (optional)
SET @sql = CONCAT("DROP USER IF EXISTS '", @app_user, "'@'localhost'");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = CONCAT("DROP USER IF EXISTS '", @readonly_user, "'@'localhost'");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = CONCAT("DROP USER IF EXISTS '", @admin_user, "'@'localhost'");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Create users
SET @sql = CONCAT("CREATE USER '", @app_user, "'@'localhost' IDENTIFIED BY '", @app_pass, "'");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = CONCAT("CREATE USER '", @readonly_user, "'@'localhost' IDENTIFIED BY '", @readonly_pass, "'");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = CONCAT("CREATE USER '", @admin_user, "'@'localhost' IDENTIFIED BY '", @admin_pass, "'");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Privileges
SET @sql = CONCAT("GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON ", @db_name, ".* TO '", @app_user, "'@'localhost'");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = CONCAT("GRANT SELECT ON ", @db_name, ".* TO '", @readonly_user, "'@'localhost'");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = CONCAT("GRANT ALL PRIVILEGES ON ", @db_name, ".* TO '", @admin_user, "'@'localhost'");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

FLUSH PRIVILEGES;

-- Note: update backend/.env to point to moneyminder_app credentials.
