/*
  # Fix Database Relationships and Access Control

  1. Changes
    - Update profile and department relationship
    - Fix user access control
    - Add proper indexes
    - Update RLS policies

  2. Security
    - Ensure proper access control
    - Add RLS policies for all tables
*/

-- First ensure we have the correct tables structure
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  municipality text NOT NULL,
  role text NOT NULL DEFAULT 'department',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'department'))
);

-- Update departments table structure
ALTER TABLE departments 
DROP CONSTRAINT IF EXISTS departments_user_id_fkey;

ALTER TABLE departments
ADD COLUMN IF NOT EXISTS user_id uuid,
ADD CONSTRAINT departments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

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

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_departments_user ON departments(user_id);
CREATE INDEX IF NOT EXISTS idx_departments_municipality ON departments(municipality_id);

-- Update handle_new_user function
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