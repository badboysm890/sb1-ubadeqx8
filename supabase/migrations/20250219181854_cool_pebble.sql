/*
  # Initial Schema Setup for Company Management System

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `domain` (text, unique)
      - `name` (text)
      - `created_at` (timestamp)
      - `address` (text)

    - `profiles` (extends auth.users)
      - `id` (uuid, primary key, matches auth.users.id)
      - `full_name` (text)
      - `company_id` (uuid, references companies)
      - `email` (text)
      - `phone` (text)
      - `role` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `projects`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `company_id` (uuid, references companies)
      - `creator_id` (uuid, references auth.users)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for company-based access
    - Add policies for user profile management
    - Add policies for project management
*/

-- Create companies table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text UNIQUE NOT NULL,
  name text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  company_id uuid REFERENCES companies(id),
  email text NOT NULL,
  phone text,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  company_id uuid REFERENCES companies(id),
  creator_id uuid REFERENCES auth.users(id),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for companies
CREATE POLICY "Users can view their own company"
  ON companies
  FOR SELECT
  USING (
    id IN (
      SELECT company_id 
      FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Create policies for profiles
CREATE POLICY "Users can view profiles in their company"
  ON profiles
  FOR SELECT
  USING (
    company_id IN (
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

-- Create policies for projects
CREATE POLICY "Users can view projects in their company"
  ON projects
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects for their company"
  ON projects
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update projects in their company"
  ON projects
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  domain_part text;
  company_id uuid;
BEGIN
  -- Extract domain from email
  domain_part := split_part(NEW.email, '@', 2);
  
  -- Get or create company
  INSERT INTO companies (domain, name)
  VALUES (domain_part, domain_part)
  ON CONFLICT (domain) DO NOTHING
  RETURNING id INTO company_id;
  
  -- If company already existed, get its id
  IF company_id IS NULL THEN
    SELECT id INTO company_id
    FROM companies
    WHERE domain = domain_part;
  END IF;
  
  -- Create profile
  INSERT INTO profiles (id, email, company_id)
  VALUES (NEW.id, NEW.email, company_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_creator_id ON projects(creator_id);