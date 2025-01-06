/*
  # Fix profile and auth setup

  1. Changes
    - Drop and recreate profiles table with correct structure
    - Update RLS policies for better security
    - Add indexes for performance

  2. Security
    - Ensure proper RLS policies for profile management
    - Add role-based access control
*/

-- Recreate profiles table with proper structure
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

-- Add indexes
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_role_idx ON profiles(role);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create admin function
CREATE OR REPLACE FUNCTION create_admin_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, municipality, role)
  VALUES (
    NEW.id,
    NEW.email,
    'Admin',
    'System',
    'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;