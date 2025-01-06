/*
  # Fix Department Loading

  1. Changes
    - Add municipality_id to employees table
    - Update RLS policies for better access control
    - Fix department-profile relationship

  2. Security
    - Update RLS policies for departments and employees
    - Ensure proper access control based on user role
*/

-- Add municipality_id to employees if not exists
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS municipality_id uuid REFERENCES profiles(id);

-- Update employees RLS policies
DROP POLICY IF EXISTS "Users can view employees in their municipality" ON employees;
DROP POLICY IF EXISTS "Users can manage employees in their municipality" ON employees;

CREATE POLICY "Users can view employees"
  ON employees FOR SELECT
  TO authenticated
  USING (
    municipality_id = auth.uid() OR -- Admin access
    department_id IN ( -- Department access
      SELECT id FROM departments
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage employees"
  ON employees FOR ALL
  TO authenticated
  USING (
    municipality_id = auth.uid() OR -- Admin access
    department_id IN ( -- Department access
      SELECT id FROM departments
      WHERE user_id = auth.uid()
    )
  );

-- Update department RLS policies
DROP POLICY IF EXISTS "Users can view departments" ON departments;
DROP POLICY IF EXISTS "Users can manage departments" ON departments;

CREATE POLICY "Users can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (
    municipality_id = auth.uid() OR -- Admin access
    user_id = auth.uid() -- Department access
  );

CREATE POLICY "Users can manage departments"
  ON departments FOR ALL
  TO authenticated
  USING (
    municipality_id = auth.uid() OR -- Admin access
    user_id = auth.uid() -- Department access
  );

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_employees_municipality ON employees(municipality_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_municipality ON departments(municipality_id);
CREATE INDEX IF NOT EXISTS idx_departments_user ON departments(user_id);