import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Tables = Database['public']['Tables'];
export type Company = Tables['companies']['Row'];
export type Profile = Tables['profiles']['Row'];
export type Project = Tables['projects']['Row'];
export type File = Tables['files']['Row'];

interface UploadProgress {
  fileName: string;
  progress: number;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

export async function uploadProjectFile(
  file: File, 
  projectId: string,
  folderPath: string[],
  onProgress?: UploadProgressCallback
) {
  try {
    // Create a unique file path including project ID and folder structure
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${projectId}/${folderPath.join('/')}/${fileName}`;

    // Upload file to Supabase Storage with progress tracking
    const { data: storageData, error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          if (onProgress) {
            onProgress({
              fileName: file.name,
              progress: (progress.loaded / progress.total) * 100
            });
          }
        }
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('project-files')
      .getPublicUrl(filePath);

    // Insert file metadata
    const { error: dbError } = await supabase
      .from('files')
      .insert({
        project_id: projectId,
        creator_id: (await supabase.auth.getUser()).data.user?.id,
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
        url: publicUrlData.publicUrl
      });

    if (dbError) throw dbError;

    return {
      path: filePath,
      url: publicUrlData.publicUrl
    };
  } catch (error) {
    console.error(`Error uploading file ${file.name}:`, error);
    throw error;
  }
}

export async function createProjectWithFiles(
  projectData: {
    name: string;
    description: string;
    creator_id: string;
    source_email: string;
    source_domain: string;
    files: Array<{ file: File; path: string[] }>;
  },
  onProgress?: UploadProgressCallback
) {
  try {
    // First create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description,
        creator_id: projectData.creator_id,
        source_email: projectData.source_email,
        source_domain: projectData.source_domain,
        image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop'
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Then upload all files
    for (const { file, path } of projectData.files) {
      try {
        await uploadProjectFile(file, project.id, path, onProgress);
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    return project;
  } catch (error) {
    // If anything fails, ensure we clean up any created resources
    throw error;
  }
}

export async function getProjectFiles(projectId: string) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteProjectFile(filePath: string) {
  // First delete from storage
  const { error: storageError } = await supabase.storage
    .from('project-files')
    .remove([filePath]);

  if (storageError) throw storageError;

  // Then delete metadata from database
  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('path', filePath);

  if (dbError) throw dbError;
}