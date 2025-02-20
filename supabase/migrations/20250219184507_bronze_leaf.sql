/*
  # Add company setup tables and relationships

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `domain` (text, unique, not null)
      - `address` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to Existing Tables
    - Add `company_id` to profiles table
    - Add foreign key constraint from profiles to companies

  3. Security
    - Enable RLS on companies table
    - Add policies for viewing and managing companies
    - Update profile policies to work with company relationships
*/

-- Create companies table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE NOT NULL,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add company_id to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Company Policies
CREATE POLICY "Users can view their company"
  ON companies
  FOR SELECT
  USING (
    id IN (
      SELECT company_id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert companies"
  ON companies
  FOR INSERT
  WITH CHECK (true);

-- Update profile policies to work with company relationship
CREATE POLICY "Users can update their company_id"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);

-- Update handle_new_user function to work with company setup
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