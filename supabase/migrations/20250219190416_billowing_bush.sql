/*
  # Add files table for project attachments

  1. New Tables
    - `files`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `creator_id` (uuid, references profiles)
      - `name` (text)
      - `size` (bigint)
      - `type` (text)
      - `path` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `files` table
    - Add policies for authenticated users to manage their files
*/

-- Create files table
CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles(id),
  name text NOT NULL,
  size bigint NOT NULL,
  type text NOT NULL,
  path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- File Policies
CREATE POLICY "Users can view files they have access to"
  ON files
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload files to their projects"
  ON files
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own files"
  ON files
  FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY "Users can delete their own files"
  ON files
  FOR DELETE
  USING (creator_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_files_project ON files(project_id);
CREATE INDEX idx_files_creator ON files(creator_id);