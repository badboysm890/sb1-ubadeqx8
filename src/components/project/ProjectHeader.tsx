import { Search, Plus } from 'lucide-react';
import type { Project } from '../../lib/supabase';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="flex-none p-6 bg-gray-50 border-b sticky top-0 z-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-xl font-semibold">{project.name}</h1>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E293B]">
            <option>All Levels</option>
            <option>Level 0</option>
            <option>Level 1</option>
            <option>Level 2</option>
          </select>
          <select className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E293B]">
            <option>All Spaces</option>
            <option>Common Areas</option>
            <option>Offices</option>
            <option>Meeting Rooms</option>
          </select>
          <select className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E293B]">
            <option>All Elements</option>
            <option>Walls</option>
            <option>Doors</option>
            <option>Windows</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#2d3748] transition-colors">
            <Plus className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}