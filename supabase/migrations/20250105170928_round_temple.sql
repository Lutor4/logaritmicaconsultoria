/*
  # Add roles and forms structure

  1. New Tables
    - `form_templates`: Armazena as perguntas configuradas pelo admin
    - `form_responses`: Armazena as respostas dos departamentos
    - `form_questions`: Armazena as perguntas específicas para cada departamento

  2. Changes
    - Adiciona campo `role` na tabela profiles para diferenciar admin de departamentos
*/

-- Criar enum para tipos de pergunta
CREATE TYPE question_type AS ENUM ('text', 'number', 'boolean', 'select');

-- Tabela para templates de formulários
CREATE TABLE form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

-- Tabela para perguntas
CREATE TABLE form_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES form_templates(id) ON DELETE CASCADE,
  question text NOT NULL,
  type question_type NOT NULL,
  required boolean DEFAULT true,
  options jsonb, -- Para perguntas do tipo select
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela para respostas
CREATE TABLE form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES form_templates(id),
  department_id uuid REFERENCES departments(id),
  responses jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  submitted_by uuid REFERENCES profiles(id)
);

-- Habilitar RLS
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- Políticas para form_templates
CREATE POLICY "Admins can manage form templates"
  ON form_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Departments can view their templates"
  ON form_templates FOR SELECT
  TO authenticated
  USING (
    department_id IN (
      SELECT id FROM departments
      WHERE municipality_id = (
        SELECT municipality_id FROM departments
        WHERE id = department_id
      )
    )
  );

-- Políticas para form_questions
CREATE POLICY "Everyone can view questions"
  ON form_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage questions"
  ON form_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Políticas para form_responses
CREATE POLICY "Departments can manage their own responses"
  ON form_responses FOR ALL
  TO authenticated
  USING (
    department_id IN (
      SELECT id FROM departments
      WHERE municipality_id = (
        SELECT municipality_id FROM departments
        WHERE id = department_id
      )
    )
  );

CREATE POLICY "Admins can view all responses"
  ON form_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );