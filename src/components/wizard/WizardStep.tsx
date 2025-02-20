import { cn } from '../../utils/cn';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface WizardStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
}

export function WizardStep({ 
  icon: Icon, 
  title, 
  description, 
  isActive, 
  isCompleted,
  stepNumber 
}: WizardStepProps) {
  return (
    <div className="relative">
      {/* Step indicator */}
      <div 
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center relative z-10",
          "transition-all duration-300 transform",
          isActive && "scale-110 ring-4 ring-[#1E293B]/20",
          isCompleted ? "bg-green-500" : isActive ? "bg-[#1E293B]" : "bg-gray-200"
        )}
      >
        <Icon className={cn(
          "w-5 h-5",
          isCompleted || isActive ? "text-white" : "text-gray-500"
        )} />
      </div>

      {/* Step content */}
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-xs font-medium",
            isActive ? "text-[#1E293B]" : "text-gray-400"
          )}>
            STEP {stepNumber}
          </span>
          <h3 className={cn(
            "text-sm font-semibold",
            isActive ? "text-[#1E293B]" : "text-gray-500"
          )}>
            {title}
          </h3>
        </div>
        <p className="text-xs text-gray-400 mt-1 max-w-[140px]">
          {description}
        </p>
      </div>
    </div>
  );
}