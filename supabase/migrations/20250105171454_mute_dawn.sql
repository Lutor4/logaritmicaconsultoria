/*
  # Fix schema relationships and queries

  1. Changes
    - Add municipality_id to projects table
    - Update RLS policies
    - Fix relationships between tables

  2. Security
    - Update RLS policies to use municipality_id consistently
*/

-- Add municipality_id to projects
ALTER TABLE projects 
ADD COLUMN municipality_id uuid REFERENCES profiles(id);

-- Update projects RLS policies
DROP POLICY IF EXISTS "Users can view projects in their municipality" ON projects;
DROP POLICY IF EXISTS "Users can manage projects in their municipality" ON projects;

CREATE POLICY "Users can view projects in their municipality"
  ON projects FOR SELECT
  TO authenticated
  USING (
    municipality_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can manage projects in their municipality"
  ON projects FOR ALL
  TO authenticated
  USING (
    municipality_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Update department policies to handle both admin and department roles
DROP POLICY IF EXISTS "Users can view departments in their municipality" ON departments;
DROP POLICY IF EXISTS "Users can manage departments in their municipality" ON departments;

CREATE POLICY "Users can view departments in their municipality"
  ON departments FOR SELECT
  TO authenticated
  USING (
    municipality_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can manage departments in their municipality"
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