import { useState } from 'react';
import { FileManager } from '../FileManager';
import { FileText, X, Upload } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileStructureStepProps {
  files: Array<{ file: File; path: string[] }>;
  onFileSelect: (files: Array<{ file: File; path: string[] }>) => void;
}

interface UploadProgress {
  fileName: string;
  progress: number;
}

export function FileStructureStep({ files, onFileSelect }: FileStructureStepProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).map(file => ({
      file,
      path: ['uploads']
    }));

    onFileSelect(droppedFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFileSelect(newFiles);
  };

  return (
    <div 
      className="space-y-6 animate-fadeIn"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Global drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#1E293B]/10 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
            <Upload className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1E293B]">Drop files here</h3>
            <p className="text-gray-500 mt-2">Files will be added to your project</p>
          </div>
        </div>
      )}

      <div className="flex gap-6 h-[400px]">
        {/* File manager */}
        <div className="flex-1">
          <FileManager 
            onFileSelect={onFileSelect}
            selectedFiles={files}
          />
        </div>

        {/* Selected files */}
        <div className="w-80 flex flex-col">
          <div className="bg-gray-50 rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Selected Files</h4>
              <span className="text-xs text-gray-500">{files.length} files</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[calc(100%-2rem)]">
              {files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No files selected</p>
                  <p className="text-xs mt-1">Drag & drop files or use the file manager</p>
                </div>
              ) : (
                files.map((file, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-center gap-2 text-sm text-gray-600",
                      "bg-white p-3 rounded-lg border border-gray-100",
                      "group relative"
                    )}
                  >
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">
                          {file.file.name}
                        </span>
                        <button
                          onClick={() => removeFile(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span>{(file.file.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span className="truncate">{file.path.join(' / ')}</span>
                      </div>
                      {uploadProgress[file.file.name] !== undefined && (
                        <div className="mt-2">
                          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#1E293B] transition-all duration-300"
                              style={{ width: `${uploadProgress[file.file.name]}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 mt-1">
                            {uploadProgress[file.file.name]}% uploaded
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}