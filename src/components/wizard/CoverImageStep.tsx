import { Image as ImageIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CoverImageStepProps {
  selectedImage: string;
  onImageSelect: (image: string) => void;
  sampleImages: string[];
}

export function CoverImageStep({ selectedImage, onImageSelect, sampleImages }: CoverImageStepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-3 gap-6">
        {sampleImages.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onImageSelect(image)}
            className={cn(
              "relative aspect-video rounded-xl overflow-hidden group",
              "transition-all duration-300 transform hover:scale-105",
              selectedImage === image ? 'ring-4 ring-[#1E293B]' : 'ring-1 ring-gray-200'
            )}
          >
            <img
              src={image}
              alt={`Sample ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className={cn(
              "absolute inset-0 bg-black/50 flex items-center justify-center",
              "transition-opacity duration-200",
              selectedImage === image ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}>
              <span className="text-white font-medium">
                {selectedImage === image ? 'Selected' : 'Select'}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">or</span>
        </div>
      </div>

      <div className="mt-4">
        <div 
          className={cn(
            "border-2 border-dashed border-gray-300 rounded-xl p-8",
            "transition-all duration-200 hover:border-[#1E293B] hover:bg-gray-50",
            "cursor-pointer group"
          )}
        >
          <input type="file" className="hidden" accept="image/*" />
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#1E293B] transition-colors" />
            <p className="mt-2">
              <span className="text-[#1E293B] font-medium">Upload a file</span>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}