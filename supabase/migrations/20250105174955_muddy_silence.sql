/*
  # Form Templates Schema

  1. New Tables
    - form_templates: Stores form template definitions
    - form_questions: Stores questions for each template
    - form_responses: Stores user responses to forms

  2. Security
    - Enable RLS on all tables
    - Add policies for department access
*/

-- Create enum for question types if not exists
DO $$ BEGIN
  CREATE TYPE question_type AS ENUM ('text', 'number', 'boolean', 'select');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create form_templates table
CREATE TABLE IF NOT EXISTS form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  department_id uuid REFERENCES departments(id),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

-- Create form_questions table
CREATE TABLE IF NOT EXISTS form_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES form_templates(id) ON DELETE CASCADE,
  question text NOT NULL,
  type question_type NOT NULL,
  required boolean DEFAULT true,
  options jsonb, -- For select questions
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create form_responses table
CREATE TABLE IF NOT EXISTS form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES form_templates(id),
  department_id uuid REFERENCES departments(id),
  responses jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  submitted_by uuid REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_templates
CREATE POLICY "Users can view templates in their municipality"
  ON form_templates FOR SELECT
  TO authenticated
  USING (
    department_id IN (
      SELECT id FROM departments
      WHERE municipality_id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates for their departments"
  ON form_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    department_id IN (
      SELECT id FROM departments
      WHERE municipality_id = auth.uid()
    )
  );

-- RLS Policies for form_questions
CREATE POLICY "Users can view questions"
  ON form_questions FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM form_templates
      WHERE department_id IN (
        SELECT id FROM departments
        WHERE municipality_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create questions for their templates"
  ON form_questions FOR INSERT
  TO authenticated
  WITH CHECK (
    template_id IN (
      SELECT id FROM form_templates
      WHERE department_id IN (
        SELECT id FROM departments
        WHERE municipality_id = auth.uid()
      )
    )
  );

-- RLS Policies for form_responses
CREATE POLICY "Users can view responses from their municipality"
  ON form_responses FOR SELECT
  TO authenticated
  USING (
    department_id IN (
      SELECT id FROM departments
      WHERE municipality_id = auth.uid()
    )
  );

CREATE POLICY "Users can submit responses to their departments"
  ON form_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    department_id IN (
      SELECT id FROM departments
      WHERE municipality_id = auth.uid()
    )
  );

-- Add indexes
CREATE INDEX idx_form_templates_department ON form_templates(department_id);
CREATE INDEX idx_form_questions_template ON form_questions(template_id);
CREATE INDEX idx_form_responses_template ON form_responses(template_id);
CREATE INDEX idx_form_responses_department ON form_responses(department_id);