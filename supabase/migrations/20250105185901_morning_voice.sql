-- Reset and recreate profiles table
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  municipality text NOT NULL,
  role text NOT NULL DEFAULT 'department',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'department'))
);

-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for registration"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Create or update admin user
DO $$ 
DECLARE
  admin_id uuid;
BEGIN
  -- Try to get existing admin user
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'admin@admin.com';

  -- Create admin user if doesn't exist
  IF admin_id IS NULL THEN
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
      instance_id
    ) VALUES (
      'admin@admin.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "admin"}'::jsonb,
      now(),
      now(),
      'authenticated',
      'authenticated',
      '00000000-0000-0000-0000-000000000000'::uuid
    )
    RETURNING id INTO admin_id;
  END IF;

  -- Create or update admin profile
  INSERT INTO profiles (
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
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    full_name = 'Administrador',
    municipality = 'Sistema';
END $$;