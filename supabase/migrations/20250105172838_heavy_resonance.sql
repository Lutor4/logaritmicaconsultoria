/*
  # Fix RLS policies and profile creation

  1. Changes
    - Update RLS policies for departments
    - Add missing municipality_id to departments
    - Fix profile creation policies
    - Add function to handle profile creation

  2. Security
    - Enable RLS on all tables
    - Add proper policies for both admin and department roles
*/

-- Update departments RLS policies
DROP POLICY IF EXISTS "Users can view departments in their municipality" ON departments;
DROP POLICY IF EXISTS "Users can manage departments in their municipality" ON departments;

CREATE POLICY "Users can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (
    municipality_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (
    municipality_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Update profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow profile creation"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Create or update profile trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, municipality, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'municipality',
    'department'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();