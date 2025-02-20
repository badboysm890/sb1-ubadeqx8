/*
  # Add URL column to files table

  1. Changes
    - Add `url` column to `files` table to store public URLs of uploaded files
*/

-- Add URL column to files table
ALTER TABLE files
ADD COLUMN url text NOT NULL;

-- Create index for faster URL lookups
CREATE INDEX idx_files_url ON files(url);