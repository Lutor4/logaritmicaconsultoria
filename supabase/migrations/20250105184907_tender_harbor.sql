/*
  # Fix admin user authentication

  1. Schema Updates
    - Ensure proper auth schema setup
    - Add necessary indexes
  
  2. Admin User Creation
    - Create admin user with proper credentials
    - Set up admin profile with correct role
*/

-- Create admin user with proper schema handling
DO $$ 
DECLARE
  admin_id uuid;
BEGIN
  -- Create admin user if not exists
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    is_super_admin,
    instance_id
  ) 
  SELECT 
    'admin@admin.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "admin"}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated',
    '',
    false,
    '00000000-0000-0000-0000-000000000000'::uuid
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@admin.com'
  )
  RETURNING id INTO admin_id;

  -- If admin was just created, create their profile
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      municipality,
      role
    ) VALUES (
      admin_id,
      'admin@admin.com',
      'Administrador',
      'Sistema',
      'admin'
    );
  END IF;
END $$;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Update RLS policies to ensure admin access
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Ensure admin user has proper auth settings
UPDATE auth.users 
SET 
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb,
  raw_user_meta_data = '{"role": "admin"}'::jsonb,
  email_confirmed_at = now(),
  is_super_admin = false,
  updated_at = now()
WHERE email = 'admin@admin.com';