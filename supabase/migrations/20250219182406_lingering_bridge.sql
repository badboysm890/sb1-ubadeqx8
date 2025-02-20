/*
  # Update User Registration Trigger

  1. Changes
    - Modified trigger to use metadata from auth.users
    - Added support for company_id from metadata
    - Added full_name and phone number handling

  2. Security
    - Maintained SECURITY DEFINER for proper access
    - Preserved existing RLS policies
*/

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  company_id uuid;
BEGIN
  -- Create profile with data from user metadata
  INSERT INTO profiles (
    id,
    email,
    company_id,
    full_name,
    phone
  )
  VALUES (
    NEW.id,
    NEW.email,
    (NEW.raw_user_meta_data->>'company_id')::uuid,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;