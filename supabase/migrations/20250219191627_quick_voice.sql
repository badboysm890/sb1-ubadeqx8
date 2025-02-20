/*
  # Update storage policies for project files

  1. Changes
    - Add storage policies to restrict file access to project owners
    - Users can only view/download files from their own projects
    - Users can only upload files to their own projects
    - Users can only update/delete their own files

  2. Security
    - Enable RLS for storage bucket
    - Add policies for SELECT, INSERT, UPDATE, and DELETE operations
*/

-- Create storage policies for project-files bucket
BEGIN;

-- Policy for viewing/downloading files
CREATE POLICY "Users can view their own project files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'project-files' AND
  (auth.role() = 'authenticated') AND
  (EXISTS (
    SELECT 1 FROM files
    JOIN projects ON files.project_id = projects.id
    WHERE 
      files.path = storage.objects.name AND
      projects.creator_id = auth.uid()
  ))
);

-- Policy for uploading files
CREATE POLICY "Users can upload files to their own projects"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' AND
  (auth.role() = 'authenticated') AND
  (EXISTS (
    SELECT 1 FROM projects
    WHERE 
      projects.id = (SELECT project_id FROM files WHERE path = storage.objects.name LIMIT 1) AND
      projects.creator_id = auth.uid()
  ))
);

-- Policy for updating files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'project-files' AND
  (auth.role() = 'authenticated') AND
  (EXISTS (
    SELECT 1 FROM files
    JOIN projects ON files.project_id = projects.id
    WHERE 
      files.path = storage.objects.name AND
      projects.creator_id = auth.uid()
  ))
);

-- Policy for deleting files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'project-files' AND
  (auth.role() = 'authenticated') AND
  (EXISTS (
    SELECT 1 FROM files
    JOIN projects ON files.project_id = projects.id
    WHERE 
      files.path = storage.objects.name AND
      projects.creator_id = auth.uid()
  ))
);

COMMIT;