/*
  # Initial Schema Setup for Municipal Management System

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `municipality` (text)
      - `role` (text)
      - `created_at` (timestamp)
    
    - `departments`
      - `id` (uuid, primary key)
      - `name` (text)
      - `budget` (numeric)
      - `municipality_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `employees`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `department_id` (uuid, foreign key)
      - `position` (text)
      - `salary` (numeric)
      - `created_at` (timestamp)
    
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text)
      - `department_id` (uuid, foreign key)
      - `budget` (numeric)
      - `status` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  municipality text NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create departments table
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  budget numeric NOT NULL DEFAULT 0,
  municipality_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create employees table
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  department_id uuid REFERENCES departments(id),
  position text NOT NULL,
  salary numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department_id uuid REFERENCES departments(id),
  budget numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'planejamento',
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view departments in their municipality"
  ON departments FOR SELECT
  TO authenticated
  USING (municipality_id IN (
    SELECT id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage departments in their municipality"
  ON departments FOR ALL
  TO authenticated
  USING (municipality_id IN (
    SELECT id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can view employees in their municipality"
  ON employees FOR SELECT
  TO authenticated
  USING (department_id IN (
    SELECT id FROM departments WHERE municipality_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage employees in their municipality"
  ON employees FOR ALL
  TO authenticated
  USING (department_id IN (
    SELECT id FROM departments WHERE municipality_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can view projects in their municipality"
  ON projects FOR SELECT
  TO authenticated
  USING (department_id IN (
    SELECT id FROM departments WHERE municipality_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage projects in their municipality"
  ON projects FOR ALL
  TO authenticated
  USING (department_id IN (
    SELECT id FROM departments WHERE municipality_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  ));