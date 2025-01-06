/*
  # Fix authentication schema

  1. Schema Updates
    - Reset and recreate profiles table
    - Add proper indexes and constraints
  
  2. Admin User Setup
    - Update or create admin user with proper credentials
    - Ensure profile exists
*/

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

-- Create trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    municipality,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'municipality', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'department')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update or create admin user
DO $$ 
DECLARE
  existing_user_id uuid;
BEGIN
  -- Check if admin user exists
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = 'admin@admin.com';

  IF existing_user_id IS NULL THEN
    -- Create new admin user if doesn't exist
    INSERT INTO auth.users (
      id,
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
      gen_random_uuid(),
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
    RETURNING id INTO existing_user_id;
  END IF;

  -- Ensure admin profile exists
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    municipality,
    role
  ) VALUES (
    existing_user_id,
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