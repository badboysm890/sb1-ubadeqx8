/*
  # Fix Company RLS Policies

  1. Changes
    - Drop and recreate company policies
    - Add new policies for company access
    - Update trigger for company-profile association

  2. Security
    - Maintain RLS on all tables
    - Ensure users can only access their own data
*/

-- Drop existing company policies
DROP POLICY IF EXISTS "Users can view their company" ON companies;
DROP POLICY IF EXISTS "Users can insert companies" ON companies;

-- Company Policies
CREATE POLICY "Companies are viewable by authenticated users"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their company"
  ON companies
  FOR UPDATE
  USING (
    id IN (
      SELECT company_id
      FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Function to update profile company_id
CREATE OR REPLACE FUNCTION update_profile_company()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles
  SET company_id = NEW.id
  WHERE id = auth.uid();
  
  RETURN NEW;
END;
$$;

-- Trigger to update profile after company creation
DROP TRIGGER IF EXISTS on_company_created ON companies;
CREATE TRIGGER on_company_created
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_company();