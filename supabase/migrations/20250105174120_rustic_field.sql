-- Create storage bucket for department images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('department-images', 'department-images', true);

-- Create table for department images
CREATE TABLE department_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id),
  url text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on department_images
ALTER TABLE department_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for department_images
CREATE POLICY "Users can view images from their municipality"
  ON department_images FOR SELECT
  TO authenticated
  USING (
    department_id IN (
      SELECT id FROM departments 
      WHERE municipality_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload images to their departments"
  ON department_images FOR INSERT
  TO authenticated
  WITH CHECK (
    department_id IN (
      SELECT id FROM departments 
      WHERE municipality_id = auth.uid()
    )
  );

-- Create storage policies
CREATE POLICY "Allow public read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'department-images');

CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'department-images');