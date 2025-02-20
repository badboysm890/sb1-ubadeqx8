/*
  # Fix Recursive Policies
  
  1. Changes
    - Drop existing policies and recreate with non-recursive structure
    - Simplify policy logic to prevent circular dependencies
    - Add necessary indexes for performance
    
  2. Security
    - Maintain RLS protection
    - Ensure proper data isolation between companies
*/

-- First drop all existing policies
DROP POLICY IF EXISTS "Users can view their company" ON companies;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their company's projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects in their company" ON projects;
DROP POLICY IF EXISTS "Users can update their company's projects" ON projects;

-- Simplified company policies
CREATE POLICY "Companies are accessible by members"
  ON companies
  FOR ALL
  USING (
    id IN (
      SELECT company_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Simplified profile policies
CREATE POLICY "Profiles are accessible by company members"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM profiles AS my_profile
      WHERE my_profile.id = auth.uid()
      AND my_profile.company_id = profiles.company_id
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Simplified project policies
CREATE POLICY "Projects are accessible by company members"
  ON projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.company_id = projects.company_id
    )
  );

-- Optimize indexes for policy performance
DROP INDEX IF EXISTS idx_profiles_company;
DROP INDEX IF EXISTS idx_profiles_lookup;
DROP INDEX IF EXISTS idx_projects_company;
DROP INDEX IF EXISTS idx_projects_creator;

CREATE INDEX idx_profiles_user_company ON profiles(id, company_id);
CREATE INDEX idx_projects_company_access ON projects(company_id);

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_company_id uuid;
BEGIN
  -- First, create the company if it doesn't exist
  INSERT INTO companies (name, domain)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', split_part(NEW.email, '@', 2)),
    COALESCE(NEW.raw_user_meta_data->>'company_domain', split_part(NEW.email, '@', 2))
  )
  ON CONFLICT (domain) DO UPDATE
  SET updated_at = now()
  RETURNING id INTO v_company_id;

  -- Then create the profile
  INSERT INTO profiles (
    id,
    company_id,
    full_name,
    email,
    phone,
    role
  ) VALUES (
    NEW.id,
    v_company_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN EXISTS (SELECT 1 FROM profiles WHERE company_id = v_company_id) THEN 'member'
      ELSE 'admin'
    END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;