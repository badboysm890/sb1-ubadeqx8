import { useState } from 'react';
import { FileText, Image as ImageIcon, FolderTree, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '../utils/cn';
import { WizardStep } from './wizard/WizardStep';
import { ProjectDetailsStep } from './wizard/ProjectDetailsStep';
import { CoverImageStep } from './wizard/CoverImageStep';
import { FileStructureStep } from './wizard/FileStructureStep';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (data: { 
    name: string; 
    description: string;
    files: Array<{ file: File; path: string[] }>;
    coverImage?: string;
  }) => Promise<void>;
}

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
];

export function CreateProjectModal({ isOpen, onClose, onCreateProject }: CreateProjectModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    files: [] as Array<{ file: File; path: string[] }>,
    coverImage: SAMPLE_IMAGES[0]
  });

  if (!isOpen) return null;

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
    setLoading(true);
    try {
      await onCreateProject(formData);
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      files: [],
      coverImage: SAMPLE_IMAGES[0]
    });
    setCurrentStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl">
        <form onSubmit={handleSubmit} className="flex">
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
          <div className="flex-1 flex flex-col min-h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {steps[currentStep - 1].title}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step content */}
            <div className="flex-1 p-6">
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
            <div className="border-t p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    currentStep === 1 ? "invisible" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
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
                      {loading ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        <>
                          Create Project
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-[#1E293B] rounded-lg hover:bg-[#2d3748] transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}