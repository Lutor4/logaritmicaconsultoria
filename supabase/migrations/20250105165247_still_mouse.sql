/*
  # Add insert policy for profiles table

  1. Changes
    - Add policy to allow inserting new profiles during registration
    - Policy ensures user can only insert their own profile with matching auth.uid
*/

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also allow public (unauthenticated) users to insert profiles during registration
CREATE POLICY "Allow profile creation during registration"
  ON profiles FOR INSERT
  TO anon
  WITH CHECK (true);