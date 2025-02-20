import { cn } from '../../utils/cn';

interface ProjectDetailsStepProps {
  name: string;
  description: string;
  onChange: (field: 'name' | 'description', value: string) => void;
}

export function ProjectDetailsStep({ name, description, onChange }: ProjectDetailsStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Project name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          className={cn(
            "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg",
            "focus:ring-2 focus:ring-[#1E293B] focus:border-transparent",
            "transition-shadow placeholder:text-gray-400"
          )}
          placeholder="Enter project name"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={4}
          className={cn(
            "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg",
            "focus:ring-2 focus:ring-[#1E293B] focus:border-transparent",
            "transition-shadow placeholder:text-gray-400 resize-none"
          )}
          placeholder="Describe your project"
          required
        />
      </div>
    </div>
  );
}