-- KeyBastion Mock Data SQL Script
-- Generated on: 2025-05-23
-- This script creates mock data for the KeyBastion application
-- Note: UserSettings are not included as requested

-- Clear existing data (if needed)
DELETE FROM sharings;
DELETE FROM activity_logs;
DELETE FROM credentials;
DELETE FROM categories;
DELETE FROM users;

-- Insert Users
-- Note: Passwords are 'password123' hashed with BCrypt
INSERT INTO users (id, username, email, password_hash, security_pin, role, created_at)
VALUES 
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@keybastion.com', '$2a$10$rPiEAgQNIT1TCoQWDDt1DeEFBQPnxECMVzHHDBF494WZ6tTgvZYzm', '1234', 'ADMIN', '2025-01-01 00:00:00'),
('22222222-2222-2222-2222-222222222222', 'testuser1', 'testuser1@example.com', '$2a$10$rPiEAgQNIT1TCoQWDDt1DeEFBQPnxECMVzHHDBF494WZ6tTgvZYzm', '5678', 'USER', '2025-01-15 10:30:00'),
('33333333-3333-3333-3333-333333333333', 'testuser2', 'testuser2@example.com', '$2a$10$rPiEAgQNIT1TCoQWDDt1DeEFBQPnxECMVzHHDBF494WZ6tTgvZYzm', '9012', 'USER', '2025-02-01 14:45:00'),
('44444444-4444-4444-4444-444444444444', 'developer', 'developer@keybastion.com', '$2a$10$rPiEAgQNIT1TCoQWDDt1DeEFBQPnxECMVzHHDBF494WZ6tTgvZYzm', '3456', 'USER', '2025-02-15 09:15:00');

-- Insert Categories
-- Global categories (created by admin)
INSERT INTO categories (id, name, description, is_global, category_type, user_id)
VALUES 
('a1111111-1111-1111-1111-111111111111', 'Banking', 'Financial accounts and banking services', true, 'BANKING', '11111111-1111-1111-1111-111111111111'),
('a2222222-2222-2222-2222-222222222222', 'Social Media', 'Social networking platforms', true, 'SOCIAL_MEDIA', '11111111-1111-1111-1111-111111111111'),
('a3333333-3333-3333-3333-333333333333', 'Email', 'Email service providers', true, 'EMAIL', '11111111-1111-1111-1111-111111111111'),
('a4444444-4444-4444-4444-444444444444', 'Shopping', 'Online shopping platforms', true, 'SHOPPING', '11111111-1111-1111-1111-111111111111'),
('a5555555-5555-5555-5555-555555555555', 'Entertainment', 'Streaming and entertainment services', true, 'ENTERTAINMENT', '11111111-1111-1111-1111-111111111111'),
('a6666666-6666-6666-6666-666666666666', 'Work', 'Work-related accounts', true, 'WORK', '11111111-1111-1111-1111-111111111111'),
('a7777777-7777-7777-7777-777777777777', 'Education', 'Educational platforms and services', true, 'EDUCATION', '11111111-1111-1111-1111-111111111111'),
('a8888888-8888-8888-8888-888888888888', 'Gaming', 'Gaming platforms and services', true, 'GAMING', '11111111-1111-1111-1111-111111111111');

-- User-specific categories
INSERT INTO categories (id, name, description, is_global, category_type, user_id)
VALUES 
('b1111111-1111-1111-1111-111111111111', 'Personal Finance', 'My personal financial accounts', false, 'FINANCE', '22222222-2222-2222-2222-222222222222'),
('b2222222-2222-2222-2222-222222222222', 'Work Projects', 'Project-related accounts', false, 'WORK', '22222222-2222-2222-2222-222222222222'),
('b3333333-3333-3333-3333-333333333333', 'Travel Sites', 'Travel booking platforms', false, 'TRAVEL', '33333333-3333-3333-3333-333333333333'),
('b4444444-4444-4444-4444-444444444444', 'Health Services', 'Healthcare portals and services', false, 'HEALTH', '33333333-3333-3333-3333-333333333333'),
('b5555555-5555-5555-5555-555555555555', 'Development', 'Development tools and platforms', false, 'WORK', '44444444-4444-4444-4444-444444444444');

-- Insert Credentials
-- Note: Passwords are encrypted using AES-256 in the application, but for mock data we'll use placeholder values
INSERT INTO credentials (id, account_name, encrypted_password, service_url, notes, created_at, user_id, category_id, 
                        password_length, include_lowercase, include_uppercase, include_numbers, include_special, password_strength)
VALUES 
-- User 1 credentials
('c1111111-1111-1111-1111-111111111111', 'Personal Bank', 'encrypted_password_data_1', 'https://mybank.com', 'Main checking account', '2025-02-01 10:00:00', 
 '22222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 16, true, true, true, true, 90),
 
('c2222222-2222-2222-2222-222222222222', 'Facebook', 'encrypted_password_data_2', 'https://facebook.com', 'Personal account', '2025-02-05 11:30:00', 
 '22222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 12, true, true, true, false, 70),
 
('c3333333-3333-3333-3333-333333333333', 'Gmail', 'encrypted_password_data_3', 'https://gmail.com', 'Work email', '2025-02-10 14:45:00', 
 '22222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 14, true, true, true, true, 85),
 
('c4444444-4444-4444-4444-444444444444', 'Investment Account', 'encrypted_password_data_4', 'https://investments.com', 'Retirement account', '2025-02-15 16:20:00', 
 '22222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 18, true, true, true, true, 95),

-- User 2 credentials
('c5555555-5555-5555-5555-555555555555', 'Amazon', 'encrypted_password_data_5', 'https://amazon.com', 'Shopping account with prime', '2025-03-01 09:15:00', 
 '33333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 12, true, true, true, false, 75),
 
('c6666666-6666-6666-6666-666666666666', 'Netflix', 'encrypted_password_data_6', 'https://netflix.com', 'Family subscription', '2025-03-05 10:30:00', 
 '33333333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555', 10, true, true, true, false, 65),
 
('c7777777-7777-7777-7777-777777777777', 'Expedia', 'encrypted_password_data_7', 'https://expedia.com', 'Travel bookings', '2025-03-10 13:45:00', 
 '33333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 14, true, true, true, true, 85),
 
('c8888888-8888-8888-8888-888888888888', 'Health Portal', 'encrypted_password_data_8', 'https://myhealth.com', 'Medical records portal', '2025-03-15 15:00:00', 
 '33333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444', 16, true, true, true, true, 90),

-- User 3 credentials
('c9999999-9999-9999-9999-999999999999', 'GitHub', 'encrypted_password_data_9', 'https://github.com', 'Code repository', '2025-04-01 08:30:00', 
 '44444444-4444-4444-4444-444444444444', 'b5555555-5555-5555-5555-555555555555', 20, true, true, true, true, 100),
 
('caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'AWS Console', 'encrypted_password_data_10', 'https://aws.amazon.com', 'Cloud services', '2025-04-05 09:45:00', 
 '44444444-4444-4444-4444-444444444444', 'b5555555-5555-5555-5555-555555555555', 20, true, true, true, true, 100),
 
('cbbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Udemy', 'encrypted_password_data_11', 'https://udemy.com', 'Online courses', '2025-04-10 11:15:00', 
 '44444444-4444-4444-4444-444444444444', 'a7777777-7777-7777-7777-777777777777', 14, true, true, true, false, 80),
 
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Steam', 'encrypted_password_data_12', 'https://store.steampowered.com', 'Gaming platform', '2025-04-15 14:30:00', 
 '44444444-4444-4444-4444-444444444444', 'a8888888-8888-8888-8888-888888888888', 16, true, true, true, true, 90);

-- Insert Activity Logs
INSERT INTO activity_logs (id, user_id, action, timestamp, ip_address, description)
VALUES 
-- User 1 activities
('d1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'CREATE', '2025-02-01 10:00:00', '192.168.1.100', 'Created credential for Personal Bank'),
('d2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'CREATE', '2025-02-05 11:30:00', '192.168.1.100', 'Created credential for Facebook'),
('d3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'CREATE', '2025-02-10 14:45:00', '192.168.1.100', 'Created credential for Gmail'),
('d4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'CREATE', '2025-02-15 16:20:00', '192.168.1.100', 'Created credential for Investment Account'),
('d5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'UPDATE', '2025-02-20 09:30:00', '192.168.1.100', 'Updated credential for Personal Bank'),
('d6666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'VIEW', '2025-02-25 14:15:00', '192.168.1.100', 'Viewed credential for Gmail'),

-- User 2 activities
('d7777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'CREATE', '2025-03-01 09:15:00', '192.168.1.101', 'Created credential for Amazon'),
('d8888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', 'CREATE', '2025-03-05 10:30:00', '192.168.1.101', 'Created credential for Netflix'),
('d9999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', 'CREATE', '2025-03-10 13:45:00', '192.168.1.101', 'Created credential for Expedia'),
('daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'CREATE', '2025-03-15 15:00:00', '192.168.1.101', 'Created credential for Health Portal'),
('dbbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'UPDATE', '2025-03-20 11:45:00', '192.168.1.101', 'Updated credential for Netflix'),
('dccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'VIEW', '2025-03-25 16:30:00', '192.168.1.101', 'Viewed credential for Amazon'),

-- User 3 activities
('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'CREATE', '2025-04-01 08:30:00', '192.168.1.102', 'Created credential for GitHub'),
('deeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 'CREATE', '2025-04-05 09:45:00', '192.168.1.102', 'Created credential for AWS Console'),
('dffffffff-ffff-ffff-ffff-ffffffffffff', '44444444-4444-4444-4444-444444444444', 'CREATE', '2025-04-10 11:15:00', '192.168.1.102', 'Created credential for Udemy'),
('e1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'CREATE', '2025-04-15 14:30:00', '192.168.1.102', 'Created credential for Steam'),
('e2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'UPDATE', '2025-04-20 10:15:00', '192.168.1.102', 'Updated credential for GitHub'),
('e3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'VIEW', '2025-04-25 15:45:00', '192.168.1.102', 'Viewed credential for AWS Console'),

-- Admin activities
('e4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'ADMIN', '2025-05-01 09:00:00', '192.168.1.1', 'Created global category: Banking'),
('e5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'ADMIN', '2025-05-01 09:05:00', '192.168.1.1', 'Created global category: Social Media'),
('e6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'ADMIN', '2025-05-01 09:10:00', '192.168.1.1', 'Created global category: Email'),
('e7777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'ADMIN', '2025-05-01 09:15:00', '192.168.1.1', 'Created global category: Shopping'),
('e8888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'ADMIN', '2025-05-10 14:30:00', '192.168.1.1', 'Viewed user statistics');

-- Insert Sharing Records
INSERT INTO sharings (id, credential_id, shared_by_user_id, shared_with_user_id, expiration_date, access_token, accepted)
VALUES 
-- User 1 sharing with User 2
('f1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 
 '2025-12-31', 'access_token_1', true),
('f2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 
 '2025-12-31', 'access_token_2', true),

-- User 2 sharing with User 1
('f3333333-3333-3333-3333-333333333333', 'c5555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 
 '2025-12-31', 'access_token_3', true),
('f4444444-4444-4444-4444-444444444444', 'c6666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 
 '2025-12-31', 'access_token_4', false),

-- User 3 sharing with User 1
('f5555555-5555-5555-5555-555555555555', 'c9999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 
 '2025-12-31', 'access_token_5', true),

-- User 3 sharing with User 2
('f6666666-6666-6666-6666-666666666666', 'caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 
 '2025-12-31', 'access_token_6', false);
