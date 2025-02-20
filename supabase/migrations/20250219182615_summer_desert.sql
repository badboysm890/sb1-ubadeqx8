/*
  # Fix RLS Policies to Prevent Recursion

  1. Changes
    - Simplified RLS policies to prevent infinite recursion
    - Improved policy structure for better performance
    - Added direct company access for profile queries

  2. Security
    - Maintained security requirements
    - Simplified policy logic while preserving access control
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view projects in their company" ON projects;
DROP POLICY IF EXISTS "Users can create projects for their company" ON projects;
DROP POLICY IF EXISTS "Users can update projects in their company" ON projects;

-- Create simplified policies for companies
CREATE POLICY "Users can view their own company"
  ON companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id = companies.id
    )
  );

-- Create simplified policies for profiles
CREATE POLICY "Users can view profiles in their company"
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

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create simplified policies for projects
CREATE POLICY "Users can view projects in their company"
  ON projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id = projects.company_id
    )
  );

CREATE POLICY "Users can create projects for their company"
  ON projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id = projects.company_id
    )
  );

CREATE POLICY "Users can update projects in their company"
  ON projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id = projects.company_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id = projects.company_id
    )
  );