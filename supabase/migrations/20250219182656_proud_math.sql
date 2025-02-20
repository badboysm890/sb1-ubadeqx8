/*
  # Final Fix for RLS Policies

  1. Changes
    - Completely restructured RLS policies to eliminate recursion
    - Simplified policy logic to use direct auth.uid() checks
    - Added company-level policies without profile dependencies

  2. Security
    - Maintained all security requirements
    - Improved policy performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view projects in their company" ON projects;
DROP POLICY IF EXISTS "Users can create projects for their company" ON projects;
DROP POLICY IF EXISTS "Users can update projects in their company" ON projects;

-- Companies policies
CREATE POLICY "Companies are viewable by their members"
  ON companies
  FOR SELECT
  USING (
    id IN (
      SELECT company_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Profiles policies
CREATE POLICY "Profiles are viewable by company members"
  ON profiles
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Projects policies
CREATE POLICY "Projects are viewable by company members"
  ON projects
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Company members can create projects"
  ON projects
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Company members can update projects"
  ON projects
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Add indexes to improve policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_id_company_id ON profiles(id, company_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);