/*
  # Restructure Database for Company-User Management

  1. Changes
    - Simplified company-user relationship
    - Streamlined RLS policies
    - Added necessary indexes
    - Improved policy performance

  2. Security
    - Direct user-company relationship
    - Clear access boundaries
    - Optimized query paths
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Companies are viewable by their members" ON companies;
DROP POLICY IF EXISTS "Profiles are viewable by company members" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Projects are viewable by company members" ON projects;
DROP POLICY IF EXISTS "Company members can create projects" ON projects;
DROP POLICY IF EXISTS "Company members can update projects" ON projects;

-- Simplified company policies
CREATE POLICY "Users can view their company"
  ON companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.company_id = companies.id
      AND profiles.id = auth.uid()
    )
  );

-- Simplified profile policies
CREATE POLICY "Users can view company profiles"
  ON profiles
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Simplified project policies
CREATE POLICY "Users can view company projects"
  ON projects
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create company projects"
  ON projects
  FOR INSERT
  WITH CHECK (
    company_id = (
      SELECT company_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update company projects"
  ON projects
  FOR UPDATE
  USING (
    company_id = (
      SELECT company_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Optimize indexes
DROP INDEX IF EXISTS idx_profiles_id_company_id;
DROP INDEX IF EXISTS idx_projects_company_id;

CREATE INDEX idx_profiles_lookup ON profiles(id, company_id);
CREATE INDEX idx_company_profiles ON profiles(company_id) INCLUDE (id);
CREATE INDEX idx_company_projects ON projects(company_id, creator_id);

-- Add function to ensure company exists before profile creation
CREATE OR REPLACE FUNCTION ensure_valid_company()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM companies WHERE id = NEW.company_id
  ) THEN
    RAISE EXCEPTION 'Company does not exist';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate company existence
DROP TRIGGER IF EXISTS ensure_company_exists ON profiles;
CREATE TRIGGER ensure_company_exists
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_valid_company();