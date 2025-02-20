export interface DrawingType {
  id: string;
  name: string;
  isExpanded: boolean;
  isSelected: boolean;
}

export interface Drawing {
  id: string;
  name: string;
  level: string;
  imageUrl: string;
}

export interface AssetType {
  id: string;
  name: string;
  isExpanded: boolean;
  drawings: Record<string, Drawing>;
}

export const drawingTypes: DrawingType[] = [
  { id: 'plan', name: 'Plan drawings', isExpanded: true, isSelected: false },
  { id: 'section', name: 'Section drawings', isExpanded: true, isSelected: false },
  { id: 'elevation', name: 'Elevation drawings', isExpanded: true, isSelected: false },
  { id: 'detail', name: 'Detail drawings', isExpanded: true, isSelected: false },
  { id: 'schematic', name: 'Schematic drawings', isExpanded: true, isSelected: false },
  { id: 'specification', name: 'Specification documents', isExpanded: true, isSelected: false },
];

// Helper function to create drawings for each type
const createDrawingsMap = (prefix: string) => {
  const drawings: Record<string, Drawing> = {};
  drawingTypes.forEach((type) => {
    drawings[type.id] = {
      id: `${prefix}-${type.id}`,
      name: 'L0 - AW101',
      level: 'Level 0',
      imageUrl: 'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?q=80&w=1000&auto=format&fit=crop'
    };
  });
  return drawings;
};

export const assetTypes: AssetType[] = [
  {
    id: 'architectural',
    name: 'Architectural assets',
    isExpanded: true,
    drawings: createDrawingsMap('arch')
  },
  {
    id: 'structural',
    name: 'Structural assets',
    isExpanded: true,
    drawings: createDrawingsMap('struct')
  },
  {
    id: 'electrical',
    name: 'Electrical assets',
    isExpanded: true,
    drawings: createDrawingsMap('elec')
  }
];