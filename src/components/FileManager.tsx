import { useState, useRef } from 'react';
import { FolderPlus, File, ChevronRight, ChevronDown, Plus, Grid2X2, List, Upload, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileNode[];
  file?: File;
  path: string[];
}

interface FileManagerProps {
  onFileSelect: (files: { file: File; path: string[] }[]) => void;
  selectedFiles: Array<{ file: File; path: string[] }>;
}

export function FileManager({ onFileSelect, selectedFiles }: FileManagerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [structure, setStructure] = useState<FileNode[]>([
    {
      id: 'level-01',
      name: 'Level 01 - First floor',
      type: 'folder',
      path: ['Level 01 - First floor'],
      children: [
        {
          id: 'architectural',
          name: 'Architectural',
          type: 'folder',
          path: ['Level 01 - First floor', 'Architectural'],
          children: [
            {
              id: 'plan-drawings',
              name: 'Plan drawings',
              type: 'folder',
              path: ['Level 01 - First floor', 'Architectural', 'Plan drawings'],
              children: []
            }
          ]
        },
        {
          id: 'structural',
          name: 'Structural',
          type: 'folder',
          path: ['Level 01 - First floor', 'Structural'],
          children: [
            {
              id: 'plan-drawings-structural',
              name: 'Plan drawings',
              type: 'folder',
              path: ['Level 01 - First floor', 'Structural', 'Plan drawings'],
              children: []
            }
          ]
        }
      ]
    }
  ]);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['level-01']));
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounter = useRef(0);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetPath: string[]) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files);
    const fileNodes = files.map(file => ({
      file,
      path: targetPath
    }));

    onFileSelect(fileNodes);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent, targetPath: string[]) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    setIsDraggingFile(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    const fileNodes = files.map(file => ({
      file,
      path: targetPath
    }));

    onFileSelect(fileNodes);
  };

  const addNewFolder = (e: React.MouseEvent, parentPath: string[]) => {
    e.preventDefault();
    e.stopPropagation();
    
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    setStructure(prev => {
      const newStructure = [...prev];
      let current = newStructure;
      let target;

      for (const segment of parentPath) {
        target = current.find(node => node.name === segment);
        if (target?.children) {
          current = target.children;
        }
      }

      if (current) {
        const newFolder = {
          id: `folder-${Date.now()}`,
          name: folderName,
          type: 'folder',
          path: [...parentPath, folderName],
          children: []
        };
        current.push(newFolder);
        setExpandedFolders(prev => new Set([...prev, newFolder.id]));
      }

      return newStructure;
    });
  };

  const getFilesInFolder = (path: string[]) => {
    return selectedFiles.filter(file => 
      file.path.length === path.length && 
      file.path.every((segment, i) => segment === path[i])
    );
  };

  const removeFile = (file: { file: File; path: string[] }) => {
    onFileSelect(selectedFiles.filter(f => f.file !== file.file));
  };

  const renderNode = (node: FileNode, level = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedFolder === node.id;
    const isDragOver = dragOver === node.id;
    const filesInFolder = getFilesInFolder(node.path);
    const hasFiles = filesInFolder.length > 0;

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group",
            isSelected && "bg-gray-100",
            isDragOver && "bg-blue-50 border-2 border-dashed border-blue-200",
            !isDragOver && "border-2 border-transparent",
            hasFiles && "bg-blue-50/50"
          )}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (node.type === 'folder') {
              toggleFolder(node.id);
              setSelectedFolder(node.id);
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (node.type === 'folder') {
              setDragOver(node.id);
              if (!isExpanded) {
                toggleFolder(node.id);
              }
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (node.type === 'folder') {
              setDragOver(node.id);
            }
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOver(null);
          }}
          onDrop={(e) => handleDrop(e, node.path)}
        >
          {node.type === 'folder' && (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
          {node.type === 'folder' ? (
            <FolderPlus className={cn(
              "w-4 h-4",
              hasFiles ? "text-blue-500" : "text-gray-400"
            )} />
          ) : (
            <File className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm">{node.name}</span>
          
          {hasFiles && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
              {filesInFolder.length}
            </span>
          )}
          
          {node.type === 'folder' && (isSelected || isDragOver) && (
            <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => addNewFolder(e, node.path)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Plus className="w-4 h-4" />
              </button>
              <label className="p-1 hover:bg-gray-200 rounded cursor-pointer">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, node.path)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Upload className="w-4 h-4" />
              </label>
            </div>
          )}
        </div>
        
        {node.type === 'folder' && isExpanded && (
          <div>
            {node.children?.map(child => renderNode(child, level + 1))}
            {filesInFolder.length > 0 && (
              <div className="pl-8 py-1 space-y-1">
                {filesInFolder.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 group"
                  >
                    <File className="w-4 h-4 text-blue-500" />
                    <span className="truncate flex-1">{file.file.name}</span>
                    <span className="text-xs text-gray-400">
                      ({(file.file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      onClick={() => removeFile(file)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all"
                    >
                      <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="flex flex-col h-full"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {isDraggingFile && (
        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none z-10 backdrop-blur-sm">
          <div className="absolute inset-0 border-2 border-dashed border-blue-500 m-4 rounded-lg flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900">Drop files here</p>
              <p className="text-sm text-gray-500 mt-1">Files will be added to the selected folder</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Project Structure</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-1 rounded transition-colors",
              viewMode === 'grid' ? "bg-gray-100" : "hover:bg-gray-100"
            )}
          >
            <Grid2X2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              "p-1 rounded transition-colors",
              viewMode === 'list' ? "bg-gray-100" : "hover:bg-gray-100"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        className={cn(
          "flex-1 border rounded-lg overflow-y-auto",
          "bg-white shadow-sm"
        )}
      >
        <div className="p-2">
          {structure.map(node => renderNode(node))}
        </div>
      </div>
    </div>
  );
}