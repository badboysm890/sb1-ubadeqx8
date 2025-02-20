import { Image as ImageIcon, MoreVertical } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Drawing {
  id: string;
  name: string;
  level: string;
  imageUrl: string;
}

interface DrawingCardProps {
  drawing: Drawing;
  isActive: boolean;
  columnWidth: number;
  onImageClick: () => void;
}

export function DrawingCard({ drawing, isActive, columnWidth, onImageClick }: DrawingCardProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-lg shadow-sm overflow-hidden transition-opacity duration-200",
        isActive ? "opacity-100" : "opacity-50"
      )}
      style={{ width: '100%' }}
    >
      <div className="relative aspect-video bg-gray-100 cursor-pointer" onClick={onImageClick}>
        <img 
          src={drawing.imageUrl} 
          alt={drawing.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
          1/3
        </div>
        <div className="absolute bottom-2 right-2 bg-white rounded-full p-1">
          <button className="text-gray-600 hover:text-gray-800">
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-2 flex items-center justify-between">
        <span className="text-sm font-medium">{drawing.name}</span>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}