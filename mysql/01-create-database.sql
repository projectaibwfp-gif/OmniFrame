CREATE DATABASE IF NOT EXISTS project_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'project_user'@'%' IDENTIFIED BY 'project_password';
GRANT ALL PRIVILEGES ON project_ai.* TO 'project_user'@'%';
FLUSH PRIVILEGES;
