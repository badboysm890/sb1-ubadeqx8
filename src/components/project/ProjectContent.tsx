import { useState, useMemo } from 'react';
import { TableHeader } from './TableHeader';
import { AssetRow } from './AssetRow';
import { FileDetailsSidebar } from './FileDetailsSidebar';
import { drawingTypes as initialDrawingTypes, assetTypes } from '../../data/projectData';

// Constants for layout
const COLUMN_WIDTH = 320;
const COLLAPSED_WIDTH = 48;

export function ProjectContent() {
  const [types, setTypes] = useState(initialDrawingTypes.map(type => ({ ...type, isSelected: false })));
  const [assets, setAssets] = useState(assetTypes);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isFileDetailsOpen, setIsFileDetailsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    assetId: string;
    typeId: string;
  } | null>(null);

  // Filter and sort types to show expanded ones first, then collapsed
  const sortedTypes = useMemo(() => {
    const expanded = types.filter(type => type.isExpanded);
    const collapsed = types.filter(type => !type.isExpanded);
    return [...expanded, ...collapsed];
  }, [types]);

  const toggleDrawingType = (id: string) => {
    setTypes(types.map(type => 
      type.id === id ? { ...type, isExpanded: !type.isExpanded } : type
    ));
  };

  const toggleTypeSelection = (id: string) => {
    setTypes(types.map(type => 
      type.id === id ? { ...type, isSelected: !type.isSelected } : type
    ));
    setSelectedTypes(prev => {
      if (prev.includes(id)) {
        return prev.filter(typeId => typeId !== id);
      }
      return [...prev, id];
    });
  };

  const toggleAssetType = (id: string) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, isExpanded: !asset.isExpanded } : asset
    ));
  };

  const handleImageClick = (assetId: string, typeId: string) => {
    setSelectedFile({ assetId, typeId });
    setIsFileDetailsOpen(true);
  };

  const getFileDetails = (assetId: string, typeId: string) => {
    const asset = assets.find(a => a.id === assetId);
    const drawing = asset?.drawings[typeId];
    const type = types.find(t => t.id === typeId);

    if (!asset || !drawing || !type) return null;

    return {
      name: drawing.name,
      location: {
        level: 'Level 01 - First floor',
        category: asset.name.replace(' assets', ''),
        type: type.name
      },
      versions: [
        { name: 'L1 - AW102 (Latest)', version: 'Latest version' },
        { name: 'L1 - AW102V1', version: 'Version 01' }
      ],
      details: {
        type: 'JPG',
        size: '251 KB',
        created: '03/11/2024',
        modified: '03/11/2024',
        owner: '@username',
        contentType: [type.name, 'Working drawing']
      }
    };
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-auto">
        <div className="p-6">
          <div className="overflow-x-auto">
            <div className="min-w-max space-y-6">
              <div className="sticky top-0 z-10 bg-gray-50 pb-4">
                <TableHeader 
                  types={sortedTypes}
                  activeType={activeType}
                  onToggle={toggleDrawingType}
                  onHover={setHoveredType}
                  onSelect={toggleTypeSelection}
                  columnWidth={COLUMN_WIDTH}
                  collapsedWidth={COLLAPSED_WIDTH}
                />
              </div>

              <div className="space-y-6">
                {assets.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    types={sortedTypes}
                    activeType={activeType}
                    selectedTypes={selectedTypes}
                    onToggle={() => toggleAssetType(asset.id)}
                    columnWidth={COLUMN_WIDTH}
                    collapsedWidth={COLLAPSED_WIDTH}
                    hoveredType={hoveredType}
                    onImageClick={() => handleImageClick(asset.id, sortedTypes[0].id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedFile && (
        <FileDetailsSidebar
          isOpen={isFileDetailsOpen}
          onClose={() => {
            setIsFileDetailsOpen(false);
            setSelectedFile(null);
          }}
          file={getFileDetails(selectedFile.assetId, selectedFile.typeId)!}
        />
      )}
    </div>
  );
}