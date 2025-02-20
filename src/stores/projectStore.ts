import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '../lib/supabase';
import type { Project } from '../lib/supabase';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface CreateProjectData {
  name: string;
  description: string;
  files: Array<{ file: File; path: string[] }>;
  creator_id: string;
  source_email: string;
  source_domain: string;
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    fetchProjects: async () => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        set((state) => { state.projects = data || [] });
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to fetch projects' });
      } finally {
        set({ loading: false });
      }
    },

    fetchProject: async (id) => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            creator:creator_id (
              full_name,
              email
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        set((state) => { state.currentProject = data });
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to fetch project' });
      } finally {
        set({ loading: false });
      }
    },

    createProject: async (data) => {
      set({ loading: true, error: null });
      try {
        // First create the project
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .insert({
            name: data.name,
            description: data.description,
            creator_id: data.creator_id,
            source_email: data.source_email,
            source_domain: data.source_domain,
            image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop'
          })
          .select()
          .single();

        if (projectError) throw projectError;

        // Then upload all files
        for (const { file, path } of data.files) {
          try {
            // Create a unique file path including project ID and folder structure
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${project.id}/${path.join('/')}/${fileName}`;

            // Upload the file to storage
            const { error: uploadError } = await supabase.storage
              .from('project-files')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data: urlData } = supabase.storage
              .from('project-files')
              .getPublicUrl(filePath);

            // Create file record in the database
            const { error: fileError } = await supabase
              .from('files')
              .insert({
                project_id: project.id,
                creator_id: data.creator_id,
                name: file.name,
                size: file.size,
                type: file.type,
                path: filePath,
                url: urlData.publicUrl
              });

            if (fileError) throw fileError;
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            // Continue with other files even if one fails
          }
        }

        // Update the projects list
        set((state) => {
          state.projects.unshift(project);
        });

        return project;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to create project';
        set({ error });
        throw new Error(error);
      } finally {
        set({ loading: false });
      }
    },

    updateProject: async (id, data) => {
      set({ loading: true, error: null });
      try {
        const { data: updated, error } = await supabase
          .from('projects')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        set((state) => {
          const index = state.projects.findIndex(p => p.id === id);
          if (index !== -1) {
            state.projects[index] = updated;
          }
          if (state.currentProject?.id === id) {
            state.currentProject = updated;
          }
        });
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to update project' });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    deleteProject: async (id) => {
      set({ loading: true, error: null });
      try {
        // First delete all files from storage
        const { data: files } = await supabase
          .from('files')
          .select('path')
          .eq('project_id', id);

        if (files) {
          for (const file of files) {
            await supabase.storage
              .from('project-files')
              .remove([file.path]);
          }
        }

        // Then delete the project (this will cascade delete files records)
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => {
          state.projects = state.projects.filter(p => p.id !== id);
          if (state.currentProject?.id === id) {
            state.currentProject = null;
          }
        });
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to delete project' });
        throw err;
      } finally {
        set({ loading: false });
      }
    },
  }))
);