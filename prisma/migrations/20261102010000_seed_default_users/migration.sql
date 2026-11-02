-- Insert default superadmin and admin users if they do not exist
INSERT INTO `users` (`nombre`, `email`, `password`, `rol`, `estado`, `createdAt`, `updatedAt`)
VALUES 
  ('Super Administrador', 'superadmin@puntog.com', 'admin123', 'Superadmin', 'Activo', NOW(), NOW()),
  ('Administrador', 'admin@puntog.com', 'admin123', 'Administrador', 'Activo', NOW(), NOW()),
  ('Cajero Principal', 'cajero@puntog.com', 'admin123', 'Cajero', 'Activo', NOW(), NOW()),
  ('Chef Cocina', 'cocina@puntog.com', 'cocina123', 'Cocinero', 'Activo', NOW(), NOW())
ON DUPLICATE KEY UPDATE `rol` = VALUES(`rol`), `estado` = VALUES(`estado`);
