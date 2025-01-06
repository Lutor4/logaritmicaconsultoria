/*
  # Fix Database Relationships

  1. Changes
    - Add department_id to profiles table
    - Update foreign key relationships
    - Fix RLS policies
    - Update handle_new_user function

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for department access
*/

-- Update profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES departments(id) ON DELETE SET NULL;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view departments" ON departments;
DROP POLICY IF EXISTS "Users can manage departments" ON departments;

-- Profile policies
CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Department policies
CREATE POLICY "Users can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage departments"
  ON departments FOR ALL
  TO authenticated
  USING (
    municipality_id = auth.uid() OR
    user_id = auth.uid()
  );

-- Update form template policies
DROP POLICY IF EXISTS "Department users can view their templates" ON form_templates;
DROP POLICY IF EXISTS "Department users can manage their templates" ON form_templates;

CREATE POLICY "Users can view form templates"
  ON form_templates FOR SELECT
  TO authenticated
  USING (
    department_id IN (
      SELECT d.id FROM departments d
      WHERE d.municipality_id = auth.uid()
      OR d.id = (
        SELECT p.department_id 
        FROM profiles p 
        WHERE p.id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage form templates"
  ON form_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_user ON departments(user_id);
CREATE INDEX IF NOT EXISTS idx_departments_municipality ON departments(municipality_id);

-- Update handle_new_user function to handle department association
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    municipality,
    role,
    department_id
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'municipality', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'department'),
    NULL -- department_id will be set when department is created
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;