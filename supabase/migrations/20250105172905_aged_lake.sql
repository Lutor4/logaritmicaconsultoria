/*
  # Fix authentication and profile creation

  1. Changes
    - Simplify profile creation trigger
    - Update RLS policies for better access control
    - Add proper indexes for performance

  2. Security
    - Ensure proper RLS for all tables
    - Fix profile creation during registration
*/

-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create simplified profile handling
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
    'department'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update profile policies
CREATE POLICY "Allow public profile creation"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_departments_municipality ON departments(municipality_id);

-- Update department policies
DROP POLICY IF EXISTS "Users can view departments" ON departments;
DROP POLICY IF EXISTS "Users can insert departments" ON departments;
DROP POLICY IF EXISTS "Users can update own departments" ON departments;

CREATE POLICY "Users can view all departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own departments"
  ON departments FOR ALL
  TO authenticated
  USING (
    municipality_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );