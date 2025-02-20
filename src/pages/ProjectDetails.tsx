import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project } from '../lib/supabase';
import { ProjectHeader } from '../components/project/ProjectHeader';
import { ProjectContent } from '../components/project/ProjectContent';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      if (!projectId) {
        navigate('/projects');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('projects')
          .select(`
            *,
            creator:creator_id (
              full_name,
              email
            )
          `)
          .eq('id', projectId)
          .single();

        if (supabaseError) throw supabaseError;
        
        if (!data) {
          throw new Error('Project not found');
        }

        if (isMounted) {
          setProject(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading project:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load project');
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId, navigate]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="text-center max-w-md w-full">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Error Loading Project</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="mt-6 text-[#1E293B] hover:text-[#2d3748] font-medium"
          >
            ← Return to projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="text-center max-w-md w-full">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
            <p className="text-sm">The requested project could not be found.</p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="mt-6 text-[#1E293B] hover:text-[#2d3748] font-medium"
          >
            ← Return to projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      <ProjectHeader project={project} />
      <div className="flex-1 min-h-0">
        <ProjectContent />
      </div>
    </div>
  );
}