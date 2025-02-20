/*
  # Simplified User and Projects Schema
  
  1. Changes
    - Remove all company-related functionality
    - Direct user-project relationship
    - Track project source information
    
  2. Security
    - Users can only access their own data
    - Simple ownership-based policies
*/

-- Drop triggers first to avoid dependency issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Drop tables in correct order
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id),
  name text NOT NULL,
  description text,
  image_url text,
  source_email text NOT NULL,
  source_domain text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Profile Policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Project Policies
CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  USING (creator_id = auth.uid());

CREATE POLICY "Users can create their own projects"
  ON projects
  FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Create efficient indexes
CREATE INDEX idx_projects_creator ON projects(creator_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();