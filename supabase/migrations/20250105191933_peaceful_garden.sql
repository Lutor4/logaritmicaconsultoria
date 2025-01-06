-- Reset and recreate profiles table with proper constraints
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  municipality text NOT NULL,
  role text NOT NULL DEFAULT 'department',
  department_id uuid REFERENCES departments(id),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'department'))
);

-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_department ON profiles(department_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow profile creation"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Improved trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert with proper error handling
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      municipality,
      role,
      department_id
    ) VALUES (
      NEW.id,
      LOWER(NEW.email),
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'municipality', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'department'),
      NULL
    );
  EXCEPTION 
    WHEN unique_violation THEN
      -- Profile already exists, update it
      UPDATE public.profiles SET
        email = LOWER(NEW.email),
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
        municipality = COALESCE(NEW.raw_user_meta_data->>'municipality', municipality),
        role = COALESCE(NEW.raw_user_meta_data->>'role', role)
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error creating profile: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();