/*
  # Fix Form Templates Access

  1. Changes
    - Update form templates policies
    - Add missing relationships
    - Fix access control

  2. Security
    - Enable proper access for department users
    - Maintain admin privileges
*/

-- Update form templates policies
DROP POLICY IF EXISTS "Users can view form templates" ON form_templates;
DROP POLICY IF EXISTS "Users can manage form templates" ON form_templates;

-- Allow viewing templates
CREATE POLICY "Anyone can view templates"
  ON form_templates FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to manage templates
CREATE POLICY "Admins can manage templates"
  ON form_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Allow department users to respond to their templates
CREATE POLICY "Department users can respond to templates"
  ON form_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    department_id IN (
      SELECT d.id FROM departments d
      WHERE d.user_id = auth.uid()
    )
  );

-- Update form questions policies
DROP POLICY IF EXISTS "Users can view questions" ON form_questions;

CREATE POLICY "Anyone can view questions"
  ON form_questions FOR SELECT
  TO authenticated
  USING (true);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_form_templates_created_by ON form_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_by ON form_responses(submitted_by);