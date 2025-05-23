-- Initial admin user for development
INSERT INTO users (id, username, email, password_hash, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'admin@example.com',
  '$2a$12$Xep2mox9ES/kOe8qo.KaLOH113ka8L9V/MmncpZ1A41kaL9FZJ7eq', -- bcrypt: 'admin123'
  'ADMIN',
  CURRENT_TIMESTAMP
);
