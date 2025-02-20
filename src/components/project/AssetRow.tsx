import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { DrawingCard } from './DrawingCard';

interface DrawingType {
  id: string;
  name: string;
  isExpanded: boolean;
  isSelected: boolean;
}

interface Drawing {
  id: string;
  name: string;
  level: string;
  imageUrl: string;
}

interface AssetType {
  id: string;
  name: string;
  isExpanded: boolean;
  drawings: Record<string, Drawing>;
}

interface AssetRowProps {
  asset: AssetType;
  types: DrawingType[];
  activeType: string | null;
  selectedTypes: string[];
  onToggle: () => void;
  columnWidth: number;
  collapsedWidth: number;
  hoveredType: string | null;
  onImageClick: (typeId: string) => void;
}

export function AssetRow({ 
  asset, 
  types, 
  activeType, 
  selectedTypes,
  onToggle, 
  columnWidth,
  collapsedWidth,
  hoveredType,
  onImageClick
}: AssetRowProps) {
  const isTypeVisible = (typeId: string) => {
    return selectedTypes.length === 0 || selectedTypes.includes(typeId);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 transition-colors rounded-lg"
      >
        {asset.isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">{asset.name}</span>
      </button>
      
      {asset.isExpanded && (
        <div className="flex gap-2">
          {types.map((type) => {
            const showExpanded = type.isExpanded || hoveredType === type.id;
            
            return (
              <div 
                key={type.id}
                className={cn(
                  "transition-all duration-200",
                  !isTypeVisible(type.id) && "opacity-25"
                )}
                style={{ 
                  width: showExpanded ? columnWidth : collapsedWidth,
                  flexShrink: 0
                }}
              >
                {showExpanded && (
                  <DrawingCard 
                    drawing={asset.drawings[type.id]}
                    isActive={isTypeVisible(type.id) && (activeType === null || activeType === type.id)}
                    columnWidth={columnWidth}
                    onImageClick={() => onImageClick(type.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}