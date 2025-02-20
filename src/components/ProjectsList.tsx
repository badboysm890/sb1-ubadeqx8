import { useState, useEffect } from 'react';
import { MoreVertical, Users, Image as ImageIcon, Heart, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProjectStore } from '../stores/projectStore';
import { useInterval } from '../hooks/useInterval';
import { LoadingSpinner } from './LoadingSpinner';

export function ProjectsList() {
  const navigate = useNavigate();
  const { profile, settings } = useAuthStore();
  const { projects, loading, error, fetchProjects } = useProjectStore();
  const [isUploading, setIsUploading] = useState(false);

  // Initial fetch
  useEffect(() => {
    if (profile?.id) {
      fetchProjects();
    }
  }, [profile?.id, fetchProjects]);

  // Auto-refresh every 10 seconds if enabled and not uploading
  const { pause, resume } = useInterval(
    () => {
      if (profile?.id) {
        fetchProjects();
      }
    },
    settings.autoReload ? 10000 : null,
    isUploading
  );

  if (loading && !isUploading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md w-full">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Error Loading Projects</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => fetchProjects()}
            className="mt-6 text-[#1E293B] hover:text-[#2d3748] font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <button
          onClick={() => navigate('/projects/new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#2d3748] transition-colors"
        >
          New project
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Link 
            key={project.id} 
            to={`/projects/${project.id}`}
            className="block bg-white rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="flex gap-6 p-4">
              <img
                src={project.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop'}
                alt={project.name}
                className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.source_email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {project.source_domain}
                    </p>
                  </div>
                  <button 
                    className="text-gray-400 hover:text-gray-600 p-1"
                    onClick={(e) => {
                      e.preventDefault();
                      // Add your menu handling logic here
                    }}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{project.description}</p>
                <div className="flex gap-4 mt-4">
                  <button 
                    className="text-gray-400 hover:text-gray-600 p-1"
                    onClick={(e) => {
                      e.preventDefault();
                      // Add your action handling logic here
                    }}
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  <button 
                    className="text-gray-400 hover:text-gray-600 p-1"
                    onClick={(e) => {
                      e.preventDefault();
                      // Add your action handling logic here
                    }}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button 
                    className="text-gray-400 hover:text-gray-600 p-1"
                    onClick={(e) => {
                      e.preventDefault();
                      // Add your action handling logic here
                    }}
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}