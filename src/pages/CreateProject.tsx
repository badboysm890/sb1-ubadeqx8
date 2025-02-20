import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image as ImageIcon, FolderTree } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useProjectStore } from '../stores/projectStore';
import { Dashboard } from './Dashboard';
import { WizardStep } from '../components/wizard/WizardStep';
import { ProjectDetailsStep } from '../components/wizard/ProjectDetailsStep';
import { CoverImageStep } from '../components/wizard/CoverImageStep';
import { FileStructureStep } from '../components/wizard/FileStructureStep';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { cn } from '../utils/cn';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
];

function CreateProjectContent() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { createProject } = useProjectStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    files: [] as Array<{ file: File; path: string[] }>,
    coverImage: SAMPLE_IMAGES[0]
  });

  const steps = [
    {
      icon: FileText,
      title: 'Project Details',
      description: 'Name and describe your project'
    },
    {
      icon: ImageIcon,
      title: 'Cover Image',
      description: 'Choose a cover image'
    },
    {
      icon: FolderTree,
      title: 'File Structure',
      description: 'Upload and organize files'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a project name');
      return;
    }

    if (!profile?.id || !profile.email) return;

    setLoading(true);
    try {
      const project = await createProject({
        ...formData,
        creator_id: profile.id,
        source_email: profile.email,
        source_domain: profile.email.split('@')[1],
      });

      // Navigate to the project details page
      navigate(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50">
      <div className="h-full max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl h-full">
          <form onSubmit={handleSubmit} className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 p-8 rounded-l-2xl border-r">
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <WizardStep
                    key={index}
                    icon={step.icon}
                    title={step.title}
                    description={step.description}
                    isActive={currentStep === index + 1}
                    isCompleted={currentStep > index + 1}
                    stepNumber={index + 1}
                  />
                ))}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-6 border-b bg-gray-50">
                <h2 className="text-xl font-semibold">
                  {steps[currentStep - 1].title}
                </h2>
              </div>

              {/* Step content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {currentStep === 1 && (
                  <ProjectDetailsStep
                    name={formData.name}
                    description={formData.description}
                    onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                  />
                )}

                {currentStep === 2 && (
                  <CoverImageStep
                    selectedImage={formData.coverImage}
                    onImageSelect={(image) => setFormData(prev => ({ ...prev, coverImage: image }))}
                    sampleImages={SAMPLE_IMAGES}
                  />
                )}

                {currentStep === 3 && (
                  <FileStructureStep
                    files={formData.files}
                    onFileSelect={(files) => setFormData(prev => ({
                      ...prev,
                      files: [...prev.files, ...files]
                    }))}
                  />
                )}
              </div>

              {/* Footer */}
              <div className="h-16 flex items-center justify-between px-6 border-t bg-gray-50">
                <button
                  type="button"
                  onClick={handleBack}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    currentStep === 1 ? "invisible" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/projects')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  {currentStep === steps.length ? (
                    <button
                      type="submit"
                      disabled={loading || !formData.name.trim()}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 text-sm font-medium text-white",
                        "bg-[#1E293B] rounded-lg hover:bg-[#2d3748] disabled:opacity-50",
                        "transition-all duration-200"
                      )}
                    >
                      {loading ? <LoadingSpinner size="small" /> : 'Create Project'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2 text-sm font-medium text-white bg-[#1E293B] rounded-lg hover:bg-[#2d3748] transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function CreateProject() {
  return (
    <Dashboard>
      <CreateProjectContent />
    </Dashboard>
  );
}