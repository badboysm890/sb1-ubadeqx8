import { X, ChevronDown, ExternalLink, FolderIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    location: {
      level: string;
      category: string;
      type: string;
    };
    versions: {
      name: string;
      version: string;
    }[];
    details: {
      type: string;
      size: string;
      created: string;
      modified: string;
      owner: string;
      contentType: string[];
    };
  };
}

export function FileDetailsSidebar({ isOpen, onClose, file }: FileDetailsProps) {
  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-[480px] bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-30",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">{file.name}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="p-4">
          <img
            src="https://images.unsplash.com/photo-1574359411659-15573a27fd0c?q=80&w=1000&auto=format&fit=crop"
            alt={file.name}
            className="w-full aspect-[4/3] object-cover rounded-lg"
          />
        </div>

        {/* Tabs */}
        <div className="flex px-4 border-b">
          <button className="px-4 py-3 text-sm font-medium text-blue-500 border-b-2 border-blue-500">
            Details
          </button>
          <button className="px-4 py-3 text-sm font-medium text-gray-500">
            Markups
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* File Location */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">File location</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                  <FolderIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{file.location.level}</span>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                  <FolderIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{file.location.category}</span>
                </div>
                <div className="flex items-center gap-2 ml-12">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                  <FolderIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{file.location.type}</span>
                </div>
                <div className="ml-[4.5rem] space-y-2">
                  {file.versions.map((version, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                      <span className="text-sm">{version.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compare Versions Button */}
            <div className="flex justify-end">
              <button className="px-4 py-2 text-sm font-medium text-white bg-[#1E293B] rounded-lg hover:bg-[#2d3748] transition-colors">
                Compare versions
              </button>
            </div>

            {/* File Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">File details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">File name</span>
                  <span>{file.details.type}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Size</span>
                  <span>{file.details.size}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Date created</span>
                  <span>{file.details.created}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Date modified</span>
                  <span>{file.details.modified}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Owner</span>
                  <span>{file.details.owner}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-500">Content type</span>
                  <div className="space-y-1">
                    {file.details.contentType.map((type, index) => (
                      <span key={index} className="block">{type}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Files */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Connected files</h3>
                <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}