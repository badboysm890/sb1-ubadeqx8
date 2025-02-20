/*
  # Complete Database Recreation
  
  1. Structure
    - Drop everything in correct order (policies, triggers, functions, tables)
    - Recreate tables with proper relationships
    - Add RLS and policies
    - Create efficient indexes
    
  2. Security
    - RLS enabled on all tables
    - Policies for proper data access
    - Company-based isolation
*/

-- First drop all policies
DROP POLICY IF EXISTS "Users can view their company" ON companies;
DROP POLICY IF EXISTS "Users can view profiles in their company" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their company's projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects in their company" ON projects;
DROP POLICY IF EXISTS "Users can update their company's projects" ON projects;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS ensure_company_exists ON profiles;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS ensure_valid_company();

-- Drop tables
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS companies;

-- Create companies table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE NOT NULL,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id),
  full_name text,
  email text NOT NULL,
  phone text,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  creator_id uuid NOT NULL REFERENCES profiles(id),
  name text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Company Policies
CREATE POLICY "Users can view their company"
  ON companies
  FOR SELECT
  USING (
    id = (
      SELECT company_id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Profile Policies
CREATE POLICY "Users can view profiles in their company"
  ON profiles
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Project Policies
CREATE POLICY "Users can view their company's projects"
  ON projects
  FOR SELECT
  USING (
    company_id = (
      SELECT company_id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects in their company"
  ON projects
  FOR INSERT
  WITH CHECK (
    company_id = (
      SELECT company_id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company's projects"
  ON projects
  FOR UPDATE
  USING (
    company_id = (
      SELECT company_id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Create efficient indexes
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_profiles_lookup ON profiles(id, company_id);
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_creator ON projects(creator_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create company and profile in a single transaction
  WITH new_company AS (
    INSERT INTO companies (name, domain)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'company_name', split_part(NEW.email, '@', 2)),
      COALESCE(NEW.raw_user_meta_data->>'company_domain', split_part(NEW.email, '@', 2))
    )
    RETURNING id
  )
  INSERT INTO profiles (
    id,
    company_id,
    full_name,
    email,
    phone
  )
  SELECT
    NEW.id,
    new_company.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  FROM new_company;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();