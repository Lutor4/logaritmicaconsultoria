-- Create admin user if not exists
DO $$ 
BEGIN
  -- Create admin user
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@admin.com'
  ) THEN
    INSERT INTO auth.users (
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
    );
  END IF;

  -- Create admin profile
  INSERT INTO profiles (
    id,
    email,
    full_name,
    municipality,
    role
  ) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@admin.com'),
    'admin@admin.com',
    'Administrador',
    'Sistema',
    'admin'
  ) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Administrador',
    municipality = 'Sistema';
END $$;