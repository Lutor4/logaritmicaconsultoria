-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view templates" ON form_templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON form_templates;

-- Create new policies for form templates
CREATE POLICY "Department users can only view their templates"
  ON form_templates FOR SELECT
  TO authenticated
  USING (
    -- Admin can see all templates
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
    OR
    -- Department users can only see templates for their department
    department_id = (
      SELECT department_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Only admins can create/update templates
CREATE POLICY "Only admins can manage templates"
  ON form_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Update form responses policy
DROP POLICY IF EXISTS "Department users can respond to templates" ON form_responses;

CREATE POLICY "Department users can respond to their templates"
  ON form_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Department users can only respond to templates for their department
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND department_id = form_responses.department_id
    )
  );