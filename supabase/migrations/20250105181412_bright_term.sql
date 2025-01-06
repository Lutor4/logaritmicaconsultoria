/*
  # Fix Database Schema and Relationships

  1. Changes
    - Add department_user_id to profiles
    - Update RLS policies for proper access control
    - Add missing indexes

  2. Security
    - Update RLS policies for proper data isolation
    - Add indexes for performance
*/

-- Add department_user_id to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department_user_id uuid REFERENCES auth.users(id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view relevant profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR -- Own profile
    department_user_id = auth.uid() OR -- Department user's profile
    EXISTS ( -- Admin access
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid()
      AND p2.role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_department_user ON profiles(department_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

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
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'department') = 'department' 
      THEN NEW.id 
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;