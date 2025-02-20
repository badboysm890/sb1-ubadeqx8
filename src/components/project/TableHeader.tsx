import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useState } from 'react';

interface DrawingType {
  id: string;
  name: string;
  isExpanded: boolean;
  isSelected: boolean;
}

interface TableHeaderProps {
  types: DrawingType[];
  activeType: string | null;
  onToggle: (id: string) => void;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  columnWidth: number;
  collapsedWidth: number;
}

export function TableHeader({ 
  types, 
  activeType, 
  onToggle, 
  onHover, 
  onSelect,
  columnWidth,
  collapsedWidth
}: TableHeaderProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  return (
    <div className="flex gap-2">
      {types.map((type) => {
        const isHovered = hoveredType === type.id;
        const showExpanded = type.isExpanded || isHovered;

        return (
          <div
            key={type.id}
            className="transition-all duration-200"
            style={{ 
              width: showExpanded ? columnWidth : collapsedWidth,
              flexShrink: 0
            }}
          >
            <button
              onClick={(e) => {
                if (e.shiftKey) {
                  onSelect(type.id);
                } else {
                  onToggle(type.id);
                }
              }}
              onMouseEnter={() => {
                setHoveredType(type.id);
                onHover(type.id);
              }}
              onMouseLeave={() => {
                setHoveredType(null);
                onHover(null);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 transition-colors rounded-lg w-full",
                type.isSelected ? "bg-[#1E293B] text-white" : 
                activeType === type.id ? "bg-[#1E293B]/10" : 
                "bg-gray-100 hover:bg-gray-200",
                !showExpanded && "justify-center"
              )}
            >
              {showExpanded ? (
                <>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">{type.name}</span>
                </>
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}