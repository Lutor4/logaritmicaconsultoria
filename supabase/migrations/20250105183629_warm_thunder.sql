/*
  # Create admin user

  1. Changes
    - Creates an admin user with email and password
    - Sets up the admin profile
*/

-- Create admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@admin.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Create admin profile
INSERT INTO profiles (
  id,
  email,
  full_name,
  municipality,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@admin.com',
  'Administrador',
  'Sistema',
  'admin'
) ON CONFLICT (id) DO NOTHING;