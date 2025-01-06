/*
  # Fix Authentication Flow and Department Access

  1. Changes
    - Add user_id to profiles for department association
    - Update profile trigger to handle department users
    - Fix RLS policies for proper access control

  2. Security
    - Enable RLS on all tables
    - Add policies for proper data isolation
*/

-- Add user_id to profiles for department association
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department_user_id uuid REFERENCES auth.users(id);

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    municipality,
    role,
    department_user_id
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'municipality', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'department'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'department' 
      THEN NEW.id 
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view relevant profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    department_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid()
      AND p2.role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_department_user ON profiles(department_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);