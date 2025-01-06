-- Add user_id to departments table
ALTER TABLE departments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update RLS policies for departments
DROP POLICY IF EXISTS "Users can view all departments" ON departments;
DROP POLICY IF EXISTS "Users can manage own departments" ON departments;

CREATE POLICY "Users can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (
    municipality_id = auth.uid() OR
    user_id = auth.uid()
  );

CREATE POLICY "Users can manage departments"
  ON departments FOR ALL
  TO authenticated
  USING (
    municipality_id = auth.uid() OR
    user_id = auth.uid()
  );

-- Update form templates policies
DROP POLICY IF EXISTS "Users can view templates in their municipality" ON form_templates;
DROP POLICY IF EXISTS "Users can create templates for their departments" ON form_templates;

CREATE POLICY "Department users can view their templates"
  ON form_templates FOR SELECT
  TO authenticated
  USING (
    department_id IN (
      SELECT id FROM departments
      WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM departments
      WHERE municipality_id = auth.uid()
    )
  );

CREATE POLICY "Department users can manage their templates"
  ON form_templates FOR ALL
  TO authenticated
  USING (
    department_id IN (
      SELECT id FROM departments
      WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM departments
      WHERE municipality_id = auth.uid()
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_departments_user_id ON departments(user_id);